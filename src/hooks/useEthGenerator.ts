'use client';

/**
 * Hook for ETH vanity generator
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { maxThreadCount, optimalThreadCount } from '@/lib/threads';
import { EthVanityGenerator } from '@/lib/eth-generator';
import type { EthGeneratorConfig, EthGeneratorState } from '@/types/eth';

const initialState: EthGeneratorState = {
  status: 'idle',
  config: {
    prefix: '',
    suffix: '',
    threads: 4,
    mode: 'wallet',
  },
  stats: {
    totalAttempts: 0,
    attemptsPerSecond: 0,
    elapsedTime: 0,
    activeWorkers: 0,
  },
  result: null,
  error: null,
};

export function useEthGenerator() {
  const [state, setState] = useState<EthGeneratorState>(initialState);
  const generatorRef = useRef<EthVanityGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new EthVanityGenerator((newState) => {
      configRef.current = newState.config;
      setState(newState);
    });

    const optimalThreads = optimalThreadCount();
    generatorRef.current.patchConfig({ threads: optimalThreads });
    setState((prev) => {
      const config = { ...prev.config, threads: optimalThreads };
      configRef.current = config;
      return { ...prev, config };
    });

    return () => {
      generatorRef.current?.destroy();
    };
  }, []);

  const start = useCallback((config: Partial<EthGeneratorConfig>) => {
    if (!generatorRef.current) return;
    generatorRef.current.start({
      ...configRef.current,
      ...config,
    });
  }, []);

  const stop = useCallback(() => {
    generatorRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    if (generatorRef.current) {
      generatorRef.current.reset();
      return;
    }
    setState((prev) => ({
      ...initialState,
      config: prev.config,
      stats: { ...initialState.stats },
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<EthGeneratorConfig>) => {
    const prevConfig = configRef.current;
    const nextConfig = { ...prevConfig, ...updates };
    const modeChanged =
      updates.mode !== undefined && updates.mode !== prevConfig.mode;

    configRef.current = nextConfig;
    generatorRef.current?.patchConfig(nextConfig);

    if (updates.threads !== undefined) {
      generatorRef.current?.setThreadCount(updates.threads);
    }

    // Switching wallet ↔ contract after a find: clear result and return to forge
    if (modeChanged) {
      generatorRef.current?.reset();
      // reset() emits idle with patched config; also sync React in case generator missing
      setState((prev) => ({
        ...prev,
        status: 'idle',
        result: null,
        error: null,
        config: nextConfig,
        stats: { ...initialState.stats },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      config: nextConfig,
    }));
  }, []);

  const maxThreads = maxThreadCount();

  return {
    state,
    start,
    stop,
    reset,
    updateConfig,
    maxThreads,
  };
}
