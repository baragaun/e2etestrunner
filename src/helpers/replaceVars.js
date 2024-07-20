"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replaceVars = function (text, vars) {
    if (!text || !vars || Object.keys(vars).length < 1) {
        return text;
    }
    var newText = text;
    Object.keys(vars).forEach(function (key) {
        newText = newText.replace("${".concat(key, "}"), vars[key]);
    });
    return newText;
};
exports.default = replaceVars;
