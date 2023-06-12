import { generateClaimCodes, markClaimCodeAsUsed, ClaimCodeT, ClaimCodeStatusEnum } from './claimCodes';

export class ClaimCodeManager {
  claimCodeSets: {[key: string]: ClaimCodeT[]}; // fix type of claimCodeSets

  constructor() {
    this.claimCodeSets = { "SINGLES": [] }; // initialize claimCodeSets with an empty array
  }

  generateClaimCodeSet(name: string, count: number) {
    if (this.claimCodeSets[name]) {
      throw new Error(`Claim code set with name ${name} already exists`)
    }
    this.claimCodeSets[name] = generateClaimCodes(count)
  }

  claimCode(code: string) {
    for (let claimCodeSet in this.claimCodeSets) {
      let result = markClaimCodeAsUsed(code, this.claimCodeSets[claimCodeSet])
      if (result.status === ClaimCodeStatusEnum.CLAIMED) {
        return result
      }
      else if (result.status === ClaimCodeStatusEnum.ALREADY_USED) {
        return result
      }
      else {
        continue
      }
    }
    return { status: ClaimCodeStatusEnum.NOT_FOUND, message: `Claim code ${code} does not exist`, claimCodes: [] }
  }

}