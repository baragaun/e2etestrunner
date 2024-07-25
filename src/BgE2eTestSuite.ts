import {
  E2eTestSuiteConfig,
  E2eTestSuiteResult, E2eTestVar,
  LogLevel,
  TestResult,
} from './definitions';
import { TestFactory } from './TestFactory';
import fillVarArrays from './helpers/fillVarArrays';
import logger from './helpers/logger';
import mergeVars from './helpers/mergeVars';

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
    let preflightErrors: string[] | undefined = this.preflightConfig(this.config);
    const suiteVars: E2eTestVar[] = this.config.vars || [];

    for (let sequenceIdx = 0; sequenceIdx < this.config.sequences.length; sequenceIdx++) {
      const sequence = this.config.sequences[sequenceIdx];

      if (sequence.enabled === undefined || sequence.enabled) {
        const vars: E2eTestVar[] = mergeVars(suiteVars, sequence.vars);
        fillVarArrays(vars);

        for (let testIdx = 0; testIdx < sequence.tests.length; testIdx++) {
          const testConfig = sequence.tests[testIdx];
          if (testConfig.enabled === undefined || testConfig.enabled) {
            const test = TestFactory.create(testConfig.type);
            const errors = test.preflightConfig(
              testConfig,
              sequence,
              this.config,
              vars,
            );
            if (Array.isArray(errors) && errors.length > 1) {
              preflightErrors = preflightErrors ? preflightErrors.concat(errors) : errors;
            }
          }
        }
      }
    }

    if (Array.isArray(preflightErrors) && preflightErrors.length > 0) {
      return { passed: false, checks: [], errors: preflightErrors, vars: this.config.vars };
    }

    for (let sequenceIdx = 0; sequenceIdx < this.config.sequences.length; sequenceIdx++) {
      const sequence = this.config.sequences[sequenceIdx];

      if (sequence.enabled === undefined || sequence.enabled) {
        const vars: E2eTestVar[] = mergeVars(suiteVars, sequence.vars);

        for (let testIdx = 0; testIdx < sequence.tests.length; testIdx++) {
          const testConfig = sequence.tests[testIdx];
          if (testConfig.enabled === undefined || testConfig.enabled) {
            const test = TestFactory.create(testConfig.type);
            results = await test.run(
              testConfig,
              sequence,
              this.config,
              vars,
              results,
            );
          }
        }
      }
    }

    const passed = !results.some((r) => !r.passed);

    return { passed, checks: results, vars: this.config.vars };
  }

  public preflightConfig(config: E2eTestSuiteConfig): string[] | undefined {
    const errors: string[] = [];

    if (Array.isArray(config.vars) && config.vars.length > 0) {
      if (config.vars.some(v => v.name === 'idx')) {
        errors.push(`Error in suite: Invalid variable name 'idx' used.`);
      }
    }

    return errors.length > 0 ? errors : undefined;
  }
}
