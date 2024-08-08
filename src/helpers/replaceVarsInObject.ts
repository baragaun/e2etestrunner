import { E2eTestVar } from '../definitions';
import replaceVars from './replaceVars';

const replaceVarsInObject = <T = any>(
  obj: T | undefined,
  vars: E2eTestVar[],
  iterationIndex?: number,
): T | undefined => {
  if (
    !obj ||
    Object.keys(obj).length < 1 ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return obj;
  }

  Object.keys(obj).forEach((objKey) => {
    // @ts-ignore
    obj[objKey] = replaceVars(obj[objKey], vars, iterationIndex);
  });

  return obj;
};

export default replaceVarsInObject;
