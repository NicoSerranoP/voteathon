//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployUnirep } from '@unirep/contracts/deploy'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { Identity } from '@semaphore-protocol/identity'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'

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
        const VoteathonF = await ethers.getContractFactory('Voteathon')
        voteathon = await VoteathonF.deploy(
            unirep.address,
            verifier.address,
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
        const userState = await genUserState(voter, voteathon)

        // generate
        const { publicSignals, proof } = await userState.genEpochKeyProof({
            nonce: 1,
            revealNonce: true,
        })
        await voteathon
            .vote(projectID, emoji, publicSignals, proof)
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
