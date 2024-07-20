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
var logger_1 = require("./logger");
var fetchJson = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, error, error_1, data, error_2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_1.default.trace('fetchJson called.', { config: config });
                response = undefined;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 10, , 11]);
                return [4 /*yield*/, fetch(config.url, {
                        method: config.method,
                        headers: config.headers,
                        body: config.data,
                    })];
            case 2:
                response = _a.sent();
                logger_1.default.trace('fetchJson: received response', { response: response });
                if (!response) {
                    logger_1.default.warn('fetchJson: no response', { config: config });
                    return [2 /*return*/, { response: response, error: 'no-response' }];
                }
                if (!(response.status > 399)) return [3 /*break*/, 6];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, response.text()];
            case 4:
                data = _a.sent();
                error = response.status === 401
                    ? 'unauthorized'
                    : 'server-error';
                return [2 /*return*/, { response: response, error: error, data: data }];
            case 5:
                error_1 = _a.sent();
                logger_1.default.error('fetchJson: error', { config: config, error: error_1 });
                return [2 /*return*/, { response: response, error: 'server-error' }];
            case 6:
                _a.trys.push([6, 8, , 9]);
                return [4 /*yield*/, response.json()];
            case 7:
                data = _a.sent();
                return [2 /*return*/, { response: response, data: data }];
            case 8:
                error_2 = _a.sent();
                logger_1.default.error('fetchJson: error', { config: config, error: error_2 });
                return [2 /*return*/, { response: response, error: 'error-reading-response' }];
            case 9: return [3 /*break*/, 11];
            case 10:
                error_3 = _a.sent();
                logger_1.default.error('fetchJson: error', { config: config, error: error_3 });
                return [2 /*return*/, { response: response, error: error_3.message }];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.default = fetchJson;
