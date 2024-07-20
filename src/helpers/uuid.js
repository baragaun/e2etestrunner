"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uuid = void 0;
var node_crypto_1 = require("node:crypto");
var Uuid = /** @class */ (function () {
    function Uuid() {
    }
    Uuid.prototype.v4 = function (options) {
        return (0, node_crypto_1.randomUUID)(options);
    };
    return Uuid;
}());
exports.Uuid = Uuid;
exports.default = new Uuid();
