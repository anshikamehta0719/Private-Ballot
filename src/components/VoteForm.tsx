type Props = {
  votingOpen: boolean;
  submitting: boolean;
  walletConnected: boolean;
  onVote: (support: boolean) => void;
  lastError: string | null;
  lastTxId: string | null;
};

function shortTx(tx: string) {
  return `${tx.slice(0, 10)}…${tx.slice(-8)}`;
}

export function VoteForm({
  votingOpen,
  submitting,
  walletConnected,
  onVote,
  lastError,
  lastTxId,
}: Props) {
  const disabled = submitting || !walletConnected || !votingOpen || !!lastTxId;

  return (
    <div className="card">
      <h2>Cast your vote</h2>
      <p className="muted">
        Your ballot is proven eligible in zero-knowledge and never linked to your wallet
        address on-chain. Only the running yes/no total changes.
      </p>

      {lastTxId ? (
        <div className="voted-banner">
          <span className="voted-check">✅</span>
          <div>
            <strong>Vote recorded privately!</strong>
            <p className="muted" style={{ fontSize: "0.75rem", marginTop: 4 }}>
              Tx: <code>{shortTx(lastTxId)}</code>
            </p>
          </div>
        </div>
      ) : (
        <div className="vote-buttons">
          <button className="yes" disabled={disabled} onClick={() => onVote(true)}>
            {submitting ? "⏳ Proving…" : "👍 Vote Yes"}
          </button>
          <button className="no" disabled={disabled} onClick={() => onVote(false)}>
            {submitting ? "⏳ Proving…" : "👎 Vote No"}
          </button>
        </div>
      )}

      {!votingOpen && <p className="muted">Voting is closed for this proposal.</p>}
      {!walletConnected && !lastTxId && (
        <p className="muted" style={{ marginTop: 8 }}>Connect your wallet to vote.</p>
      )}
      {lastError && <p className="error">{lastError}</p>}
    </div>
  );
}
