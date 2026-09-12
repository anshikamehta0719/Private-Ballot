# Midnight Private Ballot
![CI](https://github.com/anshikamehta0719/Private-Ballot/actions/workflows/ci.yml/badge.svg)
> Anonymous ballots with publicly verifiable tallies, built on Midnight.

## Live Demo
[Live URL]

## Preprod Contract Address
| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | `02e3c43cc3b49bd956688aebd8778771f4f950bbc0fababeeeb36ecc7b39c466` |

## What This Does
This dApp is a Private Voting/Ballot system. It allows a list of pre-authorized eligible voters to securely cast a "Yes" or "No" vote on a proposal. The tally of "Yes" and "No" votes is public and dynamically updated, but no observer can ever see which specific voter cast which vote.

## Privacy Model
- **PUBLIC:** The current total tally of 'Yes' and 'No' votes, whether the poll is open/closed, and the identity (commitment) of the admin.
- **PRIVATE:** The identity of the individual voters, and the specific choice ('Yes' or 'No') they made.
- **PROVED without revealing:** That a vote was cast by a legitimate, eligible voter who had not already voted, without revealing *who* that voter is.

## Privacy Claim
An on-chain observer can see that the total number of votes has increased by 1, and can observe the final public tally. They **cannot see** the identity of the person who just voted, nor can they link any specific vote to any specific address or secret key.

## Tech Stack
- **Smart Contract:** Midnight Compact
- **Frontend:** React, Vite, TypeScript
- **Wallet Integration:** Midnight Lace Wallet / Midnight dApp Connector

## Prerequisites
- Node.js v22 or higher
- A Midnight-compatible wallet (e.g. Lace Midnight testnet wallet)

## Setup & Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/anshikamehta0719/Private-Ballot.git
   cd Private-Ballot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```

## Run Tests
```bash
npm test
```

## CI/CD
The GitHub Actions CI/CD pipeline runs on every push to `main` and on pull requests. It automatically checks out the code, installs dependencies, installs the Midnight Compact compiler, compiles the smart contract into the `managed/` folder, runs the test suite (`npm test`) to ensure circuit logic and privacy hold true, and builds the frontend dApp for production.

## Product Proposal
See [PROPOSAL.md](PROPOSAL.md)
