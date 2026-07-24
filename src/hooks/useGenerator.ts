'use client';

/**
 * Custom hook for managing the vanity generator
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Initialize generator on mount
  useEffect(() => {
    generatorRef.current = new VanityGenerator((newState) => {
      setState(newState);
    });

    // Detect optimal thread count
    const optimalThreads = Math.max(
      1,
      (navigator.hardwareConcurrency || 4) - 1
    );
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, threads: optimalThreads },
    }));

    return () => {
      generatorRef.current?.destroy();
    };
  }, []);

  // Start generation
  const start = useCallback((config: Partial<GeneratorConfig>) => {
    if (!generatorRef.current) return;

    generatorRef.current.start({
      ...state.config,
      ...config,
    });
  }, [state.config]);

  // Stop generation
  const stop = useCallback(() => {
    generatorRef.current?.stop();
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    generatorRef.current?.stop();
    setState((prev) => ({
      ...initialState,
      config: prev.config,
    }));
  }, []);

  // Update config
  const updateConfig = useCallback((updates: Partial<GeneratorConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));

    if (updates.threads && generatorRef.current) {
      generatorRef.current.setThreadCount(updates.threads);
    }
  }, []);

  // Get max threads
  const maxThreads = typeof navigator !== 'undefined'
    ? navigator.hardwareConcurrency || 8
    : 8;

  return {
    state,
    start,
    stop,
    reset,
    updateConfig,
    maxThreads,
  };
}
