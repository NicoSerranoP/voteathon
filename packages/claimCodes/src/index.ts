import bip39ish from "./bip39ish";

export type ClaimCodeT = {
    code: string;
    used: boolean;
}

export enum ClaimCodeStatusEnum {
    CLAIMED = "CLAIMED",
    NOT_FOUND = "NOT_FOUND",
    ALREADY_USED = "ALREADY_USED",
}

export interface ClaimCodeStatus {
    status: ClaimCodeStatusEnum
    message: string
    claimCodes: ClaimCodeT[]
}

function generateRandomClaimCode() {
    return bip39ish[Math.floor(Math.random() * bip39ish.length)] + "-" + bip39ish[Math.floor(Math.random() * bip39ish.length)];
}

// Function to generate claim codes and save them to a JSON file
export function generateClaimCodes(count: number, claimCodes: ClaimCodeT[] = []): ClaimCodeT[] {
    let codes: string[] = []
    for (let i = 0; i < count; i++) {
        let pass = false;
        while (pass == false) {
            let code: string = generateRandomClaimCode();
            if (codes.includes(code)) {
                continue;
            }
            pass = true;
        }
        claimCodes.push({
            code: generateRandomClaimCode(),
            used: false
        });
    }
    return claimCodes;
}

export function markClaimCodeAsUsed(code: string, claimCodes: ClaimCodeT[]): ClaimCodeStatus {
    let message = "Successfully claimed code";
    let status = ClaimCodeStatusEnum.NOT_FOUND;
    for (let claimCode of claimCodes) {
        if (claimCode.code === code) {
            if (claimCode.used) {
                message = `Claim code ${code} has already been used`
                status = ClaimCodeStatusEnum.ALREADY_USED
                return { status, message, claimCodes }
            }
            claimCode.used = true;
            status = ClaimCodeStatusEnum.CLAIMED
            return {status, message, claimCodes};
        }
    }
    message = `Claim code ${code} does not exist`
    status = ClaimCodeStatusEnum.NOT_FOUND
    return { status, message, claimCodes }
}