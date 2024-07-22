import { BgE2eTest } from './BgE2eTest';
import { E2eTestType } from './enums';
import { JsonHttpRequestE2eTest } from './JsonHttpRequestE2eTest';

export class TestFactory {
  static create(testType: E2eTestType): BgE2eTest {
    switch (testType) {
      case E2eTestType.jsonHttpRequest:
        return new JsonHttpRequestE2eTest();
    }
  }
}
