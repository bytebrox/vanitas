import type { PatternTarget } from '@/lib/patterns';
/**
 * Types for Tron vanity generation
 */

export type TronMode = 'wallet' | 'contract';

export interface TronGeneratorConfig {
  prefix: string;
  suffix: string;
  /** OR-targets; falls back to prefix/suffix when empty */
  patterns?: PatternTarget[];
  threads: number;
  caseSensitive: boolean;
  mode: TronMode;
}

export interface GeneratedTronResult {
  mode: TronMode;
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  /** Wallet that deploys the contract (CREATE nonce 0) */
  deployerAddress?: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface TronWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: TronGeneratorConfig;
  workerId?: number;
}

export interface TronWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedTronResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type TronGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface TronGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface TronGeneratorState {
  status: TronGeneratorStatus;
  config: TronGeneratorConfig;
  stats: TronGeneratorStats;
  result: GeneratedTronResult | null;
  error: string | null;
}

export const TRON_BASE58 =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
