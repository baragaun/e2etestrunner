import { BgE2eTest } from './BgE2eTest';
import { E2eTestConfig, E2eTestSequenceConfig, E2eTestSuiteConfig } from './definitions';
import { E2eTestType } from './enums';
import { GraphqlRequestE2eTest } from './GraphqlRequestE2eTest';
import { JsonHttpRequestE2eTest } from './JsonHttpRequestE2eTest';
import { MatchStatsE2eTest } from './matchStatsE2eTest/MatchStatsE2eTest';

export class TestFactory {
  static create(
    testType: E2eTestType,
    suiteConfig: E2eTestSuiteConfig,
    sessionConfig: E2eTestSequenceConfig,
    config: E2eTestConfig,
  ): BgE2eTest {
    switch (testType) {
      case E2eTestType.graphqlRequest:
        return new GraphqlRequestE2eTest(suiteConfig, sessionConfig, config);
      case E2eTestType.jsonHttpRequest:
        return new JsonHttpRequestE2eTest(suiteConfig, sessionConfig, config);
      case E2eTestType.matchStats:
        return new MatchStatsE2eTest(suiteConfig, sessionConfig, config);
    }
  }
}
