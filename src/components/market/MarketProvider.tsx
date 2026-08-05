'use client';

/**
 * Marketplace wallet and session context.
 *
 * Holds the injected provider, the connected account, the chain the wallet is
 * currently on and the server session. Everything under /market reads from
 * here so there is a single place where sign-in state can change.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ensureChain,
  getProvider,
  isUserRejection,
  personalSign,
  readAccounts,
  readChainId,
  requestAccounts,
  type Eip1193Provider,
} from '@/lib/eip1193';
import { MarketApiError, marketApi } from '@/lib/market-api';
import type { MarketConfigResponse, MarketSession } from '@/types/market';

interface MarketContextValue {
  config: MarketConfigResponse | null;
  session: MarketSession | null;
  address: string | null;
  chainId: number | null;
  hasProvider: boolean;
  onCorrectChain: boolean;
  busy: boolean;
  error: string | null;
  ready: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setPayoutAddress: (value: string) => Promise<void>;
  provider: Eip1193Provider | null;
  clearError: () => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used inside MarketProvider');
  return ctx;
}

function describe(error: unknown): string {
  if (isUserRejection(error)) return 'rejected';
  if (error instanceof MarketApiError) return error.code;
  if (error instanceof Error) return error.message;
  return 'unknown_error';
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MarketConfigResponse | null>(null);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const providerRef = useRef<Eip1193Provider | null>(null);

  if (providerRef.current === null && typeof window !== 'undefined') {
    providerRef.current = getProvider();
  }
  const provider = providerRef.current;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [configResult, sessionResult] = await Promise.allSettled([
        marketApi.config(),
        marketApi.session(),
      ]);
      if (cancelled) return;

      if (configResult.status === 'fulfilled') setConfig(configResult.value);
      if (sessionResult.status === 'fulfilled') setSession(sessionResult.value);

      if (provider) {
        const [accounts, currentChain] = await Promise.all([
          readAccounts(provider).catch(() => [] as string[]),
          readChainId(provider).catch(() => null),
        ]);
        if (cancelled) return;
        setAddress(accounts[0] ?? null);
        setChainId(currentChain);
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [provider]);

  useEffect(() => {
    if (!provider?.on || !provider.removeListener) return;

    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = (args[0] as string[] | undefined) ?? [];
      const next = accounts[0]?.toLowerCase() ?? null;
      setAddress(next);
      // A different account means the cookie no longer matches the wallet.
      setSession((current) => (current && current.address !== next ? null : current));
      if (!next) void marketApi.logout().catch(() => undefined);
    };

    const onChainChanged = (...args: unknown[]) => {
      const hex = args[0] as string | undefined;
      setChainId(hex ? Number.parseInt(hex, 16) : null);
    };

    provider.on('accountsChanged', onAccountsChanged);
    provider.on('chainChanged', onChainChanged);
    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged);
      provider.removeListener?.('chainChanged', onChainChanged);
    };
  }, [provider]);

  const switchNetwork = useCallback(async () => {
    if (!provider || !config) return;
    await ensureChain(provider, {
      chainIdHex: config.chain.chainIdHex,
      chainName: config.chain.chainName,
      nativeCurrency: config.chain.nativeCurrency,
      rpcUrls: config.chain.rpcUrls,
      blockExplorerUrls: config.chain.blockExplorerUrls,
    });
    setChainId(await readChainId(provider));
  }, [provider, config]);

  const connect = useCallback(async () => {
    if (!provider || !config) {
      setError('no_wallet');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const accounts = await requestAccounts(provider);
      const account = accounts[0];
      if (!account) throw new Error('no_account');
      setAddress(account);

      await switchNetwork();

      const { nonce, message } = await marketApi.requestNonce(account);
      const signature = await personalSign(provider, account, message);
      setSession(await marketApi.verifySignature(nonce, signature));
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  }, [provider, config, switchNetwork]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      await marketApi.logout();
    } catch {
      // Clearing local state matters more than the round trip succeeding.
    } finally {
      setSession(null);
      setBusy(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setSession(await marketApi.session());
    } catch {
      setSession(null);
    }
  }, []);

  const setPayoutAddress = useCallback(async (value: string) => {
    setSession(await marketApi.setPayoutAddress(value));
  }, []);

  const value = useMemo<MarketContextValue>(
    () => ({
      config,
      session,
      address,
      chainId,
      hasProvider: Boolean(provider),
      onCorrectChain: Boolean(config && chainId === config.chain.chainId),
      busy,
      error,
      ready,
      connect,
      disconnect,
      switchNetwork,
      refreshSession,
      setPayoutAddress,
      provider,
      clearError: () => setError(null),
    }),
    [
      config,
      session,
      address,
      chainId,
      provider,
      busy,
      error,
      ready,
      connect,
      disconnect,
      switchNetwork,
      refreshSession,
      setPayoutAddress,
    ]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}
