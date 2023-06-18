pragma circom 2.0.0;

include "../../../node_modules/@unirep/circuits/circuits/proveReputation.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/poseidon.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/mux1.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/gates.circom";
include "../../../node_modules/@unirep/circuits/circuits/circomlib/circuits/comparators.circom";
include "../../../node_modules/@unirep/circuits/circuits/identity.circom";

template ProjectProof(STATE_TREE_DEPTH, EPOCH_KEY_NONCE_PER_EPOCH, FIELD_COUNT, MAX_COUNT) {
    signal input state_tree_indexes[STATE_TREE_DEPTH];
    signal input state_tree_elements[STATE_TREE_DEPTH];
    signal input data[FIELD_COUNT];
    signal input identity_secret;
    signal input reveal_nonce;
    signal input attester_id;
    signal input epoch;
    signal input nonce;
    signal input sig_data;

    signal input project_epoch_keys[MAX_COUNT];

    signal output epoch_key;
    signal output state_tree_root;
    signal output control;

    component epoch_key_proof = EpochKey(STATE_TREE_DEPTH, EPOCH_KEY_NONCE_PER_EPOCH, FIELD_COUNT);
    for (var i = 0; i < STATE_TREE_DEPTH; i++) {
        epoch_key_proof.state_tree_indexes[i] <== state_tree_indexes[i];
        epoch_key_proof.state_tree_elements[i] <== state_tree_elements[i];
    }
    for (var x = 0; x < FIELD_COUNT; x++) {
        epoch_key_proof.data[x] <== data[x];
    }

    epoch_key_proof.identity_secret <== identity_secret;
    epoch_key_proof.reveal_nonce <== reveal_nonce;
    epoch_key_proof.attester_id <== attester_id;
    epoch_key_proof.epoch <== epoch;
    epoch_key_proof.nonce <== nonce;
    epoch_key_proof.sig_data <== sig_data;

    control <== epoch_key_proof.control;
    epoch_key <== epoch_key_proof.epoch_key;
    state_tree_root <== epoch_key_proof.state_tree_root;

    // Check the user epoch key is NOT included in the epoch keys of the project. 
    var included = 0;
    for (var i = 0; i < MAX_COUNT; i++) {
        if(project_epoch_keys[i] == epoch_key){ included = 1; }
    }
    assert(included == 0);
}