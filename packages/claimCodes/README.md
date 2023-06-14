# Claim Codes using a subset of Bip39 words

## General Usage

```ts
import { generateClaimCodes, markClaimCodeAsUsed } from 'ClaimCodes'
import { ClaimCodeT } from 'ClaimCodes'

// generateClaimCodes returns an array of ClaimCodeT objects
const claimCodes = generateClaimCodes(10) // [ { code: 'barely-drastic', used: false }, ...}]

let code = claimCodes[0].code

// markClaimCodeAsUsed returns a new object with the claimCodes array updated, a status message, and a status code
const claimCodeStatus = markClaimCodeAsUsed(code, claimCodes)
console.log(claimCodeStatus.status) // CLAIMED
console.log(claimCodeStatus.message) // "Successfully claimed Code"
console.log(claimCodeStatus.claimCodes) // Updated ClaimCodes array
```

## Managing multiple sets of claim codes
