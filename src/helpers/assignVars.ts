import {
  E2eTestVar,
  E2eTestVarAssignment,
} from '../definitions';
import logger from './logger';
import jsonpath from 'jsonpath';
import assignVar from './assignVar';

const assignVars = (
  assignVars: E2eTestVarAssignment[],
  data: Object,
  iterationIndex: number | undefined,
  vars: E2eTestVar[],
): void => {
  assignVars.forEach((readVar) => {
    let value: string | undefined = undefined;
    try {
      const values = jsonpath.query(data, readVar.jsonPath);
      if (Array.isArray(values) && values.length === 1) {
        value = values[0];
      }
    } catch (error) {
      logger.error('assignVars: error', { test: this, error });
    }
    assignVar(
      readVar.name,
      value,
      readVar.index === undefined || readVar.index === '${idx}'
        ? iterationIndex
        : readVar.index as number,
      vars,
    );
  });
}

export default assignVars;
