import { BgE2eTest } from './BgE2eTest';
import {
  E2eTestConfig,
  E2eTestResponse,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
  HttpRequestConfig,
  MatchStatsE2eTestConfig,
} from './definitions';
import { JsonHttpRequestE2eTest } from './JsonHttpRequestE2eTest';
import fetchJson from './helpers/fetchJson';
import logger from './helpers/logger';
import mergeHeaders from './helpers/mergeHeaders';
import replaceVars from './helpers/replaceVars';
import replaceVarsInObject from './helpers/replaceVarsInObject';
import assignVars from './helpers/assignVars';
import performChecks from './helpers/performChecks';

export class MatchStatsE2eTest extends JsonHttpRequestE2eTest {
  protected createUserSearch(
    searcherId: string,
    testConfig: MatchStatsE2eTestConfig,
  ) {

  }

  protected async runOnce(
    testName: string,
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    test: BgE2eTest,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse> {
    logger.trace('BgE2eTestSuite.runJsonHttpRequest called',
      { test, sequence, suite });

    const config = testConfig as MatchStatsE2eTestConfig

    let headers = mergeHeaders(suite.headers, sequence.headers);
    headers = replaceVarsInObject(
      mergeHeaders(
        headers,
        config.headers,
      ),
      vars,
      iterationIndex,
    );

    let url = replaceVars(
      config.endpoint || sequence.endpoint || suite.endpoint || '',
      vars,
      iterationIndex,
    );

    if (url.startsWith('env:')) {
      url = process.env[url.substring(4)] || '';
    }

    const requestConfig: HttpRequestConfig = {
      url,
      method: suite.method || sequence.method || config.method,
      headers,
      data: config.data ? replaceVars(config.data, vars, iterationIndex) : '',
    };

    const { response, data, error } = await fetchJson(requestConfig);

    if (error) {
      testResponse.results.push({ name: testName, passed: false, error: `error-in-response: ${error}; data: ${data || ''}` });
      return testResponse;
    }

    if (!response) {
      testResponse.results.push({ name: testName, passed: false, error: `error-response: empty` });
      return testResponse;
    }

    if (!data) {
      testResponse.results.push({ name: testName, passed: false, error: 'no-data-in-response' });
      return testResponse;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      testResponse.results.push({ name: testName, passed: false, error: `error-response: ${data.errors.join(', ')}` });
      return testResponse;
    }

    if (Array.isArray(config.assignVars) && config.assignVars.length > 0) {
      assignVars(
        config.assignVars,
        data,
        iterationIndex,
        vars,
      );
    }

    if (Array.isArray(config.checks) && config.checks.length > 0) {
      testResponse = performChecks(
        testName,
        config.checks,
        data,
        sequence,
        suite,
        vars,
        iterationIndex,
        testResponse,
      );
    }

    return testResponse;
  }
}
