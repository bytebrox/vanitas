import type { SeedChain } from '@/workers/seed-derivation';

export type { SeedChain };

export type SeedStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error' | 'exhausted';

export interface SeedConfig {
  /** 12 or 24 BIP39 words. Never leaves the browser. */
  mnemonic: string;
  /** Optional BIP39 passphrase (the "25th word"). */
  passphrase: string;
  styleId: string;
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  /** Lowest derivation index to try. */
  startIndex: number;
  threads: number;
}

export interface SeedStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface SeedResult {
  address: string;
  privateKey: string;
  index: number;
  path: string;
  styleId: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface SeedState {
  status: SeedStatus;
  config: SeedConfig;
  stats: SeedStats;
  result: SeedResult | null;
  error: string | null;
}

export interface SeedWorkerInbound {
  type: 'start' | 'stop';
  config?: {
    seed: Uint8Array;
    styleId: string;
    prefix: string;
    suffix: string;
    caseSensitive: boolean;
    startIndex: number;
    stride: number;
  };
  workerId?: number;
}

export interface SeedWorkerOutbound {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready' | 'exhausted';
  workerId: number;
  result?: SeedResult;
  attempts?: number;
  rate?: number;
  error?: string;
}
