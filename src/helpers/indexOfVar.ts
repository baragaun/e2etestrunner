import { E2eTestVar } from '../definitions';

const indexOfVar = (name: string, vars: E2eTestVar[]): number => {
  if (!Array.isArray(vars) || vars.length < 1) {
    return -1;
  }

  for (let i = 0; i < vars.length; i++) {
    if (vars[i].name === name) {
      return i;
    }
  }

  return -1;
};

export default indexOfVar;
