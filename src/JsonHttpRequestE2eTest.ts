import { BgE2eTest } from './BgE2eTest';
import {
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
  HttpRequestConfig,
  JsonHttpRequestE2eTestConfig,
  TestResult,
} from './definitions';
import fetchJson from './helpers/fetchJson';
import logger from './helpers/logger';
import mergeHeaders from './helpers/mergeHeaders';
import replaceVars from './helpers/replaceVars';
import replaceVarsInObject from './helpers/replaceVarsInObject';
import assignVars from './helpers/assignVars';
import performChecks from './helpers/performChecks';

export class JsonHttpRequestE2eTest extends BgE2eTest {
  protected async runOnce(
    testName: string,
    test: JsonHttpRequestE2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    vars: E2eTestVar[] | undefined,
    iterationIndex: number | undefined,
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTestSuite.runJsonHttpRequest called',
      { test, sequence, suite });

    let headers = mergeHeaders(suite.headers, sequence.headers);
    headers = replaceVarsInObject(mergeHeaders(headers, test.headers), vars, iterationIndex);

    let url = replaceVars(
      test.endpoint || sequence.endpoint || suite.endpoint || '',
      vars,
      iterationIndex,
    );

    if (url.startsWith('env=')) {
      url = process.env[url.substring(4)] || '';
    }

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

    if (Array.isArray(test.response?.assignVars) && test.response?.assignVars.length > 0) {
      assignVars(
        test.response.assignVars,
        data,
        sequence,
        suite,
        iterationIndex,
      )
    }

    if (Array.isArray(test.response?.checks) && test.response?.checks.length > 0) {
      performChecks(
        testName,
        test.response.checks,
        data,
        sequence,
        suite,
        vars,
        iterationIndex,
        results,
      )
    }

    return results;
  }
}
