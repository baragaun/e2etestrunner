import { TestResult, ValidationCheck } from '../definitions';

const validateBoolean = (
  testName: string,
  stringValue: string | null | undefined,
  config: ValidationCheck,
  targetValue: boolean | undefined,
): TestResult => {
  if (config.dataType !== 'boolean') {
    return { name: testName, passed: false, error: 'wrong-dataType' };
  }

  if (config.shouldBeEmpty && stringValue) {
    return { name: testName, passed: false, error: 'not-empty' };
  }

  if (!stringValue) {
    if (config.shouldBeEmpty) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'should-not-be-empty',
      expected: targetValue
        ? targetValue.toString()
        : config.targetBooleanValue
          ? config.targetBooleanValue?.toString()
          : 'N/A',
      found: 'empty',
    };
  }

  const booleanValue = ['1', 'true', 'yes'].includes(stringValue.toLowerCase());

  if (targetValue) {
    if (booleanValue == targetValue) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'stringValue-mismatch',
      expected: targetValue.toString(),
      found: stringValue,
    };
  }

  if (config.targetBooleanValue !== true && config.targetBooleanValue !== false) {
    return { name: testName, passed: false, error: 'missing-targetBooleanValue' };
  }

  if (booleanValue === config.targetBooleanValue) {
    return { name: testName, passed: true };
  }

  return {
    name: testName,
    passed: false,
    error: 'targetBooleanValue-mismatch',
    expected: config.targetBooleanValue.toString(),
    found: booleanValue.toString(),
  };
};

const validateDate = (
  testName: string,
  stringValue: string | null | undefined,
  config: ValidationCheck,
  targetValue: Date | undefined,
): TestResult => {
  if (config.dataType !== 'date') {
    return { name: testName, passed: false, error: 'wrong-dataType' };
  }

  if (config.shouldBeEmpty && stringValue) {
    return {
      name: testName,
      passed: false,
      error: 'should-be-empty',
      found: stringValue,
    };
  }

  if (!stringValue) {
    if (config.shouldBeEmpty) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'should-not-be-empty',
      expected: targetValue ? targetValue.toISOString() : 'N/A',
    };
  }

  const dateValue = new Date(stringValue);
  if (!dateValue) {
    return { name: testName, passed: false, error: 'failed to parse string to date' };
  }
  const timestamp = dateValue.getTime();

  if (targetValue) {
    if (targetValue.getTime() === timestamp) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'targetValue-mismatch',
      expected: targetValue.toISOString(),
      found: stringValue,
    };
  }

  if (config.notBeforeDate && timestamp < config.notBeforeDate.getTime()) {
    return {
      name: testName,
      passed: false,
      error: 'too-early',
      expected: `>${config.notBeforeDate.toISOString()}`,
      found: stringValue,
    };
  }

  if (config.notAfterDate && timestamp < config.notAfterDate.getTime()) {
    return {
      name: testName,
      passed: false,
      error: 'too-late',
      expected: `<${config.notAfterDate.toISOString()}`,
      found: stringValue,
    };
  }

  return { name: testName, passed: true };
};

const validateNumber = (
  testName: string,
  stringValue: string | null | undefined,
  config: ValidationCheck,
  targetValue: number | undefined,
): TestResult => {
  if (config.dataType !== 'number') {
    return { name: testName, passed: false, error: 'wrong-dataType' };
  }

  if (config.shouldBeEmpty && stringValue) {
    return {
      name: testName,
      passed: false,
      error: 'should-be-empty',
      found: stringValue,
    };
  }

  if (!stringValue) {
    if (config.shouldBeEmpty) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'should-not-be-empty',
      expected: targetValue ? targetValue.toString() : 'N/A',
      found: 'empty',
    };
  }

  const numericValue = Number.parseInt(stringValue);

  if (!numericValue || isNaN(numericValue)) {
    return {
      name: testName,
      passed: false,
      error: 'not-a-number',
      found: stringValue,
    };
  }

  if ((targetValue && !isNaN(targetValue)) || targetValue === 0) {
    if (numericValue === targetValue) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'targetValue-mismatch',
      expected: targetValue.toString(),
      found: stringValue,
    };
  }

  if (config.minNumericValue && numericValue < config.minNumericValue) {
    return {
      name: testName,
      passed: false,
      error: 'too small',
      expected: `>${config.minNumericValue}`,
      found: stringValue,
    };
  }

  if (config.maxNumericValue && numericValue > config.maxNumericValue) {
    return {
      name: testName,
      passed: false,
      error: 'too large',
      expected: `<${config.maxNumericValue}`,
      found: stringValue,
    };
  }

  if (config.targetIntegerValue && numericValue !== config.targetIntegerValue) {
    return {
      name: testName,
      passed: false,
      error: 'targetIntegerValue mismatch',
      expected: config.targetIntegerValue.toString(),
      found: numericValue.toString(),
    };
  }

  return { name: testName, passed: true };
};

const validateString = (
  testName: string,
  stringValue: string | null | undefined,
  config: ValidationCheck,
  targetValue: string | undefined,
): TestResult => {
  if (config.dataType !== 'string') {
    return { name: testName, passed: false, error: 'wrong-dataType' };
  }

  if (config.shouldBeEmpty && stringValue) {
    return {
      name: testName,
      passed: false,
      error: 'should-be-empty',
      found: stringValue,
    };
  }

  if (!stringValue) {
    if (config.shouldBeEmpty) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'empty',
      found: stringValue || '',
    };
  }

  if (config.targetStringValue) {
    if (stringValue === config.targetStringValue) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'targetStringValue-mismatch',
      expected: config.targetStringValue,
      found: stringValue,
    };
  }

  if (targetValue) {
    if (stringValue === targetValue) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'targetValue-mismatch',
      expected: targetValue,
      found: stringValue,
    };
  }

  if (config.regexExpression) {
    if (stringValue.match(new RegExp(config.regexExpression, config.regexFlags || ''))) {
      return { name: testName, passed: true };
    }
    return {
      name: testName,
      passed: false,
      error: 'regexExpression-mismatch',
      expected: `regex: ${config.regexExpression}`,
      found: stringValue,
    };
  }

  return { name: testName, passed: false, error: 'no-test' };
};

const validJsonValue = (
  testName: string,
  stringValue: string | null | undefined,
  config: ValidationCheck,
  targetValue: boolean | Date | number | string | undefined,
): TestResult => {
  switch (config.dataType) {
    case 'boolean':
      return validateBoolean(testName, stringValue, config, targetValue as boolean);
    case 'date':
      return validateDate(testName, stringValue, config, targetValue as Date);
    case 'number':
      return validateNumber(testName, stringValue, config, targetValue as number);
    case 'string':
      return validateString(testName, stringValue, config, targetValue as string);
  }
  return { name: testName, passed: false, error: 'unknown-datatype' };
};

export default validJsonValue;
