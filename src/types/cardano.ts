/**
 * Types for Cardano vanity generation (enterprise addr1…)
 */

export interface CardanoGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
}

export interface GeneratedCardanoResult {
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface CardanoWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: CardanoGeneratorConfig;
  workerId?: number;
}

export interface CardanoWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedCardanoResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type CardanoGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface CardanoGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface CardanoGeneratorState {
  status: CardanoGeneratorStatus;
  config: CardanoGeneratorConfig;
  stats: CardanoGeneratorStats;
  result: GeneratedCardanoResult | null;
  error: string | null;
}

/** Bech32 data alphabet (CIP-19 / BIP-173) */
export const CARDANO_BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
