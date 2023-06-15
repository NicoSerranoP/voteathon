import fs from 'fs'
import ClaimCodeManager from './packages/claimCodes/src/index'

/** CHANGE THESE AS YOU NEED */
const CLAIM_CODE_PATH = './claimCodes.json'
const PROJECT_ID = 9999
const NUMBER_CLAIM_CODES = 10
const NAME = 'Test Project'

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

claimCodeManager.generateClaimCodeSet(NUMBER_CLAIM_CODES, PROJECT_ID, NAME)
fs.writeFileSync(
    CLAIM_CODE_PATH,
    JSON.stringify(claimCodeManager.getClaimCodeSets())
)
