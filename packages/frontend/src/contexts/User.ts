import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { stringifyBigInts } from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { DataProof, ProjectProof } from '@unirep-app/circuits'
import { SERVER } from '../config'
import prover from './prover'
import { BigNumberish, ethers } from 'ethers'
import Voteathon from '@unirep-app/contracts/abi/Voteathon.json'

class User {
    currentEpoch: number = 0
    latestTransitionedEpoch: number = 0
    hasSignedUp: boolean = false
    data: bigint[] = []
    provableData: bigint[] = []
    userState?: UserState
    provider: any
    projectID: number | undefined = undefined
    appAddress: string = ''

    constructor() {
        makeAutoObservable(this)
        this.load()
    }

    async load() {
        const id: string | null = localStorage.getItem('id')
        const identity = new Identity(id ?? undefined)
        if (!id) {
            localStorage.setItem('id', identity.toString())
        }

        const { UNIREP_ADDRESS, APP_ADDRESS, ETH_PROVIDER_URL } = await fetch(
            `${SERVER}/api/config`
        ).then((r) => r.json())

        const provider = ETH_PROVIDER_URL.startsWith('http')
            ? new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL)
            : new ethers.providers.WebSocketProvider(ETH_PROVIDER_URL)
        this.provider = provider
        this.appAddress = APP_ADDRESS

        const userState = new UserState(
            {
                provider,
                prover,
                unirepAddress: UNIREP_ADDRESS,
                attesterId: BigInt(APP_ADDRESS),
                _id: identity,
            },
            identity
        )
        await userState.sync.start()
        this.userState = userState
        await userState.waitForSync()
        this.hasSignedUp = await userState.hasSignedUp()
        await this.loadData()
        this.latestTransitionedEpoch =
            await this.userState.latestTransitionedEpoch()
    }

    get fieldCount() {
        return this.userState?.sync.settings.fieldCount
    }

    get sumFieldCount() {
        return this.userState?.sync.settings.sumFieldCount
    }

    epochKey(nonce: number) {
        if (!this.userState) return '0x'
        const epoch = this.userState.sync.calcCurrentEpoch()
        const key = this.userState.getEpochKeys(epoch, nonce)
        return `0x${key.toString(16)}`
    }

    async loadData() {
        if (!this.userState) throw new Error('user state not initialized')

        this.data = await this.userState.getData()
        this.provableData = await this.userState.getProvableData()
    }

    async signup(claimCode: string): Promise<{ projectID: number }> {
        if (!this.userState) throw new Error('user state not initialized')
        if (!claimCode) throw new Error('claim code not provided')
        const signupProof = await this.userState.genUserSignUpProof()
        const res = await fetch(`${SERVER}/api/signup`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    publicSignals: signupProof.publicSignals,
                    proof: signupProof.proof,
                    claimCode: claimCode,
                })
            ),
        })
        const data = await res.json()
        if (res.status >= 400) {
            throw new Error(
                `HTTP ${res.status}: ${JSON.stringify(data, null, 4)}`
            )
        }

        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        this.hasSignedUp = await this.userState.hasSignedUp()
        this.latestTransitionedEpoch = this.userState.sync.calcCurrentEpoch()

        return { projectID: data.projectID }
    }

    async joinProject(projectID: number) {
        if (!this.userState) throw new Error('user state not initialized')

        const epochKeyProof = await this.userState.genEpochKeyProof({
            nonce: 0,
            revealNonce: true,
        })
        const data = await fetch(`${SERVER}/api/project/join`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    projectID,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        await this.loadData()
        this.projectID = projectID
    }

    async vote(projectID: number, emoji: number) {
        if (!this.userState) throw new Error('user state not initialized')
        if (projectID === this.projectID)
            throw new Error('you cannot vote your project')

        // const epochKeyProof = await this.userState.genEpochKeyProof({
        //     nonce: 1,
        //     revealNonce: true,
        // })
        const voteathon = new ethers.Contract(
            this.appAddress,
            Voteathon,
            this.provider
        )

        const count = (await voteathon.counts(projectID)).toNumber()
        const epoch_keys = new Array()
        for (let j = 0; j < count; j++) {
            const epoch_key = await voteathon.participants(projectID, j)
            epoch_keys.push(epoch_key)
        }
        const padded_epoch_keys = padZeros(epoch_keys, 10)

        const nonce = 1
        const attesterId = voteathon.address
        const epoch = 0
        const tree = await this.userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await this.userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const data = await this.userState.getData(epoch - 1, attesterId)
        const proof = tree.createProof(leafIndex)

        const circuitInputs = stringifyBigInts({
            identity_secret: this.userState.id.secret,
            data,
            sig_data: 0,
            state_tree_elements: proof.siblings,
            state_tree_indexes: proof.pathIndices,
            epoch,
            nonce,
            attester_id: attesterId,
            reveal_nonce: 1,
            project_epoch_keys: padded_epoch_keys,
        })
        const p = await prover.genProofAndPublicSignals(
            'projectProof',
            circuitInputs
        )
        const projectProof = new ProjectProof(p.publicSignals, p.proof, prover)

        const data1 = await fetch(`${SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    projectID,
                    emoji,
                    publicSignals: projectProof.publicSignals,
                    proof: projectProof.proof,
                })
            ),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data1.hash)
        await this.userState.waitForSync()
        await this.loadData()
    }

    async claimPrize(address: string) {
        if (!this.userState) throw new Error('user state not initialized')

        const userData = await this.userState.getProvableData()
        const epoch = await this.userState.sync.loadCurrentEpoch()
        const stateTree = await this.userState.sync.genStateTree(epoch)
        const index = await this.userState.latestStateTreeLeafIndex(epoch)
        const stateTreeProof = stateTree.createProof(index)
        const circuitInputs = stringifyBigInts({
            identity_secret: this.userState.id.secret,
            state_tree_indexes: stateTreeProof.pathIndices,
            state_tree_elements: stateTreeProof.siblings,
            data: userData,
            epoch: epoch,
            attester_id: this.userState.sync.attesterId,
            value: userData.slice(0, this.sumFieldCount),
        })
        const p = await prover.genProofAndPublicSignals(
            'dataProof',
            circuitInputs
        )
        const { publicSignals, proof } = new DataProof(
            p.publicSignals,
            p.proof,
            prover
        )
        const data = await fetch(`${SERVER}/api/prize/claim`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    address,
                    publicSignals,
                    proof,
                })
            ),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        await this.loadData()
    }

    async stateTransition() {
        if (!this.userState) throw new Error('user state not initialized')

        await this.userState.waitForSync()
        const ustProof = await this.userState.genUserStateTransitionProof()
        const data = await fetch(`${SERVER}/api/transition`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: ustProof.publicSignals,
                proof: ustProof.proof,
            }),
        }).then((r) => r.json())
        await this.provider.waitForTransaction(data.hash)
        await this.userState.waitForSync()
        await this.loadData()
        this.latestTransitionedEpoch =
            await this.userState.latestTransitionedEpoch()
    }

    async proveData(data: { [key: number]: string | number }) {
        if (!this.userState) throw new Error('user state not initialized')
        const epoch = await this.userState.sync.loadCurrentEpoch()
        const stateTree = await this.userState.sync.genStateTree(epoch)
        const index = await this.userState.latestStateTreeLeafIndex(epoch)
        const stateTreeProof = stateTree.createProof(index)
        const provableData = await this.userState.getProvableData()
        const sumFieldCount = this.userState.sync.settings.sumFieldCount
        const values = Array(sumFieldCount).fill(0)
        for (let [key, value] of Object.entries(data)) {
            values[Number(key)] = value
        }
        const attesterId = this.userState.sync.attesterId
        const circuitInputs = stringifyBigInts({
            identity_secret: this.userState.id.secret,
            state_tree_indexes: stateTreeProof.pathIndices,
            state_tree_elements: stateTreeProof.siblings,
            data: provableData,
            epoch: epoch,
            attester_id: attesterId,
            value: values,
        })
        const { publicSignals, proof } = await prover.genProofAndPublicSignals(
            'dataProof',
            circuitInputs
        )
        const dataProof = new DataProof(publicSignals, proof, prover)
        const valid = await dataProof.verify()
        return stringifyBigInts({
            publicSignals: dataProof.publicSignals,
            proof: dataProof.proof,
            valid,
        })
    }
}

export default createContext(new User())

function padZeros(value: BigNumberish[], length: number): BigNumberish[] {
    while (value.length < length) {
        value.push(0)
    }
    return value
}
