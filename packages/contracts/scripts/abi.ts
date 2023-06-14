import * as fs from 'fs'
import * as path from 'path'
import VOTEATHON_ABI from '../artifacts/contracts/Voteathon.sol/Voteathon.json'

fs.writeFileSync(
    path.join(__dirname, '../abi/Voteathon.json'),
    JSON.stringify(VOTEATHON_ABI.abi)
)
