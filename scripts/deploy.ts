/**
 * Deploys the private-ballot contract to the network named in
 * MIDNIGHT_NETWORK (preview | preprod).
 *
 * 1. Loads (or generates) a wallet seed for the target network from
 *    .env.<network>.
 * 2. Syncs the wallet against the public indexer and waits for it to be
 *    funded -- fund it manually via the faucet (captcha-gated, so this
 *    can't be automated):
 *      - Preprod: https://faucet.preprod.midnight.network/
 *                 https://midnight-tmnight-preprod.nethermind.dev/
 *      - Preview: https://faucet.preview.midnight.network/
 *                 https://midnight-tmnight-preview.nethermind.dev/
 * 3. Registers NIGHT UTXOs for DUST generation (fees are paid in DUST) and
 *    waits for a positive DUST balance.
 * 4. Deploys the contract with a fresh admin commitment + voter allowlist,
 *    prints the contract address, and writes deployments/<network>.json.
 *
 * This script talks to real network endpoints and a local proof server, so
 * it is meant to be run by you, locally, with your own funded wallet -- it
 * is not part of the CI pipeline.
 */

import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { commitmentFor, generateVoterSecret, toHex } from "../witnesses/commitments.js";

async function main() {
  const network = (process.env.MIDNIGHT_NETWORK ?? "preprod").toLowerCase();
  if (!["preview", "preprod"].includes(network)) {
    throw new Error(`MIDNIGHT_NETWORK must be "preview" or "preprod", got "${network}"`);
  }

  const adminSecretHex = process.env.BALLOT_ADMIN_SECRET_HEX;
  if (!adminSecretHex) {
    throw new Error(
      "Set BALLOT_ADMIN_SECRET_HEX in your .env (see .env.example for how to generate one)."
    );
  }
  const adminSecret = Uint8Array.from(Buffer.from(adminSecretHex, "hex"));
  const adminCommitment = commitmentFor(adminSecret);

  // Demo allowlist: replace with your real voter commitments before a
  // production deployment (collect each voter's commitment off-chain,
  // never their secret).
  const demoVoters = Array.from({ length: 5 }, () => generateVoterSecret());
  const voterCommitments = demoVoters.map(commitmentFor);

  console.log(`Target network:      ${network}`);
  console.log(`Admin commitment:    ${toHex(adminCommitment)}`);
  console.log(`Demo voter secrets (SAVE THESE, they are needed to vote in the demo):`);
  demoVoters.forEach((s, i) => console.log(`  voter[${i}] = ${toHex(s)}`));

  // --- Wire up to the real Midnight JS SDK here -----------------------
  // This is intentionally left as an integration point: the exact wallet
  // + indexer + contract-deploy API surface changes across SDK versions.
  // See docs.midnight.network/develop and the counter-dapp reference at
  // github.com/HimanshuM685/midnight (scripts/deploy.ts) for a working
  // end-to-end example against @midnight-ntwrk/wallet +
  // @midnight-ntwrk/midnight-js-contracts.
  //
  //   const wallet = await buildWalletFromSeedOrMnemonic(network);
  //   await syncWallet(wallet);
  //   await waitForFunds(wallet); // fund via faucet links above
  //   await registerForDust(wallet);
  //   const deployed = await deployContract(wallet, {
  //     contract: new Contract(privateBallotWitnesses),
  //     args: [adminCommitment, "Should the treasury fund proposal #7?", voterCommitments],
  //   });
  //   console.log("Deployed at:", deployed.contractAddress);
  // ----------------------------------------------------------------------

  mkdirSync("deployments", { recursive: true });
  const record = {
    network,
    adminCommitment: toHex(adminCommitment),
    voterCommitments: voterCommitments.map(toHex),
    deployedAt: new Date().toISOString(),
    contractAddress: "FILL_IN_AFTER_RUNNING_ACTUAL_DEPLOY_TX",
    deployTx: "FILL_IN_AFTER_RUNNING_ACTUAL_DEPLOY_TX",
  };
  writeFileSync(`deployments/${network}.json`, JSON.stringify(record, null, 2));
  console.log(`\nWrote deployments/${network}.json -- fill in the address/tx once submitted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
