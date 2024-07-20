"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enums_1 = require("../enums");
var logLevel = enums_1.LogLevel.fatal;
var log = function (level, message, data) {
    if (level < logLevel) {
        return;
    }
    console.log(JSON.stringify({
        level: level,
        timestamp: new Date().toISOString(),
        message: message,
        data: data,
    }));
};
var logger = {
    setLogLevel: function (level) {
        if (typeof level === 'string') {
            for (var key in enums_1.LogLevel) {
                if (enums_1.LogLevel[key] === level) {
                    logLevel = parseInt(key);
                }
            }
            return;
        }
        logLevel = level !== null && level !== void 0 ? level : enums_1.LogLevel.fatal;
    },
    trace: function (message, data) { return log(enums_1.LogLevel.trace, message, data); },
    info: function (message, data) { return log(enums_1.LogLevel.info, message, data); },
    warn: function (message, data) { return log(enums_1.LogLevel.warn, message, data); },
    error: function (message, data) { return log(enums_1.LogLevel.error, message, data); },
    fatal: function (message, data) { return log(enums_1.LogLevel.fatal, message, data); },
};
exports.default = logger;
