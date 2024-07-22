// @ts-ignore
import jsonpath from 'jsonpath';

import {
  E2eTestConfig,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestSuiteResult,
  E2eTestType,
  HttpRequestConfig,
  JsonHttpRequestE2eTestConfig, LogLevel,
  TestResult,
} from './definitions';
import assignVar from './helpers/assignVar';
import fetchJson from './helpers/fetchJson';
import logger from './helpers/logger';
import mergeHeaders from './helpers/mergeHeaders';
import mergeVars from './helpers/mergeVars';
import replaceVars from './helpers/replaceVars';
import replaceVarsInObject from './helpers/replaceVarsInObject';
import validateValue from './helpers/validateValue';

export class BgE2eTestSuite {
  protected config: E2eTestSuiteConfig;

  constructor(config: E2eTestSuiteConfig) {
    this.config = config;
  }

  public async run(config?: E2eTestSuiteConfig, logLevel?: LogLevel): Promise<E2eTestSuiteResult> {
    logger.trace('BgE2eTestSuite.run called', { config });

    if (config) {
      this.config = config;
    }

    if (logLevel) {
      logger.setLogLevel(logLevel);
    }

    let results: TestResult[] = [];

    for (let sequenceIdx = 0; sequenceIdx < this.config.sequences.length; sequenceIdx++) {
      const sequence = this.config.sequences[sequenceIdx];
      if (sequence.enabled === undefined || sequence.enabled) {
        for (let testIdx = 0; testIdx < sequence.tests.length; testIdx++) {
          const test = sequence.tests[testIdx];
          if (test.enabled === undefined || test.enabled) {
            if (test.repeat && !Number.isNaN(test.repeat)) {
              for (let iterationIndex = 0; iterationIndex < test.repeat; iterationIndex++) {
                results = await this.runTest(
                  test,
                  sequence,
                  this.config,
                  iterationIndex,
                  results,
                );
              }
            } else {
              results = await this.runTest(
                test,
                sequence,
                this.config,
                undefined,
                results,
              );
            }
          }
        }
      }
    }

    const passed = !results.some((r) => !r.passed);

    return { passed, checks: results };
  }

  protected async runTest(
    test: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    iterationIndex: number | undefined,
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTestSuite.runTest called', { test, sequence, suite });

    return new Promise((resolve, reject) => {
      const run = () => {
        switch (test.type) {
          case E2eTestType.jsonHttpRequest:
            this.runJsonHttpRequest(test as JsonHttpRequestE2eTestConfig, sequence, suite, iterationIndex, results)
              .then((results) => {
                if (test.waitMilliSecondsAfter) {
                  setTimeout(() => {
                    resolve(results);
                  }, test.waitMilliSecondsAfter || 2000);
                  return;
                }
                resolve(results);
              }, reject);
            return;
          case E2eTestType.wait:
            setTimeout(
              () => {
                resolve(results);
              },
              test.waitMilliSecondsAfter || test.waitMilliSecondsBefore || 2000
            );
            return;
        }
        logger.error('BgE2eTestSuite.runTest: unknown type', { test });
        reject('unknown test type');
      };

      if (test.waitMilliSecondsBefore) {
        setTimeout(run, test.waitMilliSecondsBefore);
        return;
      }

      run();
    });
  }

  protected async runJsonHttpRequest(
    test: JsonHttpRequestE2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    iterationIndex: number | undefined,
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTestSuite.runJsonHttpRequest called',
      { test, sequence, suite });

    const testName = `${sequence.name}.${test.name}`;
    let vars = mergeVars(suite.vars, sequence.vars);
    vars = mergeVars(vars, test.vars);

    let headers = mergeHeaders(suite.headers, sequence.headers);
    headers = replaceVarsInObject(mergeHeaders(headers, test.headers), vars, iterationIndex);

    const requestConfig: HttpRequestConfig = {
      url: replaceVars(test.endpoint || sequence.endpoint || suite.endpoint || '', vars, iterationIndex),
      method: sequence.method || test.method,
      headers,
      data: test.data ? replaceVars(test.data, vars, iterationIndex) : '',
    };

    const { response, data, error } = await fetchJson(requestConfig);

    if (error) {
      results.push({ name: testName, passed: false, error: `error-in-response: ${error}; data: ${data || ''}` });
      return results;
    }

    if (!response) {
      results.push({ name: testName, passed: false, error: `error-response: empty` });
      return results;
    }

    if (!data) {
      results.push({ name: testName, passed: false, error: 'no-data-in-response' });
      return results;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      results.push({ name: testName, passed: false, error: `error-response: ${data.errors.join(', ')}` });
      return results;
    }

    if (Array.isArray(test.response?.readVars) && test.response?.readVars.length > 0) {
      test.response?.readVars.forEach((readVar) => {
        let value: string | undefined = undefined;
        try {
          const values = jsonpath.query(data, readVar.jsonPath);
          if (Array.isArray(values) && values.length === 1) {
            value = values[0];
          }
        } catch (error) {
          logger.error('BgE2eTestSuite.runJsonHttpRequest: error', { test, error });
        }
        assignVar(
          readVar.name,
          value,
          iterationIndex,
          readVar.scope === 'suite' ? suite.vars : sequence.vars,
        );
      });
    }

    if (Array.isArray(test.response?.checks) && test.response?.checks.length > 0) {
      test.response?.checks
        .filter((check) => check.enabled === undefined || check.enabled)
        .forEach((check) => {
          try {
            const checkName = Number.isNaN(iterationIndex)
              ? `${testName}.${check.name}`
              : `${testName}.${check.name}[${(iterationIndex as number).toString()}]`

            let value: string | undefined = undefined;
            const values = jsonpath.query(data, check.jsonPath);
            if (Array.isArray(values) && values.length === 1) {
              value = values[0];
            }

            if (check.targetVar) {
              // We will compare the actual value with a variable:
              if (!Array.isArray(vars) || vars.length > 0) {
                results.push({
                  name: testName,
                  passed: false,
                  error: 'no-vars-available',
                });
                return;
              }

              const varName = check.targetVar.endsWith('[idx]')
                ? check.targetVar.substring(0, -5)
                : check.targetVar;
              const va = vars.find(v => v.name === varName)

              if (!va) {
                logger.error('BgE2ETestSuite.runJsonHttpRequest: did not find target var',
                  { check, varName });
                results.push({
                  name: checkName,
                  passed: false,
                  error: 'var-not-found',
                });
                return;
              }

              if (Array.isArray(va.value)) {
                if ((iterationIndex || 0) > va.value.length - 1) {
                  logger.error('BgE2ETestSuite.runJsonHttpRequest: target var index out of bounds', { check });
                  results.push({
                    name: checkName,
                    passed: false,
                    error: 'var-index-out-of-bounds',
                  });
                  return;
                }

                results.push(validateValue(checkName, value, check, va.value[iterationIndex || 0]));
                return;
              }

              results.push(validateValue(checkName, value, check, va.value));
              return;
            }

            results.push(validateValue(checkName, value, check, undefined));
          } catch (error) {
            logger.error('BgE2eTestSuite.runJsonHttpRequest: error', { test, error });
          }
        });
    }

    return results;
  }
}
