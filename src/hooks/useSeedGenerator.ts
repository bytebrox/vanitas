'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SeedGenerator } from '@/lib/seed-generator';
import { maxThreadCount, optimalThreadCount } from '@/lib/threads';
import type { SeedConfig, SeedState } from '@/types/seed';

const initialState: SeedState = {
  status: 'idle',
  config: {
    mnemonic: '',
    passphrase: '',
    styleId: 'sol-account',
    prefix: '',
    suffix: '',
    caseSensitive: false,
    startIndex: 0,
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

export function useSeedGenerator() {
  const [state, setState] = useState<SeedState>(initialState);
  const generatorRef = useRef<SeedGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new SeedGenerator((next) => {
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

    return () => {
      generatorRef.current?.destroy();
    };
  }, []);

  const start = useCallback((config: Partial<SeedConfig>) => {
    generatorRef.current?.start({ ...configRef.current, ...config });
  }, []);

  const stop = useCallback(() => {
    generatorRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    generatorRef.current?.reset();
  }, []);

  const updateConfig = useCallback((updates: Partial<SeedConfig>) => {
    const nextConfig = { ...configRef.current, ...updates };
    configRef.current = nextConfig;
    generatorRef.current?.patchConfig(nextConfig);
    if (updates.threads !== undefined) {
      generatorRef.current?.setThreadCount(updates.threads);
    }
    setState((prev) => ({ ...prev, config: nextConfig }));
  }, []);

  return { state, start, stop, reset, updateConfig, maxThreads: maxThreadCount() };
}
