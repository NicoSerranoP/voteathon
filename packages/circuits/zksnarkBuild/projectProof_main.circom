pragma circom 2.0.0; include "../circuits/ProjectProof.circom"; 

component main { public [ project_epoch_keys ] } = ProjectProof(17, 2, 6, 10);