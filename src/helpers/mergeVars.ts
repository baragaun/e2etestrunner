import { E2eTestVar } from '../definitions';
import indexOfVar from './indexOfVar';

const mergeVars = (
  vars1: E2eTestVar[] | undefined,
  vars2: E2eTestVar[] | undefined,
): E2eTestVar[] => {
  if (!Array.isArray(vars1) || vars1.length < 1) {
    return vars2 || [];
  }
  if (!Array.isArray(vars2) || vars2.length < 1) {
    return vars1;
  }

  const result = vars1.slice(0);

  for (const va of vars2.slice(0)) {
    const idx = indexOfVar(va.name, result);
    if (idx > -1) {
      result[idx] = va;
    } else {
      result.push(va);
    }
  }

  return result;
};

export default mergeVars;
