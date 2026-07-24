/**
 * Validation for Tron Base58 vanity patterns
 */

import { TRON_BASE58 } from '@/types/tron';
import type { ValidationResult } from '@/types';

/** Tron mainnet addresses always start with T. Users type "Ace" meaning "TAce…". */
export function normalizeTronPrefix(prefix: string): string {
  if (!prefix) return '';
  return prefix.startsWith('T') ? prefix : `T${prefix}`;
}

/** Body after the fixed leading T. */
export function tronPrefixBody(prefix: string): string {
  const norm = normalizeTronPrefix(prefix);
  return norm.startsWith('T') ? norm.slice(1) : norm;
}

/**
 * Version byte 0x41 makes the character right after T almost always uppercase
 * (or occasionally a digit) — never a lowercase letter in practice.
 */
export function isTronCaseSensitivePrefixUnrealistic(
  prefix: string,
  caseSensitive: boolean
): boolean {
  if (!caseSensitive || !prefix) return false;
  const body = tronPrefixBody(prefix);
  return Boolean(body && /[a-z]/.test(body[0]));
}

export function tronVariablePatternLength(prefix: string, suffix: string): number {
  const norm = normalizeTronPrefix(prefix);
  const prefixLen = norm.startsWith('T') ? Math.max(0, norm.length - 1) : norm.length;
  return prefixLen + suffix.length;
}

export function validateTronPrefix(
  prefix: string,
  caseSensitive = false
): ValidationResult {
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
  if (isTronCaseSensitivePrefixUnrealistic(prefix, caseSensitive)) {
    return {
      valid: false,
      error:
        'With Case sensitive on, the first letter after T must be uppercase (A–H, J–N, P–Z) or a digit. Lowercase there almost never occurs — turn Case sensitive off.',
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
  if (isTronCaseSensitivePrefixUnrealistic(prefix, caseSensitive)) {
    return Number.POSITIVE_INFINITY;
  }
  const total = tronVariablePatternLength(prefix, suffix);
  if (total === 0) return 1;
  return Math.pow(caseSensitive ? 58 : 33, total);
}

export function formatTronDifficulty(difficulty: number): string {
  if (!Number.isFinite(difficulty)) return 'effectively impossible';
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateTronTime(difficulty: number, ratePerSecond: number): string {
  if (!Number.isFinite(difficulty)) return '—';
  if (ratePerSecond === 0) return 'Unknown';
  const seconds = difficulty / ratePerSecond;
  if (seconds < 1) return '< 1 second';
  if (seconds < 60) return `~${Math.ceil(seconds)} seconds`;
  if (seconds < 3600) return `~${Math.ceil(seconds / 60)} minutes`;
  if (seconds < 86400) return `~${Math.ceil(seconds / 3600)} hours`;
  if (seconds < 2592000) return `~${Math.ceil(seconds / 86400)} days`;
  if (seconds < 31536000) return `~${Math.ceil(seconds / 2592000)} months`;
  return `~${(seconds / 31536000).toFixed(0)} years`;
}
