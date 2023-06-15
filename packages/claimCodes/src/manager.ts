import bip39ish, { bip39 } from './bip39ish'
import { ClaimCodeT, ClaimCodeSetsT } from './types'

export enum ClaimCodeStatusEnum {
    CLAIMED = 'CLAIMED',
    NOT_FOUND = 'NOT_FOUND',
    ALREADY_USED = 'ALREADY_USED',
}

export interface ClaimCodeStatus {
    status: ClaimCodeStatusEnum
    message: string
    claimCodes: ClaimCodeT[]
    projectID?: number
}

const emptyClaimCodeSet: ClaimCodeSetsT = {
    '0': {
        claimCodes: [],
        projectID: 0,
        generationTime: Date.now(),
        name: 'UNASSIGNED',
    },
}

export default class ClaimCodeManager {
    claimCodeSets: ClaimCodeSetsT

    constructor(claimCodeSetInput: ClaimCodeSetsT = emptyClaimCodeSet) {
        this.claimCodeSets = claimCodeSetInput
    }

    private static generateRandomClaimCode(length: number = 2) {
        if (length < 1) throw new Error('length must be greater than 0')
        if (length > 24) throw new Error('length must be less than 24')

        let code: string[] = []
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * bip39ish.length)

            code.push(bip39ish[randomIndex])
        }
        return code.join('-')
    }

    private static generateClaimCodes(
        count: number,
        claimCodes: ClaimCodeT[] = []
    ): ClaimCodeT[] {
        let codes: string[] = []
        for (let i = 0; i < count; i++) {
            let pass = false
            while (pass == false) {
                let code: string = this.generateRandomClaimCode()
                if (codes.includes(code)) {
                    continue
                }
                pass = true
            }
            claimCodes.push({
                code: this.generateRandomClaimCode(),
                used: false,
            })
        }
        return claimCodes
    }

    private static markClaimCodeAsUsed(
        code: string,
        claimCodes: ClaimCodeT[]
    ): ClaimCodeStatus {
        let message = 'Successfully claimed code'
        let status = ClaimCodeStatusEnum.NOT_FOUND
        for (let claimCode of claimCodes) {
            if (claimCode.code === code) {
                if (claimCode.used) {
                    message = `Claim code ${code} has already been used`
                    status = ClaimCodeStatusEnum.ALREADY_USED
                    return { status, message, claimCodes }
                }
                claimCode.used = true
                status = ClaimCodeStatusEnum.CLAIMED
                return { status, message, claimCodes }
            }
        }
        message = `Claim code ${code} does not exist`
        status = ClaimCodeStatusEnum.NOT_FOUND
        return { status, message, claimCodes }
    }

    public generateClaimCodeSet(
        count: number,
        projectID: number | string = 0,
        name: string = ''
    ) {
        projectID = projectID.toString()
        if (this.claimCodeSets[projectID]) {
            this.claimCodeSets[projectID].claimCodes =
                ClaimCodeManager.generateClaimCodes(
                    count,
                    this.claimCodeSets[projectID].claimCodes
                )
        } else {
            this.claimCodeSets[projectID] = {
                claimCodes: ClaimCodeManager.generateClaimCodes(count),
                projectID: Number(projectID),
                generationTime: Date.now(),
                name: name,
            }
        }
        this.claimCodeSets[projectID].projectID = Number(projectID)
        this.claimCodeSets[projectID].generationTime = Date.now()
        if (name) {
            this.claimCodeSets[projectID].name = name
        }
        return this.claimCodeSets[projectID]
    }

    public claimCode(code: string): ClaimCodeStatus {
        for (let claimCodeSet in this.claimCodeSets) {
            let result = ClaimCodeManager.markClaimCodeAsUsed(
                code,
                this.claimCodeSets[claimCodeSet].claimCodes
            )
            if (result.status === ClaimCodeStatusEnum.CLAIMED) {
                result.projectID = Number(claimCodeSet)
                return result
            } else if (result.status === ClaimCodeStatusEnum.ALREADY_USED) {
                result.projectID = Number(claimCodeSet)
                return result
            } else {
                continue
            }
        }
        return {
            status: ClaimCodeStatusEnum.NOT_FOUND,
            message: `Claim code ${code} does not exist`,
            claimCodes: [],
        }
    }

    public getClaimCodeSets(): ClaimCodeSetsT {
        return this.claimCodeSets
    }

    public getClaimCodeSet(projectID: number | string): ClaimCodeSetsT {
        projectID = projectID.toString()
        const o = { projectID: this.claimCodeSets[projectID] }
        return o
    }
}
