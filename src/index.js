"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uuid = exports.BgE2eTestSuite = void 0;
__exportStar(require("./definitions"), exports);
var BgE2eTestSuite_1 = require("./BgE2eTestSuite");
Object.defineProperty(exports, "BgE2eTestSuite", { enumerable: true, get: function () { return BgE2eTestSuite_1.BgE2eTestSuite; } });
var uuid_1 = require("./helpers/uuid");
Object.defineProperty(exports, "Uuid", { enumerable: true, get: function () { return uuid_1.Uuid; } });
var uuid_2 = require("./helpers/uuid");
exports.default = uuid_2.default;
