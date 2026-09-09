import { useMidnightWallet } from "./hooks/useMidnightWallet";
import { useBallotContract } from "./hooks/useBallotContract";
import { WalletConnect } from "./components/WalletConnect";
import { VoteForm } from "./components/VoteForm";
import { TallyDisplay } from "./components/TallyDisplay";

export default function App() {
  const wallet = useMidnightWallet();
  const ballot = useBallotContract(wallet.api);

  return (
    <div className="app">
      <header>
        <div>
          <h1>Private Ballot</h1>
          <p className="muted">Anonymous ballots · publicly verifiable tallies · Midnight</p>
        </div>
        <WalletConnect {...wallet} />
      </header>

      <main>
        <VoteForm
          votingOpen={ballot.votingOpen}
          submitting={ballot.submitting}
          walletConnected={Boolean(wallet.address)}
          onVote={ballot.castVote}
          lastError={ballot.lastError}
          lastTxId={ballot.lastTxId}
        />
        <TallyDisplay tally={ballot.tally} />
      </main>

      <footer className="muted">
        Contract address: {import.meta.env.VITE_BALLOT_CONTRACT_ADDRESS || "not deployed yet"}
      </footer>
    </div>
  );
}
