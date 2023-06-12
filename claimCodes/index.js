"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markClaimCodeAsUsed = exports.generateClaimCodes = void 0;
var bip39ish_1 = require("./bip39ish");
var claimCodes = [];
function generateRandomString() {
    return bip39ish_1.default[Math.floor(Math.random() * bip39ish_1.default.length)] + "-" + bip39ish_1.default[Math.floor(Math.random() * bip39ish_1.default.length)];
}
// Function to generate claim codes and save them to a JSON file
function generateClaimCodes(count) {
    for (var i = 0; i < count; i++) {
        claimCodes.push({
            code: generateRandomString(),
            used: false
        });
    }
}
exports.generateClaimCodes = generateClaimCodes;
function markClaimCodeAsUsed(code) {
    for (var _i = 0, claimCodes_1 = claimCodes; _i < claimCodes_1.length; _i++) {
        var claimCode = claimCodes_1[_i];
        if (claimCode.code === code) {
            if (claimCode.used) {
                console.warn("Claim code ".concat(code, " has already been used"));
                return false;
            }
            claimCode.used = true;
            return true;
        }
    }
    console.warn("Claim code ".concat(code, " does not exist"));
    return false;
}
exports.markClaimCodeAsUsed = markClaimCodeAsUsed;
console.log(generateClaimCodes(5));
