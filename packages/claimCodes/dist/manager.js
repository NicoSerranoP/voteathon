"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimCodeManager = void 0;
var claimCodes_1 = require("./claimCodes");
var ClaimCodeManager = /** @class */ (function () {
    function ClaimCodeManager() {
        this.claimCodeSets = { "SINGLES": [] }; // initialize claimCodeSets with an empty array
    }
    ClaimCodeManager.prototype.generateClaimCodeSet = function (name, count) {
        if (this.claimCodeSets[name]) {
            throw new Error("Claim code set with name ".concat(name, " already exists"));
        }
        this.claimCodeSets[name] = (0, claimCodes_1.generateClaimCodes)(count);
    };
    ClaimCodeManager.prototype.claimCode = function (code) {
        for (var claimCodeSet in this.claimCodeSets) {
            var result = (0, claimCodes_1.markClaimCodeAsUsed)(code, this.claimCodeSets[claimCodeSet]);
            if (result.status === claimCodes_1.ClaimCodeStatusEnum.CLAIMED) {
                return result;
            }
            else if (result.status === claimCodes_1.ClaimCodeStatusEnum.ALREADY_USED) {
                return result;
            }
            else {
                continue;
            }
        }
        return { status: claimCodes_1.ClaimCodeStatusEnum.NOT_FOUND, message: "Claim code ".concat(code, " does not exist"), claimCodes: [] };
    };
    return ClaimCodeManager;
}());
exports.ClaimCodeManager = ClaimCodeManager;
