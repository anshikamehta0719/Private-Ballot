# Private Ballot

![CI](https://github.com/YOUR_GITHUB_USERNAME/midnight-private-ballot/actions/workflows/ci.yml/badge.svg)

Anonymous ballots with publicly verifiable tallies, built on
[Midnight](https://midnight.network) with [Compact](https://docs.midnight.network/compact).

> 🌓 Level 3 submission — New Moon to Full builder program.
> Idea from the provided list: **Private Voting**.

Anyone can independently recompute the live yes/no tally from public ledger
state. No one — including the contract, an indexer, or a block explorer —
can tell which registered voter cast which vote.

## Table of contents

- [How it works](#how-it-works)
- [Privacy model](#privacy-model)
- [Project structure](#project-structure)
- [Setup](#setup)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment (Preview / Preprod)](#deployment-preview--preprod)
- [Frontend](#frontend)
- [Live demo](#live-demo)
- [Demo video](#demo-video)

## How it works

1. An admin deploys the contract with a proposal, an admin commitment, and
   an **allowlist of voter commitments** (`hash(secret)` for each eligible
   voter — never the secrets themselves, never a wallet address).
2. Each voter's wallet holds their own secret locally (see
   `witnesses/private-ballot-witnesses.ts`).
3. To vote, the voter's wallet builds a zero-knowledge proof, inside the
   `castVote` circuit, that it knows the secret behind *some* commitment in
   the allowlist — without revealing which one.
4. The same secret also derives a **nullifier**, a differently-salted hash
   recorded on-chain to stop the same voter from voting twice, without
   being linkable back to their commitment.
5. The only state change that reaches the public ledger is `+1` to
   `yesVotes` or `noVotes`.

```
voter secret (never leaves wallet)
        │
        ├─▶ hash → commitment  ──▶ checked against public eligibleVoters set (ZK)
        └─▶ hash² → nullifier  ──▶ checked + recorded in public usedNullifiers set

public ledger only ever sees: eligibleVoters, usedNullifiers, yesVotes, noVotes
```

## Privacy model

**What an observer (indexer, block explorer, other participant) CAN learn:**

- The live, running `yesVotes` / `noVotes` tally at any point — verifiable
  directly from public ledger state, no trust required.
- That a submitted vote came from *someone* on the eligible-voter allowlist
  (proven in zero-knowledge), and the approximate time it was cast.
- That a particular nullifier has been spent (i.e. "one vote has been used
  up"), and therefore the total number of votes cast so far.
- The full text of the proposal and whether voting is still open.

**What an observer CANNOT learn:**

- **Who** cast any given vote — there is no on-chain field linking a
  transaction to a specific entry in `eligibleVoters`.
- **Which way** a specific registered voter voted, or whether they voted at
  all (only that *a* valid ballot was or wasn't cast by someone).
- The raw 32-byte voter secret, for any voter, at any time — it never
  leaves the browser/wallet and is consumed only inside the ZK proof
  (`tests/private-ballot.test.ts` includes a test asserting this directly
  against serialized ledger state).
- Any two votes cast by the same voter as linked to each other, beyond both
  nullifiers existing in the same public set (the nullifier itself reveals
  nothing about which commitment produced it).

**Trust assumptions / limitations (be upfront about these):**

- The admin who assembles the initial allowlist knows the mapping from
  real-world identity → commitment at setup time, unless voter secrets are
  generated and kept exclusively by the voters themselves (the intended
  flow: each voter generates their own secret locally via
  `witnesses/commitments.ts:newVoter()` and only ever shares the
  *commitment* with the admin for registration).
- The allowlist is fixed at construction time in this version (see
  `PRODUCT_PROPOSAL.md` → Out of scope for planned Level 4/5 work on
  dynamic registration).

## Project structure

```
src/private-ballot.compact        the Compact contract
witnesses/                        TS witnesses + off-chain commitment helpers
tests/private-ballot.test.ts      vitest suite against compiled circuits
scripts/deploy.ts                 Preview/Preprod deploy script
scripts/dust-probe.ts             read-only wallet/DUST diagnostic
frontend/                         Vite + React dApp (wallet connect, vote, tally)
.github/workflows/ci.yml          compile + lint + test + build, on every push
deployments/                      recorded contract addresses per network
```

## Setup

Prerequisites:

- Node.js ≥ 22
- [Compact toolchain](https://docs.midnight.network/relnotes/compact-tools) (`compactc`)
- Docker (for the local proof server, needed only for deployment)

```bash
npm install
npm run compact   # compiles src/private-ballot.compact -> managed/private-ballot
```

`managed/private-ballot/` will contain the generated contract TS API,
compiled ZK circuits (zkir/), and prover/verifier keys — this directory is
gitignored and regenerated by `npm run compact`.

## Testing

```bash
npm test
```

Runs the vitest suite in `tests/private-ballot.test.ts` against the real
compiled circuits via `@midnight-ntwrk/compact-runtime` (not a mock). It
covers:

1. Constructor initializes public ledger state (admin, open poll, zero
   tally).
2. An eligible voter can cast a vote and the public tally updates.
3. A second vote from the same voter is rejected (nullifier reuse).
4. A vote from a secret outside the allowlist is rejected.
5. Only the admin can close voting; votes are rejected once closed.
6. A voter's raw secret never appears anywhere in serialized ledger state.

**Screenshot of a passing run:** add `screenshots/test-output.png` here
after running `npm test` locally (see Submission Checklist below).

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request:

1. Install dependencies
2. Install the Compact compiler
3. `npm run compact` — compile the contract
4. Lint
5. `npm test` — run the vitest suite
6. Build the frontend

Update the badge URL at the top of this README once pushed to your own
`YOUR_GITHUB_USERNAME/midnight-private-ballot` repo so it reflects real run
status.

## Deployment (Preview / Preprod)

```bash
cp .env.example .env
# fill in MIDNIGHT_NETWORK, indexer/node endpoints, and BALLOT_ADMIN_SECRET_HEX

docker-compose up -d --wait proof-server   # local proof server on :6300
npm run deploy
```

Fund your deploy wallet at one of the faucets (captcha-gated, manual step):

| Network | Faucets |
|---|---|
| Preprod | https://faucet.preprod.midnight.network/ · https://midnight-tmnight-preprod.nethermind.dev/ |
| Preview | https://faucet.preview.midnight.network/ · https://midnight-tmnight-preview.nethermind.dev/ |

`scripts/deploy.ts` prints the admin commitment and a set of demo voter
secrets, then writes `deployments/<network>.json` with the deployment
record — fill in the resulting contract address and deploy tx hash after
submission (see inline TODOs in the script for wiring in the actual
`@midnight-ntwrk/wallet` + `@midnight-ntwrk/midnight-js-contracts` calls,
following the pattern documented at docs.midnight.network/develop).

Set `frontend/.env`'s `VITE_BALLOT_CONTRACT_ADDRESS` to the deployed
address so the UI points at it.

## Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

- **Wallet connect** — `src/hooks/useMidnightWallet.ts` talks to the
  injected Midnight DApp Connector (Lace / 1AM).
- **Cast vote** — `src/components/VoteForm.tsx` + `useBallotContract.ts`
  builds and submits a `castVote` transaction.
- **Live tally** — `src/components/TallyDisplay.tsx` reads the public
  `yesVotes` / `noVotes` ledger fields.

## Live demo

`[Add your deployed frontend URL here, e.g. Vercel/Netlify link]`

## Demo video

`[Add your 1-minute demo video link here]` — should show: connecting a
wallet, casting a vote, the tally updating, and a second vote attempt from
the same voter being rejected.

## Submission checklist

- [ ] Public GitHub repository with this README
- [ ] Live demo link (above)
- [ ] Screenshot of `npm test` output (3+ tests passing) in `screenshots/`
- [ ] CI badge updated + at least one green Actions run
- [ ] 1-minute demo video (above)
- [x] README "Privacy model" section
- [x] Product proposal (`PRODUCT_PROPOSAL.md`)
- [ ] 10+ meaningful commits (this history already has 10; keep committing
      as you finish deployment/demo/screenshots)

## License

MIT — see [LICENSE](LICENSE).
