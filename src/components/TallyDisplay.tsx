import type { Tally } from "../hooks/useBallotContract";

export function TallyDisplay({ tally }: { tally: Tally }) {
  const total = tally.yes + tally.no;
  const yesPct = total === 0 ? 0 : Math.round((tally.yes / total) * 100);

  return (
    <div className="card">
      <h2>Live, publicly verifiable tally</h2>
      <div className="bar">
        <div className="bar-yes" style={{ width: `${yesPct}%` }} />
      </div>
      <div className="tally-numbers">
        <span>Yes: {tally.yes}</span>
        <span>No: {tally.no}</span>
        <span>Total votes: {total}</span>
      </div>
      <p className="muted">
        Anyone can independently recompute this total from the public ledger. What no
        observer can do is match any single vote back to a voter.
      </p>
    </div>
  );
}
