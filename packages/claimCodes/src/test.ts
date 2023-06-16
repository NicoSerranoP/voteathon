import ClaimCodeManager from './manager'

const claimCodeManager = new ClaimCodeManager()

console.log('Generateing 10 claim codes for Project1')
const project1ID = 0
const p1 = claimCodeManager.generateClaimCodeSet(10, project1ID)
const claimCode1 = p1.claimCodes[0].code
console.log('Generating 3 claim codes not assigned to a project')
claimCodeManager.generateClaimCodeSet(3)

console.log('Generated claim codes:')
console.log(claimCodeManager.getClaimCodeSets())

console.log('Claiming code ' + claimCode1 + ' from Project 1')
claimCodeManager.claimCode(claimCode1)
console.log(claimCodeManager.getClaimCodeSets())
