import { E2eTestVar, E2eVarDataType } from '../definitions';
import isArrayDataType from './isArrayDataType';
import logger from './logger';
import parseArrayIndex from './parseArrayIndex';
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

  const parseResult = parseArrayIndex(varName, arrayIndex);
  varName = parseResult.varName;
  if (parseResult.arrayIndex > -1) {
    arrayIndex = parseResult.arrayIndex;
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
      return vars;
    }

    // The arrayIndex is not one of the existing elements in the array. If it
    // is the next index, we can add the value to the array.
    if (arrayIndex !== variable.value.length) {
      logger.error('assignVar: iterationIndex out of bounds.',
        { varName, arrayIndex, variable });
      return vars;
    }

    variable.value.push(typedVal);

    return vars;
  }

  // Is the target variable pointing to another variable?
  const startIdx = (variable.value as string).indexOf('${');
  if (startIdx > -1) {
    const endIdx = (variable.value as string).indexOf('}', startIdx + 1);
    if (endIdx > -1) {
      return assignVar(
        (variable.value as string).substring(startIdx, endIdx),
        text,
        arrayIndex,
        vars,
      )
    }
  }

  variable.value = typedVal;

  return vars;
};

export default assignVar;
