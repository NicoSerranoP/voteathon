import fs from 'fs'
import ClaimCodeManager from './packages/claimCodes/src/index'
import { projects } from './projects-partipants.json'

/** CHANGE THESE AS YOU NEED */
const CLAIM_CODE_PATH = './claimCodes.json'

/** DO NOT CHANGE BELOW HERE */
let claimCodes = undefined
let claimCodeManager: ClaimCodeManager | undefined = undefined

try {
    claimCodes = JSON.parse(fs.readFileSync(CLAIM_CODE_PATH, 'utf8'))
} catch (error) {
    console.error('Error reading claimCodes.json:', error)
}

if (claimCodes !== undefined) {
    claimCodeManager = new ClaimCodeManager(claimCodes)
} else {
    claimCodeManager = new ClaimCodeManager()
}

for (const proj of projects) {
    claimCodeManager.generateClaimCodeSet(
        proj.members.length,
        proj.id,
        proj.name
    )
}

fs.writeFileSync(
    CLAIM_CODE_PATH,
    JSON.stringify(claimCodeManager.getClaimCodeSets(), null, 4)
)
