import type { PatternTarget } from '@/lib/patterns';
/**
 * Types for TON vanity generation (Wallet v4R2)
 */

export type TonMode = 'non-bounceable' | 'bounceable';

export interface TonGeneratorConfig {
  prefix: string;
  suffix: string;
  /** OR-targets; falls back to prefix/suffix when empty */
  patterns?: PatternTarget[];
  threads: number;
  mode: TonMode;
}

export interface GeneratedTonResult {
  mode: TonMode;
  address: string;
  bounceableAddress: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface TonWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: TonGeneratorConfig;
  workerId?: number;
}

export interface TonWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedTonResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type TonGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface TonGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface TonGeneratorState {
  status: TonGeneratorStatus;
  config: TonGeneratorConfig;
  stats: TonGeneratorStats;
  result: GeneratedTonResult | null;
  error: string | null;
}

/** Base64url alphabet used in TON user-friendly addresses */
export const TON_BASE64URL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
