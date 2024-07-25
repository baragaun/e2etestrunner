import {
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVar,
  E2eVarDataType,
  TestResult,
  ValidationCheck,
} from '../definitions';
import logger from './logger';
import jsonpath from 'jsonpath';
import validateValue from './validateValue';

const performChecks = (
  testName: string,
  checks: ValidationCheck[],
  data: Object,
  sequence: E2eTestSequenceConfig,
  suite: E2eTestSuiteConfig,
  vars: E2eTestVar[],
  iterationIndex: number | undefined,
  results: TestResult[],
): TestResult[] => {
  const enabledChecks = checks.filter((check) => check.enabled === undefined || check.enabled);

  for (let i = 0; i < enabledChecks.length; i++) {
    const check = enabledChecks[i];
    try {
      const checkName = Number.isNaN(iterationIndex)
        ? `${testName}.${check.name}`
        : `${testName}.${check.name}[${(iterationIndex as number).toString()}]`

      let value: string | undefined = undefined;
      const values = jsonpath.query(data, check.jsonPath);

      if (!Array.isArray(values) || values.length !== 1) {
        logger.error('BgE2ETestSuite.runJsonHttpRequest: failed to read value from data',
          { check, checkName, data });
        results.push({
          name: checkName,
          passed: false,
          error: 'value-not-found',
        });
        continue;
      }

      value = values[0];

      if (check.targetVar) {
        // We will compare the actual value with a variable:
        if (!Array.isArray(vars) || vars.length < 1) {
          results.push({
            name: testName,
            passed: false,
            error: 'no-vars-available',
          });
          continue;
        }

        const variable = vars.find(v => v.name === check.targetVar)
        let varVal: boolean | Date | number | string | null | undefined | (boolean | Date | number | string | null | undefined)[] = undefined;

        if (!variable) {
          logger.error('BgE2ETestSuite.runJsonHttpRequest: did not find target var',
            { check });
          results.push({
            name: checkName,
            passed: false,
            error: 'var-not-found',
          });
          continue;
        }

        if (Array.isArray(variable.value)) {
          const arrayIndex = (check.index === undefined || check.index === '${idx}'
            ? iterationIndex
            : check.index as number) || 0;

          if (arrayIndex > variable.value.length - 1) {
            logger.error('BgE2ETestSuite.runJsonHttpRequest: target var index out of bounds', { check });
            results.push({
              name: checkName,
              passed: false,
              error: 'var-index-out-of-bounds',
            });
            continue;
          }

          varVal = variable.value[arrayIndex] as string;
        } else {
          varVal = variable.value;
        }

        if (
          varVal &&
          (
            variable.dataType === E2eVarDataType.string ||
            variable.dataType === E2eVarDataType.stringArray
          ) &&
          iterationIndex !== undefined &&
          !Number.isNaN(iterationIndex)
        ) {
          varVal = (varVal as string).replace(`\${idx}`, ((iterationIndex || 0) + 1).toString());
        }

        results.push(validateValue(checkName, value, check, varVal));
        continue;
      }

      // The value is not compared to a variable, but to a value defined in the check
      // itself:
      results.push(validateValue(checkName, value, check, undefined));
    } catch (error) {
      logger.error('BgE2eTestSuite.runJsonHttpRequest: error', { test, error });
    }
  }

  return results;
}

export default performChecks;
