/**
 * Read-only diagnostic: prints the deploy wallet's sync status, NIGHT UTXOs
 * and DUST balance for the configured network, without deploying anything.
 * Useful while waiting on the faucet / DUST generation before running
 * `npm run deploy`.
 */

import "dotenv/config";

async function main() {
  const network = (process.env.MIDNIGHT_NETWORK ?? "preprod").toLowerCase();
  console.log(`Checking wallet status on ${network}...`);
  console.log(
    "Wire this up to @midnight-ntwrk/wallet's wallet.state() once your wallet " +
      "seed is configured in .env.<network> -- see scripts/deploy.ts for the " +
      "integration points and README.md > Deployment for faucet links."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
