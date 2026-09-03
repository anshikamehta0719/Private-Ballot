/**
 * Witness implementations for the private-ballot contract.
 *
 * A witness is arbitrary TypeScript that runs locally, on the caller's own
 * machine, to supply private inputs to a circuit. Whatever it returns is
 * consumed *inside* the zero-knowledge proof -- it is never transmitted to
 * the network, and never appears in the resulting transaction or ledger
 * state.
 *
 * This file is intentionally the only place in the whole project that ever
 * touches a raw voter secret. Everywhere else (contract, frontend state,
 * tests-assertions-on-ledger) only ever sees hashes/commitments/nullifiers.
 */

import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";

/**
 * Local, private ledger for a single voter's wallet: just the 32-byte
 * secret used to prove allowlist membership and derive a nullifier.
 *
 * In production this would be persisted in the wallet's secure storage
 * (e.g. derived from the user's Lace/1AM wallet key via a fixed
 * derivation path), not held in memory. It is kept simple here so the
 * privacy boundary in the contract is easy to audit.
 */
export type PrivateBallotPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createPrivateBallotSecretState = (
  secretKey: Uint8Array
): PrivateBallotPrivateState => ({ secretKey });

/**
 * The witness map passed into the compiled contract's TypeScript API.
 * Each key here corresponds 1:1 to a `witness` declaration in
 * private-ballot.compact.
 */
export const privateBallotWitnesses = {
  localSecretKey: (
    context: WitnessContext<PrivateBallotPrivateState, PrivateBallotPrivateState>
  ): [PrivateBallotPrivateState, Uint8Array] => {
    // Witnesses return a tuple of [nextPrivateState, value]. We don't
    // mutate any local state here, so we just echo it back unchanged.
    return [context.privateState, context.privateState.secretKey];
  },
};
