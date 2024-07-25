import { E2eTestVar, E2eVarDataType } from '../definitions';
import isArrayDataType from './isArrayDataType';
import logger from './logger';
import parseBoolean from './parseBoolean';

const assignVar = (
  varName: string,
  text: string | null | undefined,
  arrayIndex: number | undefined,
  vars: E2eTestVar[],
): E2eTestVar[] | undefined => {
  if (
    !varName ||
    !text ||
    !Array.isArray(vars) ||
    vars.length < 1
  ) {
    return vars;
  }

  const variable = vars.find(v => v.name === varName);

  if (!variable) {
    logger.error('assignVar: variable not found',
      { varName, text, arrayIndex });
    return vars;
  }

  // Converting the value to the designated data type:
  let typedVal: boolean | Date | number | string | null | undefined  = text;
  if (variable.dataType === E2eVarDataType.boolean || variable.dataType === E2eVarDataType.booleanArray) {
    typedVal = parseBoolean(text);
  } else if (variable.dataType === E2eVarDataType.date || variable.dataType === E2eVarDataType.dateArray) {
    typedVal = new Date(Date.parse(text));
  } else if (variable.dataType === E2eVarDataType.number || variable.dataType === E2eVarDataType.numberArray) {
    if (Number.isInteger(text)) {
      typedVal = text;
    } else {
      typedVal = Number.parseInt(text);
    }
  }

  if (isArrayDataType(variable.dataType)) {
    if (
      (!arrayIndex && arrayIndex !== 0) ||
      isNaN(arrayIndex)
    ) {
      logger.error('assignVar: variable is an array, but no iterationIndex given',
        { varName, text, arrayIndex, variable });
      return vars;
    }

    if (!variable.value) {
      variable.value = [];
    }

    if (!Array.isArray(variable.value)) {
      logger.error('assignVar: variable does not have a value array.',
        { varName, arrayIndex, variable });
      return vars;
    }

    if (arrayIndex < variable.value.length) {
      variable.value[arrayIndex] = typedVal;
    }

    if (arrayIndex !== variable.value.length) {
      logger.error('assignVar: iterationIndex out of bounds.',
        { varName, arrayIndex, variable });
      return vars;
    }

    variable.value.push(typedVal);

    return vars;
  }

  variable.value = typedVal;

  return vars;
};

export default assignVar;
