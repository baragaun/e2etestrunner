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
    test: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    vars: E2eTestVar[] | undefined,
    iterationIndex: number | undefined,
    results: TestResult[],
  ): Promise<TestResult[]>;

  protected async runIteratively(
    testName: string,
    test: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    vars: E2eTestVar[] | undefined,
    iterationIndex: number | undefined,
    results: TestResult[],
  ): Promise<TestResult[]> {
    for (let iterationIndex = 0; iterationIndex < (test.repeat || 0); iterationIndex++) {
      results = await this.runOnce(
        testName,
        test,
        sequence,
        suite,
        vars,
        iterationIndex,
        results,
      );
    }
    return results;
  }

  public async run(
    test: E2eTestConfig,
    sequence: E2eTestSequenceConfig,
    suite: E2eTestSuiteConfig,
    results: TestResult[],
  ): Promise<TestResult[]> {
    logger.trace('BgE2eTest.run called', { test, sequence, suite });

    return new Promise((resolve, reject) => {
      const testName = `${sequence.name}.${test.name}`;
      let vars: E2eTestVar[] | undefined = mergeVars(suite.vars, sequence.vars);
      vars = mergeVars(vars, test.vars);

      const fnc = (!test.repeat || test.repeat === 0) ||
        Number.isNaN(test.repeat) || test.repeat < 1
        ? this.runOnce
        : this.runIteratively;

      if (test.waitMilliSecondsBefore) {
        setTimeout(() => {
          fnc(
            testName,
            test,
            sequence,
            suite,
            vars,
            0,
            results,
          )
            .then((results) => {
              if (test.waitMilliSecondsAfter) {
                setTimeout(() => {
                  resolve(results);
                }, test.waitMilliSecondsAfter || 2000);
                return;
              }
              resolve(results);
            }, reject);
        }, test.waitMilliSecondsBefore);

        return;
      }

      fnc(
        testName,
        test,
        sequence,
        suite,
        vars,
        0,
        results,
      )
        .then((results) => {
          if (test.waitMilliSecondsAfter) {
            setTimeout(() => {
              resolve(results);
            }, test.waitMilliSecondsAfter || 2000);
            return;
          }
          resolve(results);
        }, reject);
    });
  }
}
