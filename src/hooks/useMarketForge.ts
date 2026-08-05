'use client';

/**
 * Hook for the marketplace split-key forge.
 *
 * Wraps the worker pool and the two API calls that bracket a run: opening a
 * session to obtain the server point, and submitting the found client half.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { maxThreadCount, optimalThreadCount } from '@/lib/threads';
import { MarketVanityGenerator } from '@/lib/market-generator';
import { marketApi } from '@/lib/market-api';
import type {
  ListingSummary,
  MarketForgeConfig,
  MarketForgeState,
} from '@/types/market';
import type { PatternTarget } from '@/lib/patterns';

const initialState: MarketForgeState = {
  status: 'idle',
  config: { serverPoint: '', prefix: '', suffix: '', threads: 4 },
  stats: { totalAttempts: 0, attemptsPerSecond: 0, elapsedTime: 0, activeWorkers: 0 },
  result: null,
  error: null,
};

export function useMarketForge() {
  const [state, setState] = useState<MarketForgeState>(initialState);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatorRef = useRef<MarketVanityGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new MarketVanityGenerator((next) => {
      configRef.current = next.config;
      setState(next);
    });

    const threads = optimalThreadCount();
    generatorRef.current.patchConfig({ threads });
    setState((prev) => {
      const config = { ...prev.config, threads };
      configRef.current = config;
      return { ...prev, config };
    });

    return () => generatorRef.current?.destroy();
  }, []);

  const updateConfig = useCallback((updates: Partial<MarketForgeConfig>) => {
    const next = { ...configRef.current, ...updates };
    configRef.current = next;
    generatorRef.current?.patchConfig(next);
    if (updates.threads !== undefined) generatorRef.current?.setThreadCount(updates.threads);
    setState((prev) => ({ ...prev, config: next }));
  }, []);

  /** Open a server session, then start the workers against its point. */
  const start = useCallback(
    async (patterns: PatternTarget[]) => {
      if (!generatorRef.current) return;

      setError(null);
      setListing(null);
      setPreparing(true);
      try {
        const primary = patterns[0] ?? { prefix: '', suffix: '' };
        const label = patterns.map((p) => `${p.prefix}...${p.suffix}`).join(' | ');
        const session = await marketApi.openForgeSession(label);
        setSessionId(session.sessionId);

        generatorRef.current.start({
          ...configRef.current,
          serverPoint: session.serverPoint,
          prefix: primary.prefix,
          suffix: primary.suffix,
          patterns,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'session_failed');
      } finally {
        setPreparing(false);
      }
    },
    []
  );

  const stop = useCallback(() => generatorRef.current?.stop(), []);

  const reset = useCallback(() => {
    generatorRef.current?.reset();
    setSessionId(null);
    setListing(null);
    setError(null);
  }, []);

  /**
   * Hand the client half to the server, which combines it with its own and
   * creates the draft listing. Nothing is kept locally afterwards.
   */
  const submit = useCallback(
    async (difficultyBits?: number) => {
      const result = state.result;
      if (!result || !sessionId) return null;

      setSubmitting(true);
      setError(null);
      try {
        const created = await marketApi.submitForge({
          sessionId,
          clientHalf: result.clientHalf,
          address: result.address,
          matchedPattern: result.matchedPattern,
          attempts: result.attempts,
          difficultyBits,
        });
        setListing(created);
        setSessionId(null);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'submit_failed');
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [state.result, sessionId]
  );

  return {
    state,
    listing,
    error,
    preparing,
    submitting,
    hasSession: sessionId !== null,
    start,
    stop,
    reset,
    submit,
    updateConfig,
    maxThreads: maxThreadCount(),
  };
}
