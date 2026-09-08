import { useCallback, useState } from "react";

/**
 * Thin wrapper around the injected Midnight wallet connector (e.g. Lace or
 * 1AM). Exposes just enough surface for this dApp: connect, the connected
 * address, and the underlying API object the contract-interaction hook
 * needs to build + submit proofs.
 *
 * The exact injected global differs by wallet extension; both Lace and 1AM
 * follow the DApp Connector API shape documented at
 * docs.midnight.network/develop/reference/midnight-api/dapp-connector-api.
 * Swap `resolveInjectedConnector` below for whichever wallet you target.
 */

type MidnightConnectorApi = {
  enable: () => Promise<MidnightConnectorApi>;
  state: () => Promise<{ address: string }>;
  balanceAndProveTransaction?: unknown;
};

declare global {
  interface Window {
    midnight?: Record<string, { enable: () => Promise<MidnightConnectorApi> }>;
  }
}

function resolveInjectedConnector(): (() => Promise<MidnightConnectorApi>) | null {
  if (typeof window === "undefined" || !window.midnight) return null;
  const provider = window.midnight.lace ?? window.midnight["1am"] ?? Object.values(window.midnight)[0];
  return provider ? () => provider.enable() : null;
}

export function useMidnightWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [api, setApi] = useState<MidnightConnectorApi | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    const enable = resolveInjectedConnector();
    if (!enable) {
      setError("No Midnight wallet extension found. Install Lace or 1AM and reload.");
      return;
    }
    setConnecting(true);
    try {
      const connected = await enable();
      const { address } = await connected.state();
      setApi(connected);
      setAddress(address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setApi(null);
    setAddress(null);
  }, []);

  return { address, api, connecting, error, connect, disconnect };
}
