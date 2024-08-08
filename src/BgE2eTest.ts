import {
  E2eTestConfig,
  E2eTestResponse,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
} from './definitions';
import { MatchStatsE2eTestConfig } from './matchStatsE2eTest/definitions';
import getRepeatCount from './helpers/getRepeatCount';
import logger from './helpers/logger';
import replaceVarsInObject from './helpers/replaceVarsInObject';

export abstract class BgE2eTest {
  protected config?: E2eTestConfig;
  protected sequenceConfig?: E2eTestSequenceConfig;
  protected suiteConfig?: E2eTestSuiteConfig;

  protected constructor(
    suiteConfig: E2eTestSuiteConfig,
    sequenceConfig: E2eTestSequenceConfig,
    config: E2eTestConfig,
  ) {
    this.suiteConfig = suiteConfig;
    this.sequenceConfig = sequenceConfig;
    this.config = config;
  }

  protected abstract runOnce(
    testName: string,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse>;

  protected async runIteratively(
    testName: string,
    iterationIndex: number | undefined,
    vars: E2eTestVar[],
    testResponse: E2eTestResponse,
  ): Promise<E2eTestResponse> {
    const repeatCount = getRepeatCount(this.config!, vars);
    for (let iterationIndex = 0; iterationIndex < repeatCount || 0; iterationIndex++) {
      testResponse = await this.runOnce(
        testName,
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

    this.config = replaceVarsInObject<E2eTestConfig>(testConfig, vars);
    this.sequenceConfig = replaceVarsInObject<E2eTestSequenceConfig>(sequenceConfig, vars);
    this.suiteConfig = replaceVarsInObject<E2eTestSuiteConfig>(suiteConfig, vars);
    const testResponse: E2eTestResponse = { results: [] };
    const test = this;

    return new Promise((resolve, reject) => {
      const testName = `${sequenceConfig.name}.${testConfig.name}`;
      const repeatCount = getRepeatCount(testConfig, vars);

      const fnc = (!repeatCount || repeatCount === 0) ||
        isNaN(repeatCount) || repeatCount < 1
        ? this.runOnce
        : this.runIteratively;

      if (testConfig.waitMilliSecondsBefore) {
        setTimeout(() => {
          fnc.bind(test)(
            testName,
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

      fnc.bind(test)(
        testName,
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
    this.config = replaceVarsInObject<E2eTestConfig>(testConfig, vars);
    this.sequenceConfig = replaceVarsInObject<E2eTestSequenceConfig>(sequenceConfig, vars);
    this.suiteConfig = replaceVarsInObject<E2eTestSuiteConfig>(suiteConfig, vars);

    const errors: string[] = [];

    if (Array.isArray(vars) && vars.length > 0) {
      if (vars.some(v => v.name === 'idx')) {
        errors.push(`Error in test "${this.config?.name}": Invalid variable name 'idx' used.`);
      }
    }

    return errors.length > 0 ? errors : undefined;
  }
}
