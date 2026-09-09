# Product Proposal — Level 3 (First Quarter)

**Idea selected from the provided list:** Private Voting — anonymous ballots
with publicly verifiable tallies.

## Problem

Most on-chain voting is either fully public (every vote is linkable to a
wallet, chilling honest participation) or fully off-chain (tallies require
trusting a centralized operator). Neither gives voters real ballot secrecy
*and* gives observers a result they can verify themselves.

## Solution

**Private Ballot** is a small DAO/community voting dApp on Midnight where:

- A fixed set of eligible voters is registered on-chain as *commitments*
  (hashes of a secret), never as addresses or identities.
- Casting a vote requires a zero-knowledge proof of knowing the secret
  behind one of those commitments — proving eligibility without revealing
  which registered voter you are.
- A nullifier (a second, differently-salted hash of the same secret) is
  recorded on-chain to block double voting, without being linkable to the
  voter's commitment.
- The only thing that changes on the public ledger per vote is one of two
  aggregate counters (`yesVotes` / `noVotes`) — a result anyone can
  independently read and verify, with no way to trace it back to a person.

## Why this fits Midnight's privacy model

This is close to the canonical showcase for Midnight: it needs exactly the
split between public ledger state (the tally, the poll status) and private
witness state (the voter's secret, the eligibility proof) that Compact is
built around, and it has a clean, explainable disclosure boundary — which
makes the "what can an observer learn / not learn" story easy to state
precisely (see README → Privacy Model).

## Scope for Level 3

- [x] Compact contract: constructor (admin + allowlist + proposal text),
      `castVote`, `closeVoting`, `tally` circuits.
- [x] TypeScript witnesses providing the voter's local secret.
- [x] Vitest suite (6 tests) exercising the compiled circuits directly.
- [x] GitHub Actions CI: install → compile contract → lint → test → build
      frontend, on every push/PR.
- [x] React/Vite frontend: wallet connect, cast-vote UI, live tally.
- [ ] Deployed instance on Preprod/Preview (see README → Deployment for the
      manual, faucet-gated steps needed to complete this).

## Out of scope for this level (candidates for Level 4/5)

- Multiple concurrent proposals / a poll factory.
- On-chain proposal creation flow (currently set at deploy time).
- Delegated/weighted voting.
- Sponsor-paid (gasless) voting via a relayer, so voters don't need their
  own tNIGHT/DUST.
