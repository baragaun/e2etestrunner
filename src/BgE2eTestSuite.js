"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BgE2eTestSuite = void 0;
var definitions_1 = require("./definitions");
var mergeVars_1 = require("./helpers/mergeVars");
var replaceVarsInObject_1 = require("./helpers/replaceVarsInObject");
var replaceVars_1 = require("./helpers/replaceVars");
var fetchJson_1 = require("./helpers/fetchJson");
// @ts-ignore
var jsonpath_1 = require("jsonpath");
var validateValue_1 = require("./helpers/validateValue");
var logger_1 = require("./helpers/logger");
var BgE2eTestSuite = /** @class */ (function () {
    function BgE2eTestSuite(config) {
        this.config = config;
    }
    BgE2eTestSuite.prototype.run = function (config, logLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var results, i, sequence, j, passed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.default.trace('BgE2eTestSuite.run called', { config: config });
                        if (config) {
                            this.config = config;
                        }
                        if (logLevel) {
                            logger_1.default.setLogLevel(logLevel);
                        }
                        results = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.config.sequences.length)) return [3 /*break*/, 6];
                        sequence = this.config.sequences[i];
                        j = 0;
                        _a.label = 2;
                    case 2:
                        if (!(j < sequence.tests.length)) return [3 /*break*/, 5];
                        if (!(sequence.tests[j].enabled === undefined || sequence.tests[j].enabled)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.runTest(sequence.tests[j], sequence, this.config, results)];
                    case 3:
                        results = _a.sent();
                        _a.label = 4;
                    case 4:
                        j++;
                        return [3 /*break*/, 2];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        passed = !results.some(function (r) { return !r.passed; });
                        return [2 /*return*/, { passed: passed, checks: results }];
                }
            });
        });
    };
    BgE2eTestSuite.prototype.runTest = function (test, sequence, suite, results) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                logger_1.default.trace('BgE2eTestSuite.runTest called', { test: test, sequence: sequence, suite: suite });
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var run = function () {
                            switch (test.type) {
                                case definitions_1.E2eTestType.jsonHttpRequest:
                                    _this.runJsonHttpRequest(test, sequence, suite, results)
                                        .then(function (results) {
                                        if (test.waitMilliSecondsAfter) {
                                            setTimeout(function () {
                                                resolve(results);
                                            }, test.waitMilliSecondsAfter || 2000);
                                            return;
                                        }
                                        resolve(results);
                                    }, reject);
                                    return;
                                case definitions_1.E2eTestType.wait:
                                    setTimeout(function () {
                                        resolve(results);
                                    }, test.waitMilliSecondsAfter || test.waitMilliSecondsBefore || 2000);
                                    return;
                            }
                            logger_1.default.error('BgE2eTestSuite.runTest: unknown type', { test: test });
                            reject('unknown test type');
                        };
                        if (test.waitMilliSecondsBefore) {
                            setTimeout(run, test.waitMilliSecondsBefore);
                            return;
                        }
                        run();
                    })];
            });
        });
    };
    BgE2eTestSuite.prototype.runJsonHttpRequest = function (test, sequence, suite, results) {
        return __awaiter(this, void 0, void 0, function () {
            var testName, vars, headers, requestConfig, _a, response, data, error;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        logger_1.default.trace('BgE2eTestSuite.runJsonHttpRequest called', { test: test, sequence: sequence, suite: suite });
                        testName = "".concat(sequence.name, ".").concat(test.name);
                        vars = (0, mergeVars_1.default)(suite.vars, sequence.vars);
                        vars = (0, mergeVars_1.default)(vars, test.vars);
                        headers = (0, mergeVars_1.default)(suite.headers, sequence.headers);
                        headers = (0, replaceVarsInObject_1.default)((0, mergeVars_1.default)(headers, test.headers), vars);
                        requestConfig = {
                            url: (0, replaceVars_1.default)(test.endpoint || sequence.endpoint || suite.endpoint || '', vars),
                            method: sequence.method || test.method,
                            headers: headers,
                            data: test.data ? (0, replaceVars_1.default)(test.data, vars) : '',
                        };
                        return [4 /*yield*/, (0, fetchJson_1.default)(requestConfig)];
                    case 1:
                        _a = _h.sent(), response = _a.response, data = _a.data, error = _a.error;
                        if (error) {
                            results.push({ name: testName, passed: false, error: "error-in-response: ".concat(error, "; data: ").concat(data || '') });
                            return [2 /*return*/, results];
                        }
                        if (!response) {
                            results.push({ name: testName, passed: false, error: "error-response: empty" });
                            return [2 /*return*/, results];
                        }
                        if (!data) {
                            results.push({ name: testName, passed: false, error: 'no-data-in-response' });
                            return [2 /*return*/, results];
                        }
                        if (Array.isArray(data.errors) && data.errors.length > 0) {
                            results.push({ name: testName, passed: false, error: "error-response: ".concat(data.errors.join(', ')) });
                            return [2 /*return*/, results];
                        }
                        if (Array.isArray((_b = test.response) === null || _b === void 0 ? void 0 : _b.readVars) && ((_c = test.response) === null || _c === void 0 ? void 0 : _c.readVars.length) > 0) {
                            (_d = test.response) === null || _d === void 0 ? void 0 : _d.readVars.forEach(function (readVar) {
                                var _a, _b;
                                var value = undefined;
                                try {
                                    var values = jsonpath_1.default.query(data, readVar.jsonPath);
                                    if (Array.isArray(values) && values.length === 1) {
                                        value = values[0];
                                    }
                                }
                                catch (error) {
                                    logger_1.default.error('BgE2eTestSuite.runJsonHttpRequest: error', { test: test, error: error });
                                }
                                if (value) {
                                    if (readVar.scope === 'suite') {
                                        if (suite.vars) {
                                            suite.vars[readVar.name] = value;
                                        }
                                        else {
                                            suite.vars = (_a = {}, _a[readVar.name] = value, _a);
                                        }
                                    }
                                    else if (readVar.scope === 'sequence') {
                                        if (sequence.vars) {
                                            sequence.vars[readVar.name] = value;
                                        }
                                        else {
                                            sequence.vars = (_b = {}, _b[readVar.name] = value, _b);
                                        }
                                    }
                                }
                            });
                        }
                        if (Array.isArray((_e = test.response) === null || _e === void 0 ? void 0 : _e.checks) && ((_f = test.response) === null || _f === void 0 ? void 0 : _f.checks.length) > 0) {
                            (_g = test.response) === null || _g === void 0 ? void 0 : _g.checks.filter(function (check) { return check.enabled === undefined || check.enabled; }).forEach(function (check) {
                                var value = undefined;
                                try {
                                    var values = jsonpath_1.default.query(data, check.jsonPath);
                                    if (Array.isArray(values) && values.length === 1) {
                                        value = values[0];
                                    }
                                    var targetValue = void 0;
                                    if (check.targetVar && vars) {
                                        targetValue = vars[check.targetVar];
                                    }
                                    results.push((0, validateValue_1.default)("".concat(testName, ".").concat(check.name), value, check, targetValue));
                                }
                                catch (error) {
                                    logger_1.default.error('BgE2eTestSuite.runJsonHttpRequest: error', { test: test, error: error });
                                }
                            });
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    return BgE2eTestSuite;
}());
exports.BgE2eTestSuite = BgE2eTestSuite;
