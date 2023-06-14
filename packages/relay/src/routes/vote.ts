import { ethers } from 'ethers'
import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { EpochKeyProof } from '@unirep/circuits'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/Voteathon.sol/Voteathon.json'

export default (app: Express, _db: DB, synchronizer: Synchronizer) => {
    app.post('/api/vote', async (req, res) => {
        try {
            const { projectID, emoji, publicSignals, proof } = req.body

            const epochKeyProof = new EpochKeyProof(
                publicSignals,
                proof,
                synchronizer.prover
            )
            const valid = await epochKeyProof.verify()
            if (!valid) {
                res.status(400).json({ error: 'Invalid proof' })
                return
            }
            const appContract = new ethers.Contract(APP_ADDRESS, UNIREP_APP.abi)

            const calldata = appContract.interface.encodeFunctionData(
                'vote',
                [projectID, emoji, publicSignals, proof]
            )

            const hash = await TransactionManager.queueTransaction(
                APP_ADDRESS,
                calldata
            )
            res.json({ hash })
        } catch (error: any) {
            res.status(500).json({ error })
        }
    })
}
