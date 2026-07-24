/**
 * Validation for Ethereum hex vanity patterns
 */

import { ETH_HEX_LOWER, type EthMode } from '@/types/eth';
import type { ValidationResult } from '@/types';

export function isValidEthHex(str: string): boolean {
  return /^[0-9a-fA-F]*$/.test(str);
}

export function validateEthPrefix(prefix: string): ValidationResult {
  if (!prefix) return { valid: true };

  if (prefix.length > 8) {
    return {
      valid: false,
      error: 'Prefix too long. Maximum 8 hex characters (longer = exponentially slower).',
    };
  }

  if (!isValidEthHex(prefix)) {
    return {
      valid: false,
      error: 'Invalid hex. Use 0-9 and a-f only (no 0x prefix).',
    };
  }

  return { valid: true };
}

export function validateEthSuffix(suffix: string): ValidationResult {
  if (!suffix) return { valid: true };

  if (suffix.length > 8) {
    return {
      valid: false,
      error: 'Suffix too long. Maximum 8 hex characters.',
    };
  }

  if (!isValidEthHex(suffix)) {
    return {
      valid: false,
      error: 'Invalid hex. Use 0-9 and a-f only (no 0x prefix).',
    };
  }

  return { valid: true };
}

/**
 * Hex has 16 symbols. Matching is case-insensitive (addresses are lowercase).
 */
export function estimateEthDifficulty(prefix: string, suffix: string): number {
  const total = prefix.length + suffix.length;
  if (total === 0) return 1;
  return Math.pow(16, total);
}

export function formatEthDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateEthTime(difficulty: number, ratePerSecond: number): string {
  if (ratePerSecond === 0) return 'Unknown';

  const seconds = difficulty / ratePerSecond;

  if (seconds < 1) return '< 1 second';
  if (seconds < 60) return `~${Math.ceil(seconds)} seconds`;
  if (seconds < 3600) return `~${Math.ceil(seconds / 60)} minutes`;
  if (seconds < 86400) return `~${Math.ceil(seconds / 3600)} hours`;
  if (seconds < 2592000) return `~${Math.ceil(seconds / 86400)} days`;
  if (seconds < 31536000) return `~${Math.ceil(seconds / 2592000)} months`;
  return `~${Math.ceil(seconds / 31536000)} years`;
}

export function normalizeEthPattern(value: string): string {
  return value.replace(/^0x/i, '').toLowerCase();
}

export function ethPatternHint(mode: EthMode): string {
  return mode === 'contract'
    ? 'Pattern matches the contract address created by the deployer at nonce 0 (first deploy).'
    : 'Pattern matches the wallet address (0x + 40 hex). Same address on every EVM chain.';
}

/** Strip to lowercase hex body for validation helpers */
export function ethHexBody(address: string): string {
  return address.replace(/^0x/i, '').toLowerCase();
}

export { ETH_HEX_LOWER };
