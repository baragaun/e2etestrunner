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
import mergeVars from './helpers/mergeVars';
import replaceVarsInObject from './helpers/replaceVarsInObject';
import replaceVars from './helpers/replaceVars';
import fetchJson from './helpers/fetchJson';
// @ts-ignore
import jsonpath from 'jsonpath';
import validateValue from './helpers/validateValue';
import logger from './helpers/logger';

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

    for (let i = 0; i < this.config.sequences.length; i++) {
      const sequence = this.config.sequences[i];
      for (let j = 0; j < sequence.tests.length; j++) {
        if (sequence.tests[j].enabled === undefined || sequence.tests[j].enabled) {
          results = await this.runTest(sequence.tests[j], sequence, this.config, results);
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
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTestSuite.runTest called', { test, sequence, suite });

    return new Promise((resolve, reject) => {
      const run = () => {
        switch (test.type) {
          case E2eTestType.jsonHttpRequest:
            this.runJsonHttpRequest(test as JsonHttpRequestE2eTestConfig, sequence, suite, results)
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
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTestSuite.runJsonHttpRequest called',
      { test, sequence, suite });

    const testName = `${sequence.name}.${test.name}`;
    let vars = mergeVars(suite.vars, sequence.vars);
    vars = mergeVars(vars, test.vars);

    let headers = mergeVars(suite.headers, sequence.headers);
    headers = replaceVarsInObject(mergeVars(headers, test.headers), vars);

    const requestConfig: HttpRequestConfig = {
      url: replaceVars(test.endpoint || sequence.endpoint || suite.endpoint || '', vars),
      method: sequence.method || test.method,
      headers,
      data: test.data ? replaceVars(test.data, vars) : '',
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
        if (value) {
          if (readVar.scope === 'suite') {
            if (suite.vars) {
              suite.vars[readVar.name] = value;
            } else {
              suite.vars = { [readVar.name]: value };
            }
          } else if (readVar.scope === 'sequence') {
            if (sequence.vars) {
              sequence.vars[readVar.name] = value;
            } else {
              sequence.vars = { [readVar.name]: value };
            }
          }
        }
      });
    }

    if (Array.isArray(test.response?.checks) && test.response?.checks.length > 0) {
      test.response?.checks
        .filter((check) => check.enabled === undefined || check.enabled)
        .forEach((check) => {
          let value: string | undefined = undefined;
          try {
            const values = jsonpath.query(data, check.jsonPath);
            if (Array.isArray(values) && values.length === 1) {
              value = values[0];
            }
            let targetValue: string | undefined;
            if (check.targetVar && vars) {
              targetValue = vars[check.targetVar];
            }
            results.push(validateValue(`${testName}.${check.name}`, value, check, targetValue));
          } catch (error) {
            logger.error('BgE2eTestSuite.runJsonHttpRequest: error', { test, error });
          }
        });
    }

    return results;
  }
}
