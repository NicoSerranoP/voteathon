"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markClaimCodeAsUsed = exports.generateClaimCodes = void 0;
var claimCodes_1 = require("./claimCodes");
Object.defineProperty(exports, "generateClaimCodes", { enumerable: true, get: function () { return claimCodes_1.generateClaimCodes; } });
Object.defineProperty(exports, "markClaimCodeAsUsed", { enumerable: true, get: function () { return claimCodes_1.markClaimCodeAsUsed; } });
var manager_1 = require("./manager");
exports.default = manager_1.ClaimCodeManager;
