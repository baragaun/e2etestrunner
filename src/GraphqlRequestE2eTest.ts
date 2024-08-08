import {
  E2eTestConfig,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
} from './definitions';
import { GraphqlResponseData } from './matchStatsE2eTest/definitions';
import { JsonHttpRequestE2eTest } from './JsonHttpRequestE2eTest';
import logger from './helpers/logger';

export class GraphqlRequestE2eTest extends JsonHttpRequestE2eTest {
  public constructor(
    suiteConfig: E2eTestSuiteConfig,
    sequenceConfig: E2eTestSequenceConfig,
    config: E2eTestConfig,
  ) {
    super(suiteConfig, sequenceConfig, config);
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
    logger.trace('BgE2eTestSuite.GraphqlRequestE2eTest called.',
      { testName, test: this, iterationIndex });

    const { response, data, errors } = await super.sendRequest<TData>(
      testName,
      iterationIndex,
      body,
      vars,
    );

    if (errors) {
      logger.error('sendRequest.sendRequest: error received.',
        { testName, test: this, iterationIndex, errors });
      return { response, errors };
    }

    if (
      Array.isArray((data as GraphqlResponseData).errors) &&
      (data as GraphqlResponseData).errors!.length > 0
    ) {
      logger.error('sendRequest.sendRequest: data.errors received.',
        { testName, test: this, iterationIndex });
      return { response, data, errors: ['errors-in-data'] };
    }

    return { response, data };
  }
}
