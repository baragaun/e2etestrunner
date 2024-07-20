"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replaceVarsInObject = function (obj, vars) {
    if (!obj ||
        Object.keys(obj).length < 1 ||
        !vars ||
        Object.keys(vars).length < 1) {
        return obj;
    }
    Object.keys(obj).forEach(function (objKey) {
        Object.keys(vars).forEach(function (varKey) {
            obj[objKey] = obj[objKey].replace("${".concat(varKey, "}"), vars[varKey]);
        });
    });
    return obj;
};
exports.default = replaceVarsInObject;
