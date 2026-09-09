type Props = {
  votingOpen: boolean;
  submitting: boolean;
  walletConnected: boolean;
  onVote: (support: boolean) => void;
  lastError: string | null;
  lastTxId: string | null;
};

export function VoteForm({
  votingOpen,
  submitting,
  walletConnected,
  onVote,
  lastError,
  lastTxId,
}: Props) {
  const disabled = submitting || !walletConnected || !votingOpen;

  return (
    <div className="card">
      <h2>Cast your vote</h2>
      <p className="muted">
        Your ballot is proven eligible in zero-knowledge and never linked to your wallet
        address on-chain. Only the running yes/no total changes.
      </p>
      <div className="vote-buttons">
        <button className="yes" disabled={disabled} onClick={() => onVote(true)}>
          Vote Yes
        </button>
        <button className="no" disabled={disabled} onClick={() => onVote(false)}>
          Vote No
        </button>
      </div>
      {!votingOpen && <p className="muted">Voting is closed for this proposal.</p>}
      {!walletConnected && <p className="muted">Connect your wallet to vote.</p>}
      {lastError && <p className="error">{lastError}</p>}
      {lastTxId && <p className="success">Vote submitted: {lastTxId}</p>}
    </div>
  );
}
