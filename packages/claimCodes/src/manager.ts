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
  projectID?: number
}

export default class ClaimCodeManager {
  claimCodeSets: claimCodeSetsT;

  constructor(claimCodeSetInput: claimCodeSetsT = { 0: [] }) {
    for (let claimCodeSet in claimCodeSetInput) {
      if (typeof (claimCodeSet) !== "number") {
        throw new Error("Claim code set must be a number")
      }
    }
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

  generateClaimCodeSet(count: number, projectID: number = 0) {
    if (this.claimCodeSets[projectID]) {
      this.claimCodeSets[projectID] = this.generateClaimCodes(count, this.claimCodeSets[projectID])
    } else {
      this.claimCodeSets[projectID] = this.generateClaimCodes(count)
    }

    return this.claimCodeSets[projectID]
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
        result.projectID = Number(claimCodeSet)
        return result
      }
      else if (result.status === ClaimCodeStatusEnum.ALREADY_USED) {
        result.projectID = Number(claimCodeSet)
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

  getClaimCodeSet(projectID: number = 0): ClaimCodeT[] {
    if (this.claimCodeSets[projectID]) {
      return this.claimCodeSets[projectID]
    } else {
      throw new Error(`Claim code set with projectID ${projectID} does not exist`)
    }
  }
}