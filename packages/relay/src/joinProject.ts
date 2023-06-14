import { ethers, BigNumberish } from 'ethers'
import { Synchronizer } from '@unirep/core'
import { EpochKeyProof } from '@unirep/circuits'
import { SnarkProof } from '@unirep/utils'
import { APP_ADDRESS } from './config'
import TransactionManager from './singletons/TransactionManager'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/Voteathon.sol/Voteathon.json'

export const joinProject = (synchronizer: Synchronizer) => 
    async (
        projectID: number,
        publicSignals: BigNumberish[],
        proof: SnarkProof
    ): Promise<{ hash: string }> => {
    const epochKeyProof = new EpochKeyProof(
        publicSignals,
        proof,
        synchronizer.prover
    )
    const valid = await epochKeyProof.verify()
    if (!valid) {
        // TODO Turn to HTTP 400 in route via custom error
        throw new Error('Invalid proof')
    }
    const appContract = new ethers.Contract(APP_ADDRESS, UNIREP_APP.abi)

    const calldata = appContract.interface.encodeFunctionData(
        'joinProject',
        [projectID, publicSignals, proof]
    )

    const hash = await TransactionManager.queueTransaction(
        APP_ADDRESS,
        calldata
    )

    return { hash }
}