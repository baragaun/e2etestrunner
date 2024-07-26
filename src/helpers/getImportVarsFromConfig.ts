import { E2eTestSuiteConfig, E2eTestVar } from '../definitions';

const getImportVarsFromConfig = (config: E2eTestSuiteConfig): E2eTestVar[] => {
  let vars: E2eTestVar[] = [];

  for (let sequenceIdx = 0; sequenceIdx < config.sequences.length; sequenceIdx++) {
    const sequence = config.sequences[sequenceIdx];

    if (sequence.enabled === undefined || sequence.enabled) {
      for (let testIdx = 0; testIdx < sequence.tests.length; testIdx++) {
        const testConfig = sequence.tests[testIdx];
        if (Array.isArray(testConfig.importVars) && testConfig.importVars.length > 0) {
          vars = vars.concat(testConfig.importVars);
        }
      }
    }
  }

  return vars;
};

export default getImportVarsFromConfig;
