import bip39ish from "./bip39ish";
import { ClaimCodeT, claimCodeSetsT } from "./types";

export enum ClaimCodeStatusEnum {
  CLAIMED = "CLAIMED",
  NOT_FOUND = "NOT_FOUND",
  ALREADY_USED = "ALREADY_USED",
}

export interface ClaimCodeStatus {
  status: ClaimCodeStatusEnum
  message: string
  claimCodes: ClaimCodeT[]
  name?: string
}

export default class ClaimCodeManager {
  claimCodeSets: claimCodeSetsT;

  constructor(claimCodeSetInput: claimCodeSetsT = { "SINGLES": [] }) {
    this.claimCodeSets = claimCodeSetInput
  }

  private generateRandomClaimCode() {
    return bip39ish[Math.floor(Math.random() * bip39ish.length)] + "-" + bip39ish[Math.floor(Math.random() * bip39ish.length)];
  }

  private generateClaimCodes(count: number, claimCodes: ClaimCodeT[] = []): ClaimCodeT[] {
    let codes: string[] = []
    for (let i = 0; i < count; i++) {
        let pass = false;
        while (pass == false) {
            let code: string = this.generateRandomClaimCode();
            if (codes.includes(code)) {
                continue;
            }
            pass = true;
        }
        claimCodes.push({
            code: this.generateRandomClaimCode(),
            used: false
        });
    }
    return claimCodes;
  }

  generateClaimCodeSet(count: number, name: string = "SINGLES") {
    if (this.claimCodeSets[name]) {
      this.claimCodeSets[name] = this.generateClaimCodes(count, this.claimCodeSets[name])
    } else {
      this.claimCodeSets[name] = this.generateClaimCodes(count)
    }

    return this.claimCodeSets[name]
  }

  private markClaimCodeAsUsed(code: string, claimCodes: ClaimCodeT[]): ClaimCodeStatus {
    let message = "Successfully claimed code";
    let status = ClaimCodeStatusEnum.NOT_FOUND;
    for (let claimCode of claimCodes) {
        if (claimCode.code === code) {
            if (claimCode.used) {
                message = `Claim code ${code} has already been used`
                status = ClaimCodeStatusEnum.ALREADY_USED
                return { status, message, claimCodes }
            }
            claimCode.used = true;
            status = ClaimCodeStatusEnum.CLAIMED
            return {status, message, claimCodes};
        }
    }
    message = `Claim code ${code} does not exist`
    status = ClaimCodeStatusEnum.NOT_FOUND
    return { status, message, claimCodes }
}

  claimCode(code: string): ClaimCodeStatus {
    for (let claimCodeSet in this.claimCodeSets) {
      let result = this.markClaimCodeAsUsed(code, this.claimCodeSets[claimCodeSet])
      if (result.status === ClaimCodeStatusEnum.CLAIMED) {
        result.name = claimCodeSet
        return result
      }
      else if (result.status === ClaimCodeStatusEnum.ALREADY_USED) {
        result.name = claimCodeSet
        return result
      }
      else {
        continue
      }
    }
    return { status: ClaimCodeStatusEnum.NOT_FOUND, message: `Claim code ${code} does not exist`, claimCodes: [] }
  }

  getClaimCodeSets(): claimCodeSetsT {
    return this.claimCodeSets
  }

  getClaimCodeSet(name: string = "SINGLES"): ClaimCodeT[] {
    if (this.claimCodeSets[name]) {
      return this.claimCodeSets[name]
    } else {
      throw new Error(`Claim code set with name ${name} does not exist`)
    }
  }
}