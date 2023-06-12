import { generateClaimCodes, markClaimCodeAsUsed, ClaimCodeT, ClaimCodeStatus, ClaimCodeStatusEnum } from './claimCodes';

type claimCodeSetsT = {[key: string]: ClaimCodeT[]}

export class ClaimCodeManager {
  claimCodeSets: claimCodeSetsT;

  constructor(claimCodeSetInput: claimCodeSetsT) {
    if (claimCodeSetInput) {
      this.claimCodeSets = claimCodeSetInput
    } else {
      this.claimCodeSets = { "SINGLES": [] } // initialize claimCodeSets with an empty array
    }
  }

  generateClaimCodeSet(name: string, count: number) {
    if (this.claimCodeSets[name]) {
      throw new Error(`Claim code set with name ${name} already exists`)
    }
    this.claimCodeSets[name] = generateClaimCodes(count)
  }

  claimCode(code: string): ClaimCodeStatus {
    for (let claimCodeSet in this.claimCodeSets) {
      let result = markClaimCodeAsUsed(code, this.claimCodeSets[claimCodeSet])
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

}