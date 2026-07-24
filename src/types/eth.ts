/**
 * Types for ETH / EVM vanity generation
 * Addresses work on Ethereum and all EVM chains (Arbitrum, Robinhood Chain, Base, …)
 */

export type EthMode = 'wallet' | 'contract';

export interface EthGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  mode: EthMode;
}

export interface GeneratedEthResult {
  mode: EthMode;
  /** Vanity target: wallet address or contract address (CREATE, nonce 0) */
  address: string;
  /** Private key hex (0x…) — wallet key, or deployer key for contract mode */
  privateKey: string;
  privateKeyBytes: Uint8Array;
  /** Deployer EOA — only set in contract mode */
  deployerAddress?: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface EthWorkerInboundMessage {
  type: 'start' | 'stop';
  config?: EthGeneratorConfig;
  workerId?: number;
}

export interface EthWorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedEthResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type EthGeneratorStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface EthGeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface EthGeneratorState {
  status: EthGeneratorStatus;
  config: EthGeneratorConfig;
  stats: EthGeneratorStats;
  result: GeneratedEthResult | null;
  error: string | null;
}

/** Hex alphabet for Ethereum addresses (without 0x) */
export const ETH_HEX_ALPHABET = '0123456789abcdefABCDEF';
export const ETH_HEX_LOWER = '0123456789abcdef';
