import { CircuitConfig } from '@unirep/circuits'
const {
    STATE_TREE_DEPTH,
    FIELD_COUNT,
    SUM_FIELD_COUNT,
    NUM_EPOCH_KEY_NONCE_PER_EPOCH,
} = CircuitConfig.default

export const ptauName = 'powersOfTau28_hez_final_18.ptau'
export const MAX_COUNT = 10

export const circuitContents = {
    dataProof: `pragma circom 2.0.0; include "../circuits/dataProof.circom"; \n\ncomponent main { public [ value ] } = DataProof(${STATE_TREE_DEPTH}, ${FIELD_COUNT}, ${SUM_FIELD_COUNT});`,
    projectProof: `pragma circom 2.0.0; include "../circuits/ProjectProof.circom"; \n\ncomponent main { public [ project_epoch_keys ] } = ProjectProof(${STATE_TREE_DEPTH}, ${NUM_EPOCH_KEY_NONCE_PER_EPOCH}, ${FIELD_COUNT}, ${MAX_COUNT});`,
}
