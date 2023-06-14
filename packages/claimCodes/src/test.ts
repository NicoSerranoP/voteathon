import ClaimCodeManager from './manager'

const claimCodeManager = new ClaimCodeManager()

console.log("Generateing 10 claim codes for Project1")
const project1ID = 0;
const p1 = claimCodeManager.generateClaimCodeSet(10, project1ID)
const claimCode1 = p1[0].code
console.log("Generating 3 claim codes not assigned to a project")
claimCodeManager.generateClaimCodeSet(3)

console.log("Generated claim codes:")
console.log(claimCodeManager.getClaimCodeSets())

console.log("Claiming code " + claimCode1 + " from Project1")
claimCodeManager.claimCode(claimCode1)
console.log(claimCodeManager.getClaimCodeSets())

const SINGLES = claimCodeManager.getClaimCodeSet() // returns "SINGLES" claim code set if no name is provided
const claimCode2 = SINGLES[0].code

console.log("Claiming code " + claimCode2 + " from no project")
claimCodeManager.claimCode(claimCode2)
console.log(claimCodeManager.getClaimCodeSets())