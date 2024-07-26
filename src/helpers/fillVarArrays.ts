import { E2eTestVar } from '../definitions';
import replaceVars from './replaceVars';

const fillVarArrays = (vars: E2eTestVar[]): E2eTestVar[] => {
  if (
    !vars ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return vars;
  }

  const fillVars = vars.filter(v => v.fill && v.fillVal);

  for (const variable of fillVars) {
    if (!Array.isArray(variable.value) || variable.value.length < 1) {
      if (!Array.isArray(variable.value)) {
        variable.value = [];
      }
      for (let i = 0; i < (variable.fill || 0); i++) {
        variable.value.push(replaceVars(variable.fillVal as string, vars, i));
      }
    }
  }

  return vars;
};

export default fillVarArrays;
