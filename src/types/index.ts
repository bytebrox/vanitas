/**
 * Core types for Vanitas
 * Solana vanity address generator
 */

// Generator configuration
export interface GeneratorConfig {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  threads: number;
}

// Generated keypair result
export interface GeneratedKeypair {
  publicKey: string;
  privateKey: string;
  secretKey: Uint8Array;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

// Worker message types
export type WorkerMessageType = 
  | 'start'
  | 'stop'
  | 'found'
  | 'progress'
  | 'error';

// Message from main thread to worker
export interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: GeneratorConfig;
  workerId?: number;
}

// Message from worker to main thread
export interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedKeypair;
  attempts?: number;
  rate?: number;
  error?: string;
}

// Generator state
export type GeneratorStatus = 
  | 'idle'
  | 'running'
  | 'found'
  | 'stopped'
  | 'error';

// Statistics
export interface GeneratorStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

// UI State
export interface GeneratorState {
  status: GeneratorStatus;
  config: GeneratorConfig;
  stats: GeneratorStats;
  result: GeneratedKeypair | null;
  error: string | null;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Base58 alphabet for Solana addresses
export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Characters NOT in Base58 and cannot be case-converted (for user feedback)
// Note: 'l' is excluded because it can be converted to 'L' for case-insensitive matching
export const INVALID_BASE58_CHARS = ['0', 'O', 'I'];
