import type { PatternTarget } from '@/lib/patterns';
/**
 * Types for Aptos vanity generation (Ed25519)
 */

export interface AptosGeneratorConfig {
  prefix: string;
  suffix: string;
  /** OR-targets; falls back to prefix/suffix when empty */
  patterns?: PatternTarget[];
  threads: number;
}

export interface GeneratedAptosResult {
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface AptosWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: AptosGeneratorConfig;
  workerId?: number;
}

export interface AptosWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedAptosResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type AptosGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface AptosGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface AptosGeneratorState {
  status: AptosGeneratorStatus;
  config: AptosGeneratorConfig;
  stats: AptosGeneratorStats;
  result: GeneratedAptosResult | null;
  error: string | null;
}

/** Hex alphabet for Aptos addresses (case-insensitive matching) */
export const APTOS_HEX_LOWER = '0123456789abcdef';
