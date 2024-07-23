import { E2eTestVar } from '../definitions';
import isArrayDataType from './isArrayDataType';
import logger from './logger';

const replaceVars = (
  text: string,
  vars: E2eTestVar[] | undefined,
  iterationIndex: number | undefined,
): string => {
  if (
    !text ||
    !vars ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return text;
  }

  let newText = text;

  for (const variable of vars) {
    if (
      isArrayDataType(variable.dataType) &&
      (iterationIndex || iterationIndex === 0) &&
      !Number.isNaN(iterationIndex)
    ) {
      if (Array.isArray(variable.value) && iterationIndex < variable.value.length) {
        const value = variable.value[iterationIndex];
        newText = newText.replace(`\${${variable.name}}`, value ? value.toString() : '');
      }
    } else {
      newText = newText.replace(`\${${variable.name}}`, variable.value ? variable.value.toString() : '');
    }
  }

  if (iterationIndex !== undefined && !Number.isNaN(iterationIndex)) {
    newText = newText.replace(`\${idx}`, ((iterationIndex || 0) + 1).toString());
  }

  if (newText.startsWith('env=')) {
    return process.env[newText.substring(4)] || '';
  }

  return newText;
};

export default replaceVars;
