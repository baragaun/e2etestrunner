"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStatus = exports.ServiceType = exports.LogLevel = exports.E2eTestType = void 0;
var E2eTestType;
(function (E2eTestType) {
    E2eTestType["jsonHttpRequest"] = "json-http-request";
    E2eTestType["wait"] = "wait";
})(E2eTestType || (exports.E2eTestType = E2eTestType = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["trace"] = 0] = "trace";
    LogLevel[LogLevel["info"] = 1] = "info";
    LogLevel[LogLevel["warn"] = 2] = "warn";
    LogLevel[LogLevel["error"] = 3] = "error";
    LogLevel[LogLevel["fatal"] = 4] = "fatal";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["generic"] = "generic";
    ServiceType["graphql"] = "graphql";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["ok"] = "ok";
    ServiceStatus["limited"] = "limited";
    ServiceStatus["offline"] = "offline";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
