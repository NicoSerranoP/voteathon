export type ClaimCodeT = {
  code: string;
  used: boolean;
}

export type claimCodeSetsT = {[key: number]: ClaimCodeT[]}