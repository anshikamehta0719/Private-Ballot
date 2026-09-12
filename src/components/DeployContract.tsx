import { useState } from "react";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { Contract } from "../../managed/private-ballot/contract/index.cjs";
import { privateBallotWitnesses } from "../../witnesses/private-ballot-witnesses";
import { commitmentFor, generateVoterSecret, toHex } from "../../witnesses/commitments";

export function DeployContract({ walletApi }: { walletApi: any }) {
  const [status, setStatus] = useState<string>("");
  const [address, setAddress] = useState<string | null>(null);

  const doDeploy = async () => {
    try {
      if (!walletApi) throw new Error("Wallet not connected");
      setStatus("Generating admin/voter secrets...");

      // Get secrets from env or generate
      const adminSecretHex = "d7dce5386a755930415303da8ed8368e580f81b2a9066837c80eedd6ae50358b";
      const adminSecret = new Uint8Array(adminSecretHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const adminCommitment = commitmentFor(adminSecret);

      const demoVoters = Array.from({ length: 5 }, () => generateVoterSecret());
      const voterCommitments = demoVoters.map(commitmentFor);

      setStatus("Deploying contract (waiting for Lace Wallet)...");

      // We pass the Lace API which implements the standard Wallet interface
      const deployed = await deployContract(walletApi, {
        contract: new Contract(privateBallotWitnesses),
        args: [adminCommitment, "Should the treasury fund proposal #7?", voterCommitments],
      });

      console.log("Deployed contract address:", deployed.contractAddress);
      setAddress(deployed.contractAddress);
      setStatus("Success!");
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  if (!walletApi) return null;

  return (
    <div className="card" style={{ marginTop: "2rem", borderColor: "var(--accent)" }}>
      <h3 style={{ marginTop: 0 }}>Deploy to Preprod</h3>
      <p className="muted" style={{ fontSize: "0.85rem" }}>
        Admin only: deploy a fresh instance of the real contract on-chain.
      </p>
      {address ? (
        <div className="success">
          <p>✅ Deployed to Preprod!</p>
          <code>{address}</code>
        </div>
      ) : (
        <button className="primary" onClick={doDeploy} disabled={status.includes("Deploying")}>
          {status || "Deploy Real Contract Now"}
        </button>
      )}
    </div>
  );
}
