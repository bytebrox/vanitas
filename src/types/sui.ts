/**
 * Types for Sui vanity generation (Ed25519)
 */

export interface SuiGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
}

export interface GeneratedSuiResult {
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface SuiWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: SuiGeneratorConfig;
  workerId?: number;
}

export interface SuiWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedSuiResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type SuiGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface SuiGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface SuiGeneratorState {
  status: SuiGeneratorStatus;
  config: SuiGeneratorConfig;
  stats: SuiGeneratorStats;
  result: GeneratedSuiResult | null;
  error: string | null;
}

/** Hex alphabet for Sui addresses (case-insensitive matching) */
export const SUI_HEX_LOWER = '0123456789abcdef';
