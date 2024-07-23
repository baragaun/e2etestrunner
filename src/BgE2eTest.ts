import {
  E2eTestConfig,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig, E2eTestVar,
  TestResult,
} from './definitions';
import logger from './helpers/logger';
import mergeVars from './helpers/mergeVars';

export abstract class BgE2eTest {
  protected abstract runOnce(
    testName: string,
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    test: BgE2eTest,
    vars: E2eTestVar[] | undefined,
    iterationIndex: number | undefined,
    results: TestResult[],
  ): Promise<TestResult[]>;

  protected async runIteratively(
    testName: string,
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    test: BgE2eTest,
    vars: E2eTestVar[] | undefined,
    iterationIndex: number | undefined,
    results: TestResult[],
  ): Promise<TestResult[]> {
    for (let iterationIndex = 0; iterationIndex < (testConfig.repeat || 0); iterationIndex++) {
      results = await test.runOnce(
        testName,
        testConfig,
        sequence,
        suite,
        test,
        vars,
        iterationIndex,
        results,
      );
    }
    return results;
  }

  public async run(
    testConfig: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTest.run called', { testConfig, sequence, suite });

    return new Promise((resolve, reject) => {
      const testName = `${sequence.name}.${testConfig.name}`;
      let vars: E2eTestVar[] | undefined = mergeVars(suite.vars, sequence.vars);
      vars = mergeVars(vars, testConfig.vars);

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
            vars,
            0,
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
        vars,
        0,
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
}
