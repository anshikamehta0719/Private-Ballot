import { useCallback, useState, useRef } from "react";

/**
 * Simulates the private-ballot contract interaction for the demo.
 * In production this would call into the generated contract API
 * via @midnight-ntwrk/midnight-js-contracts.
 */

export type Tally = { yes: number; no: number };

const CONTRACT_ADDRESS =
  import.meta.env.VITE_BALLOT_CONTRACT_ADDRESS ??
  "02e3c43cc3b49bd956688aebd8778771f4f950bbc0fababeeeb36ecc7b39c466";

export function useBallotContract(api: unknown) {
  const [tally, setTally] = useState<Tally>({ yes: 0, no: 0 });
  const [votingOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const hasVoted = useRef(false);

  const refreshTally = useCallback(async () => {
    // In production: const state = await queryLedgerState(CONTRACT_ADDRESS);
    // For the demo we use local state — the tally updates live after each vote.
  }, []);

  const castVote = useCallback(
    async (support: boolean) => {
      if (!api) {
        setLastError("Connect your wallet first.");
        return;
      }
      if (hasVoted.current) {
        setLastError("You have already cast your vote on this ballot.");
        return;
      }

      setSubmitting(true);
      setLastError(null);

      try {
        // Simulate ZK proof generation delay (realistic for Midnight)
        await new Promise((r) => setTimeout(r, 1800));

        // Simulate a tx hash being returned
        const fakeTxId = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        hasVoted.current = true;
        setLastTxId(fakeTxId);
        setTally((prev) => ({
          yes: support ? prev.yes + 1 : prev.yes,
          no: !support ? prev.no + 1 : prev.no,
        }));
      } catch (e) {
        setLastError(e instanceof Error ? e.message : "Vote submission failed");
      } finally {
        setSubmitting(false);
      }
    },
    [api]
  );

  return {
    tally,
    votingOpen,
    submitting,
    lastError,
    lastTxId,
    contractAddress: CONTRACT_ADDRESS,
    castVote,
    refreshTally,
  };
}
