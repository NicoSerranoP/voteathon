import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'
import { deployUnirep } from '@unirep/contracts/deploy/index.js'
import * as hardhat from 'hardhat'
import teams from '../../../projects-partipants.json'

const epochLength = 300

deployApp().catch((err) => {
    console.log(`Uncaught error: ${err}`)
    process.exit(1)
})

export async function deployApp() {
    const [signer] = await ethers.getSigners()
    const unirep = await deployUnirep(signer)

    const verifierF = await ethers.getContractFactory('DataProofVerifier')
    const verifier = await verifierF.deploy()
    await verifier.deployed()

    const verifierF1 = await ethers.getContractFactory('ProjectProofVerifier')
    const verifier1 = await verifierF1.deploy()
    await verifier1.deployed()

    const nftF = await ethers.getContractFactory('VoteathonNFT')
    const nft = await nftF.deploy(
        'ipfs://QmNtYnjqeqWbRGC4R7fd9DCXWnQF87ufv7S2zGULtbSpLA'
    )
    const App = await ethers.getContractFactory('Voteathon')
    const app = await App.deploy(
        unirep.address,
        verifier.address,
        verifier1.address,
        nft.address,
        epochLength,
        teams.projects.length
    )

    await app.deployed()
    await nft.setVoteathonAddress(app.address).then((t) => t.wait())

    console.log(
        `Voteathon app with epoch length ${epochLength} is deployed to ${app.address}`
    )

    const config = `export default {
    UNIREP_ADDRESS: '${unirep.address}',
    APP_ADDRESS: '${app.address}',
    ETH_PROVIDER_URL: '${hardhat.network.config.url ?? ''}',
    ${
        Array.isArray(hardhat.network.config.accounts)
            ? `PRIVATE_KEY: '${hardhat.network.config.accounts[0]}',`
            : `/**
      This contract was deployed using a mnemonic. The PRIVATE_KEY variable needs to be set manually
    **/`
    }
  }
  `

    const configPath = path.join(__dirname, '../../../config.ts')
    await fs.promises.writeFile(configPath, config)

    console.log(`Config written to ${configPath}`)
}
