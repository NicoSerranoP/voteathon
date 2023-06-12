import bip39ish from "./bip39ish";

export type ClaimCode = {
    code: String;
    used: Boolean;
}

function generateRandomClaimCode() {
    return bip39ish[Math.floor(Math.random() * bip39ish.length)] + "-" + bip39ish[Math.floor(Math.random() * bip39ish.length)];
}

// Function to generate claim codes and save them to a JSON file
export function generateClaimCodes(count: number, claimCodes: ClaimCode[] = []) {
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

export function markClaimCodeAsUsed(code: string, claimCodes: ClaimCode[]) {
    for (let claimCode of claimCodes) {
        if (claimCode.code === code) {
            if (claimCode.used) {
                console.warn(`Claim code ${code} has already been used`)
                return false
            }
            claimCode.used = true;
            return true;
        }
    }
    console.warn(`Claim code ${code} does not exist`);
    return false;
}