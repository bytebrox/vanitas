/**
 * Validation for Tron Base58 vanity patterns
 */

import { TRON_BASE58 } from '@/types/tron';
import type { ValidationResult } from '@/types';

export function validateTronPrefix(prefix: string): ValidationResult {
  if (!prefix) return { valid: true };
  if (prefix.length > 10) {
    return { valid: false, error: 'Prefix too long. Maximum 10 characters.' };
  }
  if (![...prefix].every((c) => TRON_BASE58.includes(c))) {
    return {
      valid: false,
      error: 'Invalid Base58. No 0, O, I, or l. Tron addresses start with T.',
    };
  }
  return { valid: true };
}

export function validateTronSuffix(suffix: string): ValidationResult {
  if (!suffix) return { valid: true };
  if (suffix.length > 10) {
    return { valid: false, error: 'Suffix too long. Maximum 10 characters.' };
  }
  if (![...suffix].every((c) => TRON_BASE58.includes(c))) {
    return {
      valid: false,
      error: 'Invalid Base58. No 0, O, I, or l.',
    };
  }
  return { valid: true };
}

export function estimateTronDifficulty(
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): number {
  const total = prefix.length + suffix.length;
  if (total === 0) return 1;
  return Math.pow(caseSensitive ? 58 : 33, total);
}

export function formatTronDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateTronTime(difficulty: number, ratePerSecond: number): string {
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
