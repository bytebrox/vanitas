'use client';

/**
 * Hook for Solana vanity generator
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { maxThreadCount, optimalThreadCount } from '@/lib/threads';
import { VanityGenerator } from '@/lib/generator';
import { GeneratorState, GeneratorConfig } from '@/types';

const initialState: GeneratorState = {
  status: 'idle',
  config: {
    prefix: '',
    suffix: '',
    caseSensitive: false,
    threads: 4,
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

export function useGenerator() {
  const [state, setState] = useState<GeneratorState>(initialState);
  const generatorRef = useRef<VanityGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new VanityGenerator((newState) => {
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

  const start = useCallback((config: Partial<GeneratorConfig>) => {
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

  const updateConfig = useCallback((updates: Partial<GeneratorConfig>) => {
    const nextConfig = { ...configRef.current, ...updates };
    configRef.current = nextConfig;
    generatorRef.current?.patchConfig(nextConfig);
    if (updates.threads !== undefined) {
      generatorRef.current?.setThreadCount(updates.threads);
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
