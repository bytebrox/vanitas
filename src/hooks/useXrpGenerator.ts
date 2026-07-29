'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { maxThreadCount, optimalThreadCount } from '@/lib/threads';
import { XrpVanityGenerator } from '@/lib/xrp-generator';
import type { XrpGeneratorConfig, XrpGeneratorState } from '@/types/xrp';

const initialState: XrpGeneratorState = {
  status: 'idle',
  config: {
    prefix: '',
    suffix: '',
    threads: 4,
    caseSensitive: false,
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

export function useXrpGenerator() {
  const [state, setState] = useState<XrpGeneratorState>(initialState);
  const generatorRef = useRef<XrpVanityGenerator | null>(null);
  const configRef = useRef(initialState.config);

  useEffect(() => {
    generatorRef.current = new XrpVanityGenerator((newState) => {
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

  const start = useCallback((config: Partial<XrpGeneratorConfig>) => {
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

  const updateConfig = useCallback((updates: Partial<XrpGeneratorConfig>) => {
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
