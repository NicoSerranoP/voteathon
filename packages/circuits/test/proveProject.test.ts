import { expect } from 'chai'
import * as utils from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import { Circuit, CircuitConfig } from '@unirep/circuits'
import { defaultProver } from '../provers/defaultProver'

const { FIELD_COUNT, SUM_FIELD_COUNT, STATE_TREE_DEPTH } = CircuitConfig.default

const circuit = 'projectProof'

const genCircuitInput = (config: {
    id: Identity
    epoch: number
    attesterId: number | bigint
    sumField?: (bigint | number)[]
    replField?: (bigint | number)[]
    proveValues?: (bigint | number)[]
}) => {
    const { id, epoch, attesterId, sumField, replField, proveValues } =
        Object.assign(
            {
                minRep: 0,
                maxRep: 0,
                graffitiPreImage: 0,
                sumField: [],
                replField: [],
                proveValues: [],
            },
            config
        )

    const startBalance = [
        ...sumField,
        ...Array(SUM_FIELD_COUNT - sumField.length).fill(0),
        ...replField,
        ...Array(FIELD_COUNT - SUM_FIELD_COUNT - replField.length).fill(0),
    ]
    // Global state tree
    const stateTree = new utils.IncrementalMerkleTree(STATE_TREE_DEPTH)
    const hashedLeaf = utils.genStateTreeLeaf(
        id.secret,
        BigInt(attesterId),
        epoch,
        startBalance as any
    )
    stateTree.insert(hashedLeaf)
    const stateTreeProof = stateTree.createProof(0) // if there is only one GST leaf, the index is 0
    const circuitInputs = {
        state_tree_indexes: stateTreeProof.pathIndices,
        state_tree_elements: stateTreeProof.siblings,
        data: startBalance,
        identity_secret: id.secret,
        reveal_nonce: 1,
        attester_id: attesterId,
        epoch: epoch,
        nonce: 0,
        sig_data: 0,
        project_epoch_keys: Array(10).fill(0),
    }
    return utils.stringifyBigInts(circuitInputs)
}

const genProofAndVerify = async (
    circuit: Circuit | string,
    circuitInputs: any
) => {
    const startTime = new Date().getTime()
    const { proof, publicSignals } =
        await defaultProver.genProofAndPublicSignals(circuit, circuitInputs)
    const endTime = new Date().getTime()
    console.log(
        `Gen Proof time: ${endTime - startTime} ms (${Math.floor(
            (endTime - startTime) / 1000
        )} s)`
    )
    console.log('publicSignals', publicSignals)
    console.log('proof', proof)

    const isValid = await defaultProver.verifyProof(
        circuit,
        publicSignals,
        proof
    )
    return { isValid, proof, publicSignals }
}

describe('Prove project', function () {
    this.timeout(300000)

    it('should generate a project proof', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            attesterId,
        })
        const { isValid } = await genProofAndVerify(circuit, circuitInputs)
        expect(isValid).to.be.true
    })

    it('should generate a project proof with values', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const sumField = Array(SUM_FIELD_COUNT).fill(5)
        const proveValues = Array(SUM_FIELD_COUNT).fill(4)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            attesterId,
            sumField,
            proveValues,
        })
        const { isValid } = await genProofAndVerify(circuit, circuitInputs)
        expect(isValid).to.be.true
    })

    it('should not generate a project proof with invalid values', async () => {
        const id = new Identity()
        const epoch = 20
        const attesterId = BigInt(219090124810)
        const sumField = Array(SUM_FIELD_COUNT).fill(5)
        const proveValues = Array(SUM_FIELD_COUNT).fill(6)
        const circuitInputs = genCircuitInput({
            id,
            epoch,
            attesterId,
            sumField,
            proveValues,
        })
        await new Promise<void>((rs, rj) => {
            genProofAndVerify(circuit, circuitInputs)
                .then(() => rj())
                .catch(() => rs())
        })
    })
})
