"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markClaimCodeAsUsed = exports.generateClaimCodes = exports.ClaimCodeStatusEnum = void 0;
var bip39ish_1 = require("./bip39ish");
var ClaimCodeStatusEnum;
(function (ClaimCodeStatusEnum) {
    ClaimCodeStatusEnum["CLAIMED"] = "CLAIMED";
    ClaimCodeStatusEnum["NOT_FOUND"] = "NOT_FOUND";
    ClaimCodeStatusEnum["ALREADY_USED"] = "ALREADY_USED";
})(ClaimCodeStatusEnum || (exports.ClaimCodeStatusEnum = ClaimCodeStatusEnum = {}));
function generateRandomClaimCode() {
    return bip39ish_1.default[Math.floor(Math.random() * bip39ish_1.default.length)] + "-" + bip39ish_1.default[Math.floor(Math.random() * bip39ish_1.default.length)];
}
// Function to generate claim codes and save them to a JSON file
function generateClaimCodes(count, claimCodes) {
    if (claimCodes === void 0) { claimCodes = []; }
    var codes = [];
    for (var i = 0; i < count; i++) {
        var pass = false;
        while (pass == false) {
            var code = generateRandomClaimCode();
            if (codes.includes(code)) {
                continue;
            }
            pass = true;
        }
        claimCodes.push({
            code: generateRandomClaimCode(),
            used: false
        });
    }
    return claimCodes;
}
exports.generateClaimCodes = generateClaimCodes;
function markClaimCodeAsUsed(code, claimCodes) {
    var message = "Successfully claimed code";
    var status = ClaimCodeStatusEnum.NOT_FOUND;
    for (var _i = 0, claimCodes_1 = claimCodes; _i < claimCodes_1.length; _i++) {
        var claimCode = claimCodes_1[_i];
        if (claimCode.code === code) {
            if (claimCode.used) {
                message = "Claim code ".concat(code, " has already been used");
                status = ClaimCodeStatusEnum.ALREADY_USED;
                return { status: status, message: message, claimCodes: claimCodes };
            }
            claimCode.used = true;
            status = ClaimCodeStatusEnum.CLAIMED;
            return { status: status, message: message, claimCodes: claimCodes };
        }
    }
    message = "Claim code ".concat(code, " does not exist");
    status = ClaimCodeStatusEnum.NOT_FOUND;
    return { status: status, message: message, claimCodes: claimCodes };
}
exports.markClaimCodeAsUsed = markClaimCodeAsUsed;
