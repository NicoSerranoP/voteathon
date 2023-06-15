# Claim Codes using a subset of Bip39 words

## General Usage
```ts
import ClaimCodeManager from './manager'

const claimCodeManager = new ClaimCodeManager()

console.log("Generateing 10 claim codes for Project1")
const p1 = claimCodeManager.generateClaimCodeSet(10, 1)
const claimCode1 = p1[0].code
console.log("Generating 3 claim codes not assigned to a project")
claimCodeManager.generateClaimCodeSet(3)

console.log("Generated claim codes:")
console.log(claimCodeManager.getClaimCodeSets())

console.log("Claiming code " + claimCode1 + " from Project 1")
claimCodeManager.claimCode(claimCode1)
console.log(claimCodeManager.getClaimCodeSets())

const SINGLES = claimCodeManager.getClaimCodeSet() // returns "SINGLES" claim code set if no name is provided
const claimCode2 = SINGLES[0].code

console.log("Claiming code " + claimCode2 + " from no project")
claimCodeManager.claimCode(claimCode2)
console.log(claimCodeManager.getClaimCodeSets())
```