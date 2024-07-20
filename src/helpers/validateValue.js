"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validateBoolean = function (testName, stringValue, config, targetValue) {
    var _a;
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
                    ? (_a = config.targetBooleanValue) === null || _a === void 0 ? void 0 : _a.toString()
                    : 'N/A',
            found: 'empty',
        };
    }
    var booleanValue = ['1', 'true', 'yes'].includes(stringValue.toLowerCase());
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
var validateDate = function (testName, stringValue, config, targetValue) {
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
    var dateValue = new Date(stringValue);
    if (!dateValue) {
        return { name: testName, passed: false, error: 'failed to parse string to date' };
    }
    var timestamp = dateValue.getTime();
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
            expected: ">".concat(config.notBeforeDate.toISOString()),
            found: stringValue,
        };
    }
    if (config.notAfterDate && timestamp < config.notAfterDate.getTime()) {
        return {
            name: testName,
            passed: false,
            error: 'too-late',
            expected: "<".concat(config.notAfterDate.toISOString()),
            found: stringValue,
        };
    }
    return { name: testName, passed: true };
};
var validateNumber = function (testName, stringValue, config, targetValue) {
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
    var numericValue = Number.parseInt(stringValue);
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
            expected: ">".concat(config.minNumericValue),
            found: stringValue,
        };
    }
    if (config.maxNumericValue && numericValue > config.maxNumericValue) {
        return {
            name: testName,
            passed: false,
            error: 'too large',
            expected: "<".concat(config.maxNumericValue),
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
var validateString = function (testName, stringValue, config, targetValue) {
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
            expected: "regex: ".concat(config.regexExpression),
            found: stringValue,
        };
    }
    return { name: testName, passed: false, error: 'no-test' };
};
var validJsonValue = function (testName, stringValue, config, targetValue) {
    switch (config.dataType) {
        case 'boolean':
            return validateBoolean(testName, stringValue, config, targetValue);
        case 'date':
            return validateDate(testName, stringValue, config, targetValue);
        case 'number':
            return validateNumber(testName, stringValue, config, targetValue);
        case 'string':
            return validateString(testName, stringValue, config, targetValue);
    }
    return { name: testName, passed: false, error: 'unknown-datatype' };
};
exports.default = validJsonValue;
