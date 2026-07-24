/**
 * Types for Bitcoin vanity generation
 */

export type BtcMode = 'legacy' | 'segwit' | 'taproot';

export interface BtcGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  mode: BtcMode;
  /** Legacy Base58 is case-sensitive; SegWit/Taproot are always lowercase */
  caseSensitive: boolean;
}

export interface GeneratedBtcResult {
  mode: BtcMode;
  address: string;
  privateKeyHex: string;
  privateKeyWif: string;
  privateKeyBytes: Uint8Array;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface BtcWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: BtcGeneratorConfig;
  workerId?: number;
}

export interface BtcWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedBtcResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type BtcGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface BtcGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface BtcGeneratorState {
  status: BtcGeneratorStatus;
  config: BtcGeneratorConfig;
  stats: BtcGeneratorStats;
  result: GeneratedBtcResult | null;
  error: string | null;
}

export const BTC_BASE58 =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const BTC_BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
