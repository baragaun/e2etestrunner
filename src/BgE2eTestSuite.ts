// @ts-ignore
import jsonpath from 'jsonpath';

import {
  E2eTestSuiteConfig,
  E2eTestSuiteResult,
  LogLevel,
  TestResult,
} from './definitions';
import { TestFactory } from './TestFactory';
import logger from './helpers/logger';

export class BgE2eTestSuite {
  protected config: E2eTestSuiteConfig;

  constructor(config: E2eTestSuiteConfig) {
    this.config = config;
  }

  public async run(config?: E2eTestSuiteConfig, logLevel?: LogLevel): Promise<E2eTestSuiteResult> {
    logger.trace('BgE2eTestSuite.run called', { config });

    if (config) {
      this.config = config;
    }

    if (logLevel) {
      logger.setLogLevel(logLevel);
    }

    let results: TestResult[] = [];

    for (let sequenceIdx = 0; sequenceIdx < this.config.sequences.length; sequenceIdx++) {
      const sequence = this.config.sequences[sequenceIdx];
      if (sequence.enabled === undefined || sequence.enabled) {
        for (let testIdx = 0; testIdx < sequence.tests.length; testIdx++) {
          const testConfig = sequence.tests[testIdx];
          if (testConfig.enabled === undefined || testConfig.enabled) {
            const test = TestFactory.create(testConfig.type);
            results = await test.run(
              testConfig,
              sequence,
              this.config,
              results,
            );
          }
        }
      }
    }

    const passed = !results.some((r) => !r.passed);

    return { passed, checks: results };
  }
}
