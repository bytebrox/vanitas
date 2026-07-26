/**
 * Types for XRPL classic vanity generation (`r…`)
 */

export interface XrpGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  caseSensitive: boolean;
}

export interface GeneratedXrpResult {
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface XrpWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: XrpGeneratorConfig;
  workerId?: number;
}

export interface XrpWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedXrpResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type XrpGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface XrpGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface XrpGeneratorState {
  status: XrpGeneratorStatus;
  config: XrpGeneratorConfig;
  stats: XrpGeneratorStats;
  result: GeneratedXrpResult | null;
  error: string | null;
}

/** XRPL Base58 alphabet (not Bitcoin's) */
export const XRP_BASE58 =
  'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
