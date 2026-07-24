/**
 * Validation for Bitcoin vanity patterns
 */

import { BTC_BASE58, BTC_BECH32, type BtcMode } from '@/types/btc';
import type { ValidationResult } from '@/types';

export function validateBtcPrefix(prefix: string, mode: BtcMode): ValidationResult {
  if (!prefix) return { valid: true };
  if (prefix.length > 12) {
    return { valid: false, error: 'Prefix too long. Maximum 12 characters.' };
  }
  if (mode === 'segwit') {
    const p = prefix.toLowerCase();
    const body = p.startsWith('bc1q')
      ? p.slice(4)
      : p.startsWith('bc1')
        ? p.slice(3)
        : p;
    if (body && ![...body].every((c) => BTC_BECH32.includes(c))) {
      return {
        valid: false,
        error: 'Invalid Bech32 character. Allowed: qpzry9x8gf2tvdw0s3jn54khce6mua7l',
      };
    }
    if (p.startsWith('bc') && !p.startsWith('bc1')) {
      return { valid: false, error: 'SegWit prefixes should start with bc1 or bc1q.' };
    }
    return { valid: true };
  }

  if (![...prefix].every((c) => BTC_BASE58.includes(c))) {
    return {
      valid: false,
      error: 'Invalid Base58. No 0, O, I, or l. Legacy addresses typically start with 1.',
    };
  }
  return { valid: true };
}

export function validateBtcSuffix(suffix: string, mode: BtcMode): ValidationResult {
  if (!suffix) return { valid: true };
  if (suffix.length > 10) {
    return { valid: false, error: 'Suffix too long. Maximum 10 characters.' };
  }
  if (mode === 'segwit') {
    const s = suffix.toLowerCase();
    if (![...s].every((c) => BTC_BECH32.includes(c))) {
      return {
        valid: false,
        error: 'Invalid Bech32 character. Allowed: qpzry9x8gf2tvdw0s3jn54khce6mua7l',
      };
    }
    return { valid: true };
  }
  if (![...suffix].every((c) => BTC_BASE58.includes(c))) {
    return {
      valid: false,
      error: 'Invalid Base58. No 0, O, I, or l.',
    };
  }
  return { valid: true };
}

export function estimateBtcDifficulty(
  prefix: string,
  suffix: string,
  mode: BtcMode,
  caseSensitive: boolean
): number {
  const total = prefix.length + suffix.length;
  if (total === 0) return 1;
  if (mode === 'segwit') return Math.pow(32, total);
  return Math.pow(caseSensitive ? 58 : 33, total);
}

export function formatBtcDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateBtcTime(difficulty: number, ratePerSecond: number): string {
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
