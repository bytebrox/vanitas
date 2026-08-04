import type { PatternTarget } from '@/lib/patterns';
/**
 * Types for ETH / EVM vanity generation
 */

export type EthMode = 'wallet' | 'contract' | 'create2-salt' | 'create2-deployer';

export const ETH_HEX_LOWER = '0123456789abcdef';

export interface EthGeneratorConfig {
  prefix: string;
  suffix: string;
  /** OR-targets; falls back to prefix/suffix when empty */
  patterns?: PatternTarget[];
  threads: number;
  mode: EthMode;
  /** CREATE2: 32-byte hex salt (with or without 0x) — required for create2-deployer; ignored when grinding salt */
  create2Salt?: string;
  /** CREATE2: 32-byte keccak of init code */
  create2InitCodeHash?: string;
  /** CREATE2 salt mode: fixed deployer private key hex (generates deployer address) */
  create2DeployerKey?: string;
}

export interface GeneratedEthResult {
  mode: EthMode;
  /** Vanity target: wallet, CREATE contract, or CREATE2 contract */
  address: string;
  /** Private key hex (0x…) — wallet/deployer key (empty string when create2-salt uses fixed deployer) */
  privateKey: string;
  privateKeyBytes: Uint8Array;
  deployerAddress?: string;
  create2Salt?: string;
  create2InitCodeHash?: string;
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
