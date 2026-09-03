/**
 * Off-chain helpers for generating voter secrets and their public
 * commitments. Used by the admin tooling (to build the initial allowlist
 * passed to the constructor) and by tests/frontend (to simulate a voter's
 * wallet). None of this runs inside a circuit; it mirrors, in plain JS, the
 * `persistentHash<Bytes<32>>(secret)` computation done on-chain so the two
 * stay in sync.
 */

import { randomBytes, createHash } from "node:crypto";

/** Generates a fresh 32-byte voter secret. Never send this anywhere. */
export function generateVoterSecret(): Uint8Array {
  return new Uint8Array(randomBytes(32));
}

/**
 * Deterministic 32-byte commitment for a secret, matching the contract's
 * `persistentHash<Bytes<32>>(secret)` call. Safe to publish -- this is what
 * goes into the on-chain `eligibleVoters` set.
 */
export function commitmentFor(secret: Uint8Array): Uint8Array {
  return new Uint8Array(createHash("sha256").update(secret).digest());
}

/** Convenience: build the full { secret, commitment } pair for one voter. */
export function newVoter(): { secret: Uint8Array; commitment: Uint8Array } {
  const secret = generateVoterSecret();
  return { secret, commitment: commitmentFor(secret) };
}

export function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}
