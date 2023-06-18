import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { ethers } from 'ethers'
import _config from '../../../../config'
import VOTEATHON_ABI from '../../../contracts/artifacts/contracts/Voteathon.sol/Voteathon.json'

const APP_ADDRESS = _config.APP_ADDRESS || ''
const APP_ABI = VOTEATHON_ABI.abi || ''

class Voteathon {
    contract: ethers.Contract

    constructor() {
        makeAutoObservable(this)

        const contract = new ethers.Contract(APP_ADDRESS, APP_ABI)
        this.contract = contract
    }
}

export default createContext(new Voteathon())
