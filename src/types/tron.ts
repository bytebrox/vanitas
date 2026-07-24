/**
 * Types for Tron vanity generation
 */

export interface TronGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  caseSensitive: boolean;
}

export interface GeneratedTronResult {
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
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
