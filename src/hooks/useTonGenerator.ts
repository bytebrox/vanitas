'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { maxThreadCount, optimalThreadCount } from '@/lib/threads';
import { TonVanityGenerator } from '@/lib/ton-generator';
import type { TonGeneratorConfig, TonGeneratorState } from '@/types/ton';

const initialState: TonGeneratorState = {
  status: 'idle',
  config: {
    prefix: '',
    suffix: '',
    threads: 4,
    mode: 'non-bounceable',
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

export function useTonGenerator() {
  const [state, setState] = useState<TonGeneratorState>(initialState);
  const generatorRef = useRef<TonVanityGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new TonVanityGenerator((newState) => {
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

  const start = useCallback((config: Partial<TonGeneratorConfig>) => {
    generatorRef.current?.start({ ...configRef.current, ...config });
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

  const updateConfig = useCallback((updates: Partial<TonGeneratorConfig>) => {
    const nextConfig = { ...configRef.current, ...updates };
    configRef.current = nextConfig;
    generatorRef.current?.patchConfig(nextConfig);
    if (updates.threads !== undefined) {
      generatorRef.current?.setThreadCount(updates.threads);
    }
    setState((prev) => ({ ...prev, config: nextConfig }));
  }, []);

  const maxThreads = maxThreadCount();

  return { state, start, stop, reset, updateConfig, maxThreads };
}
