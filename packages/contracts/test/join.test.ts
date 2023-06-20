//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployUnirep } from '@unirep/contracts/deploy'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { Identity } from '@semaphore-protocol/identity'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'
import { BigNumberish } from 'ethers'
import { ProjectProof } from '@unirep-app/circuits'
import { stringifyBigInts } from '@unirep/utils'

function padZeros(value: BigNumberish[], length: number): BigNumberish[] {
    while (value.length < length) {
        value.push(0)
    }
    return value
}

async function genUserState(id, app) {
    // generate a user state
    const db = await SQLiteConnector.create(schema, ':memory:')
    const unirepAddress = await app.unirep()
    const attesterId = BigInt(app.address)
    const userState = new UserState(
        {
            db,
            prover,
            unirepAddress,
            provider: ethers.provider,
            attesterId,
        },
        id
    )
    await userState.sync.start()
    await userState.waitForSync()
    return userState
}

describe('Join project', function () {
    this.timeout(0)
    let unirep
    let voteathon
    let nft
    const numTeams = 6
    const numHackers = 2
    const projectID = 3
    const emoji = 2

    // epoch length
    const epochLength = 300
    // generate random user id
    const voter = new Identity()
    const hacker = Array(numHackers)
        .fill(0)
        .map((n) => {
            return new Identity()
        })

    it('deployment', async function () {
        const [deployer] = await ethers.getSigners()
        const nftF = await ethers.getContractFactory('VoteathonNFT')
        nft = await nftF.deploy(
            'ipfs://QmNtYnjqeqWbRGC4R7fd9DCXWnQF87ufv7S2zGULtbSpLA'
        )
        await nft.deployed()
        unirep = await deployUnirep(deployer)
        const verifierF = await ethers.getContractFactory('DataProofVerifier')
        const verifier = await verifierF.deploy()
        await verifier.deployed()

        const verifierF1 = await ethers.getContractFactory(
            'ProjectProofVerifier'
        )
        const verifier1 = await verifierF1.deploy()
        await verifier1.deployed()
        const VoteathonF = await ethers.getContractFactory('Voteathon')
        voteathon = await VoteathonF.deploy(
            unirep.address,
            verifier.address,
            verifier1.address,
            nft.address,
            epochLength,
            numTeams
        )
        await voteathon.deployed()
        await nft.setVoteathonAddress(voteathon.address).then((t) => t.wait())
    })

    it('voter sign up', async () => {
        const userState = await genUserState(voter, voteathon)

        // generate
        const { publicSignals, proof } = await userState.genUserSignUpProof()
        await voteathon.userSignUp(publicSignals, proof).then((t) => t.wait())
        userState.sync.stop()
    })

    it('hacker sign up', async () => {
        for (let i = 0; i < numHackers; i++) {
            const userState = await genUserState(hacker[i], voteathon)

            // generate
            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            await voteathon
                .userSignUp(publicSignals, proof)
                .then((t) => t.wait())
            userState.sync.stop()
        }
    })

    it('join project', async () => {
        for (let i = 0; i < numHackers - 1; i++) {
            const userState = await genUserState(hacker[i], voteathon)

            // generate
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                nonce: 0,
                revealNonce: true,
            })
            await voteathon
                .joinProject(projectID, publicSignals, proof)
                .then((t) => t.wait())
            userState.sync.stop()
        }
    })

    it('vote project', async () => {
        const attesterId = voteathon.address
        const userState = await genUserState(voter, voteathon)
        const epoch = 0
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const proof = tree.createProof(leafIndex)
        const epoch_keys = new Array()
        const count = await voteathon.counts(projectID)
        for (let j = 0; j < count; j++) {
            const epoch_key = await voteathon.participants(projectID, j)
            epoch_keys.push(epoch_key)
        }
        const padded_epoch_keys = padZeros(epoch_keys, 10)

        // generate
        // const { publicSignals, proof } = await userState.genEpochKeyProof({
        //     nonce: 1,
        //     revealNonce: true,
        // })

        const circuitInputs = stringifyBigInts({
            identity_secret: userState.id.secret,
            data: userState.getData(),
            sig_data: 0,
            state_tree_elements: proof.siblings,
            state_tree_indexes: proof.pathIndices,
            epoch,
            nonce: 1,
            attester_id: attesterId,
            reveal_nonce: 1,
            project_epoch_keys: padded_epoch_keys,
        })
        const p = await prover.genProofAndPublicSignals(
            'projectProof',
            circuitInputs
        )
        const projectProof = new ProjectProof(p.publicSignals, p.proof, prover)

        await voteathon
            .vote(
                projectID,
                emoji,
                projectProof.publicSignals,
                projectProof.proof
            )
            .then((t) => t.wait())
        userState.sync.stop()
    })

    it('hacker join project after vote', async () => {
        for (let i = numHackers - 1; i < numHackers; i++) {
            const userState = await genUserState(hacker[i], voteathon)

            // generate
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                nonce: 0,
                revealNonce: true,
            })
            await voteathon
                .joinProject(projectID, publicSignals, proof)
                .then((t) => t.wait())
            await userState.waitForSync()
            const data = await userState.getData()
            expect(data[emoji].toString()).to.equal('1')
        }
    })

    it('user state transition', async () => {
        await ethers.provider.send('evm_increaseTime', [epochLength])
        await ethers.provider.send('evm_mine', [])

        for (let i = 0; i < numHackers; i++) {
            const newEpoch = await unirep.attesterCurrentEpoch(
                voteathon.address
            )
            const userState = await genUserState(hacker[i], voteathon)
            const { publicSignals, proof } =
                await userState.genUserStateTransitionProof({
                    toEpoch: newEpoch,
                })
            await unirep
                .userStateTransition(publicSignals, proof)
                .then((t) => t.wait())
            userState.sync.stop()
        }
    })

    it('check data after ust', async () => {
        for (let i = 0; i < numHackers; i++) {
            const userState = await genUserState(hacker[i], voteathon)
            const data = await userState.getProvableData()
            expect(data[emoji].toString()).to.equal('1')
        }
    })
})
