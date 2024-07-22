import { E2eTestVar, E2eVarDataType } from '../definitions';
import isArrayDataType from './isArrayDataType';
import logger from './logger';
import parseBoolean from './parseBoolean';

const assignVar = (
  varName: string,
  text: string | null | undefined,
  iterationIndex: number | undefined,
  vars: E2eTestVar[] | undefined,
): void => {
  if (
    !varName ||
    !text ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return;
  }

  const variable = vars.find(v => v.name === varName);

  if (!variable) {
    logger.error('assignVar: variable not found',
      { varName, text, iterationIndex });
    return;
  }

  let typedVal: boolean | Date | number | string | null | undefined  = text;
  if (variable.dataType === E2eVarDataType.boolean || variable.dataType === E2eVarDataType.booleanArray) {
    typedVal = parseBoolean(text);
  } else if (variable.dataType === E2eVarDataType.date || variable.dataType === E2eVarDataType.dateArray) {
    typedVal = new Date(Date.parse(text));
  } else if (variable.dataType === E2eVarDataType.number || variable.dataType === E2eVarDataType.numberArray) {
    if (Number.isInteger(text)) {
      typedVal = Number.parseInt(text);
    } else if (Number.isNaN(text)) {
      typedVal = undefined;
    } else {
      typedVal = Number.parseFloat(text);
    }
  }

  if (isArrayDataType(variable.dataType)) {
    if (
      (!iterationIndex && iterationIndex !== 0) ||
      Number.isNaN(iterationIndex)
    ) {
      logger.error('assignVar: variable is an array, but no iterationIndex given',
        { varName, text, iterationIndex, variable });
      return;
    }

    if (!variable.value) {
      variable.value = [];
    }

    if (!Array.isArray(variable.value)) {
      logger.error('assignVar: variable does not have a value array.',
        { varName, iterationIndex, variable });
      return;
    }

    if (iterationIndex < variable.value.length) {
      variable.value[iterationIndex] = typedVal;
    }

    if (iterationIndex !== variable.value.length) {
      logger.error('assignVar: iterationIndex out of bounds.',
        { varName, iterationIndex, variable });
      return;
    }

    variable.value.push(typedVal);

    return;
  }

  variable.value = typedVal;
};

export default assignVar;
