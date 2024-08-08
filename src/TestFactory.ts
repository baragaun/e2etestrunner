import { BgE2eTest } from './BgE2eTest';
import { E2eTestType } from './enums';
import { JsonHttpRequestE2eTest } from './JsonHttpRequestE2eTest';
import { MatchStatsE2eTest } from './matchStatsE2eTest/MatchStatsE2eTest.js';

export class TestFactory {
  static create(testType: E2eTestType): BgE2eTest {
    switch (testType) {
      case E2eTestType.jsonHttpRequest:
        return new JsonHttpRequestE2eTest();
      case E2eTestType.matchStats:
        return new MatchStatsE2eTest();
    }
  }
}
