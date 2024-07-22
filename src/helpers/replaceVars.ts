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

  for (const va of vars) {
    if (
      isArrayDataType(va.dataType) &&
      (iterationIndex || iterationIndex === 0) &&
      !Number.isNaN(iterationIndex)
    ) {
      if (!Array.isArray(va.value) || iterationIndex > va.value.length - 1) {
        logger.error('replaceVars: iterationIndex out of bounds', { va, iterationIndex });
      } else {
        const value = va.value[iterationIndex];
        newText = newText.replace(`\${${va.name}}`, value ? value.toString() : '');
      }
    } else {
      newText = newText.replace(`\${${va.name}}`, va.value ? va.value.toString() : '');
    }
  }

  if (newText.startsWith('env=')) {
    return process.env[newText.substring(4)] || '';
  }

  return newText;
};

export default replaceVars;
