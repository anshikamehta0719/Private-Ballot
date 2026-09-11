import { useCallback, useState } from "react";

/**
 * Thin wrapper around the injected Midnight wallet connector (Lace / 1AM).
 * The Lace Midnight DApp Connector API injects into window.midnight.lace.
 * Calling .enable() on it returns an API object with methods like
 * balanceAndProveTransaction.
 */

type MidnightConnectorApi = {
  enable?: () => Promise<MidnightConnectorApi>;
  state?: () => Promise<{ address: string }>;
  getState?: () => Promise<{ address: string; coinPublicKey?: string }>;
  balanceAndProveTransaction?: unknown;
};

declare global {
  interface Window {
    midnight?: Record<string, MidnightConnectorApi>;
  }
}

function resolveProvider(): MidnightConnectorApi | null {
  if (typeof window === "undefined" || !window.midnight) return null;
  return (
    window.midnight["lace"] ??
    window.midnight["1am"] ??
    Object.values(window.midnight)[0] ??
    null
  );
}

export function useMidnightWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [api, setApi] = useState<MidnightConnectorApi | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    const provider = resolveProvider();

    if (!provider) {
      setError(
        "No Midnight wallet found. Install the Lace extension, set it to Preprod network, and reload."
      );
      return;
    }

    setConnecting(true);
    try {
      let connectedApi: MidnightConnectorApi;

      // Lace uses .enable() to grant access and return an API object
      if (typeof provider.enable === "function") {
        connectedApi = await provider.enable();
      } else {
        // Some connector versions expose the API directly without enable()
        connectedApi = provider;
      }

      // Try to get the wallet address
      let walletAddress = "connected";
      if (typeof connectedApi.getState === "function") {
        const state = await connectedApi.getState();
        walletAddress = state.address ?? state.coinPublicKey ?? "connected";
      } else if (typeof connectedApi.state === "function") {
        const state = await connectedApi.state();
        walletAddress = state.address ?? "connected";
      }

      setApi(connectedApi);
      setAddress(walletAddress);
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
