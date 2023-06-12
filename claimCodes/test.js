"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var claimCodes = [];
claimCodes = (0, index_1.generateClaimCodes)(10);
console.log("Claim codes generated:");
console.log(claimCodes);
// Claim the first code
var code = claimCodes[0].code;
console.log("Code 1 claimed:");
console.log((0, index_1.markClaimCodeAsUsed)(code, claimCodes).claimCodes);
// Claim the Fourth code
code = claimCodes[3].code;
console.log("Code 4 claimed:");
console.log((0, index_1.markClaimCodeAsUsed)(code, claimCodes).claimCodes);
