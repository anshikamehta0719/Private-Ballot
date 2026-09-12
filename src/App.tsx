import { useMidnightWallet } from "./hooks/useMidnightWallet";
import { useBallotContract } from "./hooks/useBallotContract";
import { WalletConnect } from "./components/WalletConnect";
import { VoteForm } from "./components/VoteForm";
import { TallyDisplay } from "./components/TallyDisplay";
import { DeployContract } from "./components/DeployContract";

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
        
        {/* Real on-chain deployment flow using Lace wallet provider */}
        <DeployContract walletApi={wallet.api} />
      </main>

      <footer className="muted">
        Contract:{" "}
        <a
          href={`https://midnight-explorer.preprod.midnight.network/contract/02e3c43cc3b49bd956688aebd8778771f4f950bbc0fababeeeb36ecc7b39c466`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "0.78rem" }}
        >
          02e3c43cc3b49…b39c466
        </a>
      </footer>
    </div>
  );
}
