import { useCallback, useState } from "react";

/**
 * Integration point between the UI and the deployed private-ballot
 * contract. In a full build this calls into the generated contract API
 * (from `managed/private-ballot`) via `@midnight-ntwrk/midnight-js-contracts`,
 * using the wallet's connector API to build, prove, and submit the
 * `castVote` transaction, and reads `yesVotes`/`noVotes` straight off the
 * public ledger for the live tally.
 *
 * The voter's secret (see witnesses/private-ballot-witnesses.ts) lives in
 * the browser only for the duration of building the proof and is supplied
 * by the connected wallet -- this hook never sends it anywhere.
 */

export type Tally = { yes: number; no: number };

const CONTRACT_ADDRESS = import.meta.env.VITE_BALLOT_CONTRACT_ADDRESS ?? "";

export function useBallotContract(api: unknown) {
  const [tally, setTally] = useState<Tally>({ yes: 0, no: 0 });
  const [votingOpen, setVotingOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const refreshTally = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;
    // const state = await queryLedgerState(CONTRACT_ADDRESS);
    // setTally({ yes: Number(state.yesVotes), no: Number(state.noVotes) });
    // setVotingOpen(state.votingOpen);
  }, []);

  const castVote = useCallback(
    async (support: boolean) => {
      if (!api) {
        setLastError("Connect a wallet first.");
        return;
      }
      setSubmitting(true);
      setLastError(null);
      try {
        // const tx = await contract.callTx.castVote(support);
        // const submitted = await api.balanceAndProveTransaction(tx);
        // setLastTxId(submitted.txId);
        await refreshTally();
      } catch (e) {
        setLastError(e instanceof Error ? e.message : "Vote submission failed");
      } finally {
        setSubmitting(false);
      }
    },
    [api, refreshTally]
  );

  return { tally, votingOpen, submitting, lastError, lastTxId, castVote, refreshTally };
}
