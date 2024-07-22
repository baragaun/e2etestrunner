import { E2eTestVar } from '../definitions';
import replaceVars from './replaceVars';

const replaceVarsInObject = (
  obj: { [key: string]: string } | undefined,
  vars: E2eTestVar[] | undefined,
  iterationIndex: number | undefined,
): { [key: string]: string } | undefined => {
  if (
    !obj ||
    Object.keys(obj).length < 1 ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return obj;
  }

  Object.keys(obj).forEach((objKey) => {
    obj[objKey] = replaceVars(obj[objKey], vars, iterationIndex);
  });

  return obj;
};

export default replaceVarsInObject;
