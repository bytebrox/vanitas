'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TronVanityGenerator } from '@/lib/tron-generator';
import type { TronGeneratorConfig, TronGeneratorState } from '@/types/tron';

const initialState: TronGeneratorState = {
  status: 'idle',
  config: {
    prefix: '',
    suffix: '',
    threads: 4,
    caseSensitive: false,
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

export function useTronGenerator() {
  const [state, setState] = useState<TronGeneratorState>(initialState);
  const generatorRef = useRef<TronVanityGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new TronVanityGenerator((newState) => {
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

  const start = useCallback((config: Partial<TronGeneratorConfig>) => {
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

  const updateConfig = useCallback((updates: Partial<TronGeneratorConfig>) => {
    const nextConfig = { ...configRef.current, ...updates };
    configRef.current = nextConfig;
    generatorRef.current?.patchConfig(nextConfig);
    if (updates.threads !== undefined) {
      generatorRef.current?.setThreadCount(updates.threads);
    }
    setState((prev) => ({ ...prev, config: nextConfig }));
  }, []);

  const maxThreads =
    typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8;

  return { state, start, stop, reset, updateConfig, maxThreads };
}
