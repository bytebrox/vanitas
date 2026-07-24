'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BtcVanityGenerator } from '@/lib/btc-generator';
import type { BtcGeneratorConfig, BtcGeneratorState } from '@/types/btc';

const initialState: BtcGeneratorState = {
  status: 'idle',
  config: {
    prefix: '',
    suffix: '',
    threads: 4,
    mode: 'legacy',
    caseSensitive: true,
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

export function useBtcGenerator() {
  const [state, setState] = useState<BtcGeneratorState>(initialState);
  const generatorRef = useRef<BtcVanityGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new BtcVanityGenerator((newState) => {
      configRef.current = newState.config;
      setState(newState);
    });
    const optimalThreads = Math.max(1, (navigator.hardwareConcurrency || 4) - 1);
    generatorRef.current.patchConfig({ threads: optimalThreads });
    setState((prev) => {
      const config = { ...prev.config, threads: optimalThreads };
      configRef.current = config;
      return { ...prev, config };
    });
    return () => { generatorRef.current?.destroy(); };
  }, []);

  const start = useCallback((config: Partial<BtcGeneratorConfig>) => {
    generatorRef.current?.start({ ...configRef.current, ...config });
  }, []);

  const stop = useCallback(() => { generatorRef.current?.stop(); }, []);

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

  const updateConfig = useCallback((updates: Partial<BtcGeneratorConfig>) => {
    const prevConfig = configRef.current;
    const nextConfig = { ...prevConfig, ...updates };
    if (updates.mode === 'segwit') nextConfig.caseSensitive = false;
    const modeChanged = updates.mode !== undefined && updates.mode !== prevConfig.mode;
    configRef.current = nextConfig;
    generatorRef.current?.patchConfig(nextConfig);
    if (updates.threads !== undefined) {
      generatorRef.current?.setThreadCount(updates.threads);
    }
    if (modeChanged) {
      generatorRef.current?.reset();
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
    setState((prev) => ({ ...prev, config: nextConfig }));
  }, []);

  const maxThreads =
    typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8;

  return { state, start, stop, reset, updateConfig, maxThreads };
}
