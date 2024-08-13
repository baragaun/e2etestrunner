import fs from 'fs';

import {
  E2eTestConfig,
  E2eTestResponse,
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestSuiteResult,
  E2eTestVar,
  LogLevel,
  TestResult,
} from './definitions';
import { TestFactory } from './TestFactory';
import computeVarValues from './helpers/computeVarValues';
import fillVarArrays from './helpers/fillVarArrays';
import getImportVarsFromConfig from './helpers/getImportVarsFromConfig';
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

    // for (let sequenceIdx = 0; sequenceIdx < this.config.sequences.length; sequenceIdx++) {
    //   const sequence = this.config.sequences[sequenceIdx];
    //   if (sequence.import) {
    //
    //   }
    // }
    this.importLinkedConfigFiles();

    let results: TestResult[] = [];
    let preflightErrors: string[] | undefined = this.preflightConfig(this.config);
    const suiteVars: E2eTestVar[] = this.config.vars || [];

    computeVarValues(suiteVars);
    fillVarArrays(suiteVars);

    const importVars = getImportVarsFromConfig(this.config);
    computeVarValues(importVars);
    fillVarArrays(importVars);

    for (let sequenceIdx = 0; sequenceIdx < this.config.sequences.length; sequenceIdx++) {
      const sequence = this.config.sequences[sequenceIdx];

      if (sequence.enabled === undefined || sequence.enabled) {
        let vars: E2eTestVar[] = mergeVars(suiteVars, sequence.vars);
        computeVarValues(vars);
        fillVarArrays(vars);

        for (let testIdx = 0; testIdx < sequence.tests.length; testIdx++) {
          const testConfig = sequence.tests[testIdx];
          if (testConfig.enabled === undefined || testConfig.enabled) {
            let testVars = vars;
            if (Array.isArray(testConfig.vars) && testConfig.vars.length > 0) {
              testVars = mergeVars(vars.slice(0), testConfig.vars);
              computeVarValues(testVars);
              fillVarArrays(testVars);
            }

            const test = TestFactory.create(
              testConfig.type,
              this.config,
              sequence,
              testConfig,
            );
            const errors = test.preflightConfig(
              testConfig,
              sequence,
              this.config,
              testVars,
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
            let testVars = vars;
            if (Array.isArray(testConfig.vars) && testConfig.vars.length > 0) {
              testVars = mergeVars(vars.slice(0), testConfig.vars);
              computeVarValues(testVars);
              fillVarArrays(testVars);
            }

            const test = TestFactory.create(
              testConfig.type,
              this.config,
              sequence,
              testConfig,
            );
            const testResponse = await test.run(
              testConfig,
              sequence,
              this.config,
              testVars,
            );
            results = results.concat(testResponse.results);
            if (testConfig.stopIfFailed && testResponse.results.some((r) => !r.passed)) {
              return { passed: false, checks: results, vars: this.config.vars };
            }
            if (testConfig.stopOnError && testResponse.results.some(r => r.error)) {
              return { passed: false, checks: results, vars: this.config.vars };
            }
          }
        }
      }
    }

    const passed = !results.some((r) => !r.passed);

    const response: E2eTestSuiteResult = {
      passed,
      checks: this.config?.hidePassed === true
        ? results.filter(r => !r.passed)
        : results,
      vars: this.config.vars,
    };

    if (this.config?.returnVars) {
      response.vars = this.config.vars;
    }

    return response;
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

  protected importLinkedConfigFiles() {
    for (let sequenceIdx = 0; sequenceIdx < this.config.sequences.length; sequenceIdx++) {
      let sequence = this.config.sequences[sequenceIdx];

      if (sequence.import) {
        let importedJson = fs.readFileSync(sequence.import, 'utf8');
        if (importedJson) {
          try {
            const importedConfig = JSON.parse(importedJson.toString()) as E2eTestSequenceConfig;
            importedConfig.vars = mergeVars(importedConfig.vars, sequence.importVars);
            // The parent config file overwrites the linked in config file:
            for (const key of Object.keys(sequence)) {
              if (key !== 'importVars') {
                // @ts-ignore
                importedConfig[key] = sequence[key];
              }
            }
            sequence = importedConfig
            this.config.sequences.splice(sequenceIdx, 1, sequence);
          } catch (error) {
            logger.error('BgE2eTestSuite.importLinkedConfigFiles: failed to parse config file.',
              { path: sequence.import, error });
          }
        }
      }

      if (sequence.enabled === undefined || sequence.enabled) {
        for (let testIdx = 0; testIdx < sequence.tests.length; testIdx++) {
          const testConfig = sequence.tests[testIdx];
          if (testConfig.import) {
            let importedJson = fs.readFileSync(testConfig.import, 'utf8');
            if (importedJson) {
              try {
                const importedConfig = JSON.parse(importedJson.toString()) as E2eTestConfig;
                importedConfig.vars = mergeVars(importedConfig.vars, sequence.importVars);
                // The parent config file overwrites the linked in config file:
                for (const key of Object.keys(testConfig)) {
                  if (key !== 'importVars') {
                    // @ts-ignore
                    importedConfig[key] = testConfig[key];
                  }
                }
                sequence.tests.splice(testIdx, 1, importedConfig);
              } catch (error) {
                logger.error('BgE2eTestSuite.importLinkedConfigFiles: failed to parse config file.',
                  { path: testConfig.import, error });
              }
            }
          }
        }
      }
    }
  }
}
