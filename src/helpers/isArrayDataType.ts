import { E2eVarDataType } from '../enums';

const isArrayDataType = (dataType: E2eVarDataType): boolean =>
  dataType === E2eVarDataType.booleanArray ||
  dataType === E2eVarDataType.dateArray ||
  dataType === E2eVarDataType.numberArray ||
  dataType === E2eVarDataType.stringArray;

export default isArrayDataType;
