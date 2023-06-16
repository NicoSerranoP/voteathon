import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { joinProject } from '../joinProject'
import { InvalidProofError } from '../errors'

export default (app: Express, _db: DB, synchronizer: Synchronizer) => {
    app.post('/api/project/join', async (req, res) => {
        try {
            const { projectID, publicSignals, proof } = req.body

            const { hash } = await joinProject(synchronizer)(
                projectID, publicSignals, proof
            );

            res.json({ hash })
        } catch (error) {
            if (error instanceof InvalidProofError) {
                res.status(400).json({ error: error.message })
            }

            res.status(500).json({ error })
        }
    })
}
