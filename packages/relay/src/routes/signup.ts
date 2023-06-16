import { SignupProof } from '@unirep/circuits'
import { ethers } from 'ethers'
import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/Voteathon.sol/Voteathon.json'
import ClaimCodeManager, {ClaimCodeStatus, ClaimCodeStatusEnum} from '../../../claimCodes/src/index';
import fs from 'fs';
import path from 'path';

const CLAIM_CODE_PATH = path.join(__dirname, '../../../../claimCodes.json')

let claimCodes = undefined;

try {
    claimCodes = JSON.parse(fs.readFileSync(CLAIM_CODE_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading claimCodes.json:', error);
}

const claimCodeManager = new ClaimCodeManager(claimCodes? claimCodes : undefined);

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.post('/api/signup', async (req, res) => {
        try {
            const { publicSignals, proof, claimCode } = req.body
            let projectID: number | undefined = undefined;
            const signupProof = new SignupProof(
                publicSignals,
                proof,
                synchronizer.prover
            )

            const claimCodeStatus = await claimCodeManager.claimCode(claimCode)

            if (claimCodeStatus.status === ClaimCodeStatusEnum.ALREADY_USED) {
                res.status(400).json({ error: 'CLAIM CODE USED, CONTACT ADMINS' })
                return
            } else if (claimCodeStatus.status === ClaimCodeStatusEnum.NOT_FOUND) {
                res.status(400).json({ error: 'CLAIM CODE NOT FOUND' })
                return
            }
            else if (claimCodeStatus.status === ClaimCodeStatusEnum.CLAIMED) {
                projectID = claimCodeStatus.projectID;
                fs.writeFileSync(CLAIM_CODE_PATH, JSON.stringify(claimCodeManager.getClaimCodeSets()));
                console.info('CLAIM CODE CLAIMED: ' + claimCode)
            } else {
                res.status(400).json({ error: 'CLAIM CODE UNKNOWN STATUS' })
                console.error(claimCodeStatus)
                return
            }

            const valid = await signupProof.verify()
            if (!valid) {
                res.status(400).json({ error: 'Invalid proof' })
                return
            }

            const currentEpoch = synchronizer.calcCurrentEpoch()
            if (currentEpoch !== Number(signupProof.epoch)) {
                res.status(400).json({ error: 'Wrong epoch' })
                return
            }
            // make a transaction lil bish
            const appContract = new ethers.Contract(APP_ADDRESS, UNIREP_APP.abi)
            // const contract =
            const calldata = appContract.interface.encodeFunctionData(
                'userSignUp',
                [signupProof.publicSignals, signupProof.proof]
            )
            const hash = await TransactionManager.queueTransaction(
                APP_ADDRESS,
                calldata
            )
            res.json({ hash: hash, projectID: projectID })
        } catch (error) {
            res.status(500).json({ error })
        }
    })
}
