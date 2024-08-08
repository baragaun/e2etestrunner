import { BgE2eTest } from './BgE2eTest';
import {
  E2eTestConfig,
  E2eTestResponse, E2eTestSequenceConfig, E2eTestSuiteConfig,
  E2eTestVar,
  HttpRequestConfig,
  JsonHttpRequestE2eTestConfig,
} from './definitions';
import fetchJson from './helpers/fetchJson';
import logger from './helpers/logger';
import mergeHeaders from './helpers/mergeHeaders';
import replaceVars from './helpers/replaceVars';
import replaceVarsInObject from './helpers/replaceVarsInObject';
import assignVars from './helpers/assignVars';
import performChecks from './helpers/performChecks';

/**
 * Places a HTTP request using JSON to send and receive data.
 */
export class JsonHttpRequestE2eTest extends BgE2eTest {
  public constructor(
    suiteConfig: E2eTestSuiteConfig,
    sequenceConfig: E2eTestSequenceConfig,
    config: E2eTestConfig,
  ) {
    super(suiteConfig, sequenceConfig, config);
  }

  protected async runOnce(
    testName: string,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse> {
    logger.trace('BgE2eTestSuite.runJsonHttpRequest called.',
      { test, iterationIndex, vars });

    const config = this.config as JsonHttpRequestE2eTestConfig

    const { data, errors } = await this.sendRequest(
      testName,
      iterationIndex,
      config.data ? replaceVars(config.data, vars, iterationIndex) : '',
      vars,
    )

    if (Array.isArray(errors) && errors.length > 0) {
      testResponse.results.push({
        name: testName,
        passed: false,
        error: `error-response: ${errors.join(', ')}`,
      });
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
        this.sequenceConfig!,
        this.suiteConfig!,
        vars,
        iterationIndex,
        testResponse,
      );
    }

    return testResponse;
  }

  protected async sendRequest<TData = any>(
    testName: string,
    iterationIndex: number | undefined,
    body: string,
    vars: E2eTestVar[],
  ): Promise<{
    response?: Response | undefined;
    data?: TData;
    errors?: string[];
  }> {
    logger.trace('JsonHttpRequestE2eTest.sendRequest called.',
      { testName, test: this, iterationIndex });

    const config = this.config as JsonHttpRequestE2eTestConfig
    let headers = mergeHeaders(this.suiteConfig!.headers, this.sequenceConfig!.headers);
    headers = replaceVarsInObject(
      mergeHeaders(
        headers,
        config.headers,
      ),
      vars,
      iterationIndex,
    );

    let url = replaceVars(
      config.endpoint ||
        this.sequenceConfig?.endpoint ||
        this.suiteConfig?.endpoint ||
        '',
      vars,
      iterationIndex,
    );

    if (url.startsWith('env:')) {
      url = process.env[url.substring(4)] || '';
    }

    const requestConfig: HttpRequestConfig = {
      url,
      method: config.method || this.sequenceConfig!.method || this.suiteConfig!.method,
      headers,
      data: body ? replaceVars(body, vars as unknown as E2eTestVar[], 0) : '',
    };

    const { response, data, error } = await fetchJson<TData>(requestConfig);

    if (error) {
      logger.error('JsonHttpRequestE2eTest.sendRequest: error received.',
        { test: this, error });
      return { response, errors: [error] };
    }

    if (!data) {
      logger.error('JsonHttpRequestE2eTest.sendRequest: no response data received.',
        { test: this });
      return { response, errors: ['no-data-received'] };
    }

    return { response, data: data as TData };
  }
}
