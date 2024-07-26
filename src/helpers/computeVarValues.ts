import { E2eTestVar } from '../definitions';
import replaceVars from './replaceVars';

const computeVarValues = (vars: E2eTestVar[]): E2eTestVar[] => {
  if (
    !vars ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return vars;
  }

  const computedVars = vars.filter(v =>
    v.value &&
    (typeof v.value === 'string' || v.value instanceof String) &&
    v.value.indexOf('${') > -1
  );

  for (const variable of computedVars) {
    variable.value = replaceVars(variable.value as string, vars, 0);
  }

  return vars;
};

export default computeVarValues;
