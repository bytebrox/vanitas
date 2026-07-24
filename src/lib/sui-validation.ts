/**
 * Validation for Sui hex vanity patterns
 */

import type { ValidationResult } from '@/types';

export function isValidSuiHex(str: string): boolean {
  return /^[0-9a-fA-F]*$/.test(str);
}

export function validateSuiPrefix(prefix: string): ValidationResult {
  if (!prefix) return { valid: true };

  if (prefix.length > 8) {
    return {
      valid: false,
      error: 'Prefix too long. Maximum 8 hex characters (longer = exponentially slower).',
    };
  }

  if (!isValidSuiHex(prefix)) {
    return {
      valid: false,
      error: 'Invalid hex. Use 0-9 and a-f only (no 0x prefix).',
    };
  }

  return { valid: true };
}

export function validateSuiSuffix(suffix: string): ValidationResult {
  if (!suffix) return { valid: true };

  if (suffix.length > 8) {
    return {
      valid: false,
      error: 'Suffix too long. Maximum 8 hex characters.',
    };
  }

  if (!isValidSuiHex(suffix)) {
    return {
      valid: false,
      error: 'Invalid hex. Use 0-9 and a-f only (no 0x prefix).',
    };
  }

  return { valid: true };
}

/**
 * Hex has 16 symbols. Matching is case-insensitive on the address body after 0x.
 */
export function estimateSuiDifficulty(prefix: string, suffix: string): number {
  const total = prefix.length + suffix.length;
  if (total === 0) return 1;
  return Math.pow(16, total);
}

export function formatSuiDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateSuiTime(difficulty: number, ratePerSecond: number): string {
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

export function normalizeSuiPattern(value: string): string {
  return value.replace(/^0x/i, '').toLowerCase();
}
