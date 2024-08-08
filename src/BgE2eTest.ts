import {
  E2eTestConfig,
  E2eTestResponse,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
} from './definitions';
import getRepeatCount from './helpers/getRepeatCount';
import logger from './helpers/logger';

export abstract class BgE2eTest {
  protected config?: E2eTestConfig;
  protected sequenceConfig?: E2eTestSequenceConfig;
  protected suiteConfig?: E2eTestSuiteConfig;

  protected abstract runOnce(
    testName: string,
    testConfig: E2eTestConfig,
    sequenceConfig: E2eTestSequenceConfig,
    suiteConfig: E2eTestSuiteConfig,
    test: BgE2eTest,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse>;

  protected async runIteratively(
    testName: string,
    testConfig: E2eTestConfig,
    sequenceConfig: E2eTestSequenceConfig,
    suiteConfig: E2eTestSuiteConfig,
    test: BgE2eTest,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse> {
    const repeatCount = getRepeatCount(testConfig, vars);
    for (let iterationIndex = 0; iterationIndex < repeatCount || 0; iterationIndex++) {
      testResponse = await test.runOnce(
        testName,
        testConfig,
        sequenceConfig,
        suiteConfig,
        test,
        iterationIndex,
        vars,
        testResponse,
      );
    }
    return testResponse;
  }

  public async run(
    testConfig: E2eTestConfig,
    sequenceConfig: E2eTestSequenceConfig,
    suiteConfig: E2eTestSuiteConfig,
    vars: E2eTestVar[],
  ): Promise<E2eTestResponse> {
    logger.trace('BgE2eTest.run called', { testConfig, sequence: sequenceConfig, suite: suiteConfig });
    this.config = testConfig;
    this.sequenceConfig = sequenceConfig;
    this.suiteConfig = suiteConfig;
    this.config = testConfig;
    const testResponse: E2eTestResponse = { results: [] };

    return new Promise((resolve, reject) => {
      const testName = `${sequenceConfig.name}.${testConfig.name}`;
      const repeatCount = getRepeatCount(testConfig, vars);

      const fnc = (!repeatCount || repeatCount === 0) ||
        isNaN(repeatCount) || repeatCount < 1
        ? this.runOnce
        : this.runIteratively;

      if (testConfig.waitMilliSecondsBefore) {
        setTimeout(() => {
          fnc(
            testName,
            testConfig,
            sequenceConfig,
            suiteConfig,
            this,
            0,
            vars,
            testResponse,
          )
            .then((results) => {
              if (testConfig.waitMilliSecondsAfter) {
                setTimeout(() => {
                  resolve(results);
                }, testConfig.waitMilliSecondsAfter || 2000);
                return;
              }
              resolve(results);
            }, reject);
        }, testConfig.waitMilliSecondsBefore);

        return;
      }

      fnc(
        testName,
        testConfig,
        sequenceConfig,
        suiteConfig,
        this,
        0,
        vars,
        testResponse,
      )
        .then((testResponse) => {
          if (testConfig.waitMilliSecondsAfter) {
            setTimeout(() => {
              resolve(testResponse);
            }, testConfig.waitMilliSecondsAfter || 2000);
            return;
          }
          resolve(testResponse);
        }, reject);
    });
  }

  public preflightConfig(
    testConfig: E2eTestConfig,
    sequenceConfig: E2eTestSequenceConfig,
    suiteConfig: E2eTestSuiteConfig,
    vars: E2eTestVar[],
  ): string[] | undefined {
    const errors: string[] = [];

    if (Array.isArray(vars) && vars.length > 0) {
      if (vars.some(v => v.name === 'idx')) {
        errors.push(`Error in test "${testConfig.name}": Invalid variable name 'idx' used.`);
      }
    }

    return errors.length > 0 ? errors : undefined;
  }
}
