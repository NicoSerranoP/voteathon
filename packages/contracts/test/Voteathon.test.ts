//@ts-ignore
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { deployUnirep } from '@unirep/contracts/deploy'
import { stringifyBigInts } from '@unirep/utils'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { DataProof } from '@unirep-app/circuits'
import defaultConfig from '@unirep/circuits/config'
import { Identity } from '@semaphore-protocol/identity'
const { SUM_FIELD_COUNT } = defaultConfig
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

describe('Voteathon', function () {
    this.timeout(0)
    let unirep
    let voteathon
    let nft
    const numTeams = 6
    const numVoters = 6
    const numHackers = 7

    // epoch length
    const epochLength = 300
    // generate random user id
    const voter = Array(numVoters)
        .fill(0)
        .map((n) => {
            return new Identity()
        })
    const hacker = Array(numHackers)
        .fill(0)
        .map((n) => {
            return new Identity()
        })

    it('deployment', async function () {
        const [deployer] = await ethers.getSigners()
        const nftF = await ethers.getContractFactory('VoteathonNFT')
        nft = await nftF.deploy()
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
    })

    it('voter sign up', async () => {
        for (let i = 0; i < numVoters; i++) {
            const userState = await genUserState(voter[i], voteathon)

            // generate
            const { publicSignals, proof } =
                await userState.genUserSignUpProof()
            await voteathon
                .userSignUp(publicSignals, proof)
                .then((t) => t.wait())
            userState.sync.stop()
        }
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
        for (let i = 0; i < numHackers; i++) {
            const userState = await genUserState(hacker[i], voteathon)
            const projectID = i % numTeams

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
        for (let i = 0; i < numVoters; i++) {
            const userState = await genUserState(voter[i], voteathon)
            const emoji = i % 4
            const projectID = i % numTeams

            // generate
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                nonce: 1,
                revealNonce: true,
            })
            await voteathon
                .vote(projectID, emoji, publicSignals, proof)
                .then((t) => t.wait())
            userState.sync.stop()
        }

        for (let i = 0; i < numHackers; i++) {
            const userState = await genUserState(hacker[i], voteathon)
            const emoji = (i + 2) % 4
            const projectID = (i + 2) % numTeams

            // generate
            const { publicSignals, proof } = await userState.genEpochKeyProof({
                nonce: 1,
                revealNonce: true,
            })
            await voteathon
                .vote(projectID, emoji, publicSignals, proof)
                .then((t) => t.wait())
            userState.sync.stop()
        }
        for (let i = 0; i < numTeams; i++) {
            console.log(await voteathon.scores(i))
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

    it('claim NFT', async () => {
        const scores: any = []
        for (let i = 0; i < numTeams; i++) {
            scores.push((await voteathon.scores(i)).toNumber())
        }
        scores.sort()
        const winnerScore = scores[numTeams - 3]
        for (let i = 0; i < numHackers; i++) {
            const userState = await genUserState(hacker[i], voteathon)
            const epoch = await userState.sync.loadCurrentEpoch()
            const stateTree = await userState.sync.genStateTree(epoch)
            const index = await userState.latestStateTreeLeafIndex(epoch)
            const stateTreeProof = stateTree.createProof(index)
            const attesterId = voteathon.address
            const data = await userState.getProvableData()
            
            const circuitInputs = stringifyBigInts({
                identity_secret: hacker[i].secret,
                state_tree_indexes: stateTreeProof.pathIndices,
                state_tree_elements: stateTreeProof.siblings,
                data: data,
                epoch: epoch,
                attester_id: attesterId,
                value: data.slice(0, SUM_FIELD_COUNT),
            })
            const p = await prover.genProofAndPublicSignals(
                'dataProof',
                circuitInputs
            )
            const dataProof = new DataProof(p.publicSignals, p.proof, prover)
            const accounts = await ethers.getSigners()
            expect(
                (await nft.balanceOf(accounts[i + 1].address)).toString()
            ).equal('0')
            const score = Number(data[0]) - Number(data[1]) + Number(data[2]) * 2 - Number(data[3]) * 2

            await voteathon
                .claimPrize(
                    accounts[i + 1].address,
                    dataProof.publicSignals,
                    dataProof.proof
                )
                .then((t) => t.wait())

            if (score >= winnerScore) {
                expect(
                    (await nft.balanceOf(accounts[i + 1].address)).toString()
                ).equal('1')
            } else {
                expect(
                    (await nft.balanceOf(accounts[i + 1].address)).toString()
                ).equal('0')
            }
            
            userState.sync.stop()
        }
    })
})
