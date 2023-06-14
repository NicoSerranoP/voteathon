import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import { joinProject } from '../joinProject'

export default (app: Express, _db: DB, synchronizer: Synchronizer) => {
    app.post('/api/project/join', async (req, res) => {
        try {
            const { projectID, publicSignals, proof } = req.body

            const { hash } = await joinProject(synchronizer)(
                projectID, publicSignals, proof
            );

            res.json({ hash })
        } catch (error: any) {
            res.status(500).json({ error })
        }
    })
}
