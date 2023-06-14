import { generateClaimCodes, markClaimCodeAsUsed } from './claimCodes'
import { ClaimCodeT } from './claimCodes'

let claimCodes: ClaimCodeT[] = []
claimCodes = generateClaimCodes(10)
console.log('Claim codes generated:')
console.log(claimCodes)

// Claim the first code
let code = claimCodes[0].code
console.log('Code 1 claimed:')
console.log(markClaimCodeAsUsed(code, claimCodes).claimCodes)

// Claim the Fourth code
code = claimCodes[3].code
console.log('Code 4 claimed:')
console.log(markClaimCodeAsUsed(code, claimCodes).claimCodes)
