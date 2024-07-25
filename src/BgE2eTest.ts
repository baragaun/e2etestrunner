import {
  E2eTestConfig,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
  TestResult,
} from './definitions';
import logger from './helpers/logger';

export abstract class BgE2eTest {
  protected abstract runOnce(
    testName: string,
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    test: BgE2eTest,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    results: TestResult[],
  ): Promise<TestResult[]>;

  protected async runIteratively(
    testName: string,
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    test: BgE2eTest,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    results: TestResult[],
  ): Promise<TestResult[]> {
    for (let iterationIndex = 0; iterationIndex < (testConfig.repeat || 0); iterationIndex++) {
      results = await test.runOnce(
        testName,
        testConfig,
        sequence,
        suite,
        test,
        iterationIndex,
        vars,
        results,
      );
    }
    return results;
  }

  public async run(
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    vars: E2eTestVar[],
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTest.run called', { testConfig, sequence, suite });

    return new Promise((resolve, reject) => {
      const testName = `${sequence.name}.${testConfig.name}`;

      const fnc = (!testConfig.repeat || testConfig.repeat === 0) ||
        Number.isNaN(testConfig.repeat) || testConfig.repeat < 1
        ? this.runOnce
        : this.runIteratively;

      if (testConfig.waitMilliSecondsBefore) {
        setTimeout(() => {
          fnc(
            testName,
            testConfig,
            sequence,
            suite,
            this,
            0,
            vars,
            results,
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
        sequence,
        suite,
        this,
        0,
        vars,
        results,
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
    });
  }

  public preflightConfig(
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
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
