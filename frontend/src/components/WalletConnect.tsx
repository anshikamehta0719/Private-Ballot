import type { useMidnightWallet } from "../hooks/useMidnightWallet";

type Props = ReturnType<typeof useMidnightWallet>;

function shorten(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

export function WalletConnect({ address, connecting, error, connect, disconnect }: Props) {
  if (address) {
    return (
      <div className="wallet-pill">
        <span className="dot" />
        <span>{shorten(address)}</span>
        <button className="link-button" onClick={disconnect}>
          disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button className="primary" onClick={connect} disabled={connecting}>
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
