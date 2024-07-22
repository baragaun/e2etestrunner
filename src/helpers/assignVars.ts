import {
  E2eTestSequenceConfig,
  E2eTestSuiteConfig,
  E2eTestVarAssignment,
} from '../definitions';
import logger from './logger';
import jsonpath from 'jsonpath';
import assignVar from './assignVar';

const assignVars = (
  assignVars: E2eTestVarAssignment[],
  data: Object,
  sequence: E2eTestSequenceConfig,
  suite: E2eTestSuiteConfig,
  iterationIndex: number | undefined,
): void => {
  assignVars.forEach((readVar) => {
    let value: string | undefined = undefined;
    try {
      const values = jsonpath.query(data, readVar.jsonPath);
      if (Array.isArray(values) && values.length === 1) {
        value = values[0];
      }
    } catch (error) {
      logger.error('BgE2eTestSuite.runJsonHttpRequest: error', { test, error });
    }
    assignVar(
      readVar.name,
      value,
      iterationIndex,
      readVar.scope === 'suite' ? suite.vars : sequence.vars,
    );
  });
}

export default assignVars;
