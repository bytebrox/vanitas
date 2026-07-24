/**
 * Validation for Bitcoin vanity patterns
 */

import { BTC_BASE58, BTC_BECH32, type BtcMode } from '@/types/btc';
import type { ValidationResult } from '@/types';

/**
 * Legacy P2PKH always starts with "1". Users type "BTC" meaning "1BTC…".
 * SegWit P2WPKH always starts with "bc1q". Taproot with "bc1p".
 */
export function normalizeBtcPrefix(prefix: string, mode: BtcMode): string {
  if (!prefix) return '';
  if (mode === 'segwit' || mode === 'taproot') {
    const p = prefix.toLowerCase();
    const hrp = mode === 'taproot' ? 'bc1p' : 'bc1q';
    if (p.startsWith(hrp)) return p;
    if (p.startsWith('bc1')) return p;
    return `${hrp}${p}`;
  }
  return prefix.startsWith('1') ? prefix : `1${prefix}`;
}

/** Body after fixed leading 1 (legacy). */
export function btcLegacyPrefixBody(prefix: string): string {
  const norm = normalizeBtcPrefix(prefix, 'legacy');
  return norm.startsWith('1') ? norm.slice(1) : norm;
}

/**
 * Version byte 0x00 makes the character right after "1" almost never lowercase.
 */
export function isBtcLegacyCaseSensitivePrefixUnrealistic(
  prefix: string,
  caseSensitive: boolean
): boolean {
  if (!caseSensitive || !prefix) return false;
  const body = btcLegacyPrefixBody(prefix);
  return Boolean(body && /[a-z]/.test(body[0]));
}

/** Characters the user actually searches for (excludes fixed HRP / version digit). */
export function btcVariablePatternLength(
  prefix: string,
  suffix: string,
  mode: BtcMode
): number {
  const norm = normalizeBtcPrefix(prefix, mode);
  let prefixLen = 0;
  if (norm) {
    if (mode === 'segwit' || mode === 'taproot') {
      const hrp = mode === 'taproot' ? 'bc1p' : 'bc1q';
      prefixLen = norm.startsWith(hrp)
        ? Math.max(0, norm.length - 4)
        : norm.startsWith('bc1')
          ? Math.max(0, norm.length - 3)
          : norm.length;
    } else {
      prefixLen = norm.startsWith('1') ? Math.max(0, norm.length - 1) : norm.length;
    }
  }
  return prefixLen + suffix.length;
}

export function validateBtcPrefix(
  prefix: string,
  mode: BtcMode,
  caseSensitive = false
): ValidationResult {
  if (!prefix) return { valid: true };
  if (prefix.length > 12) {
    return { valid: false, error: 'Prefix too long. Maximum 12 characters.' };
  }
  if (mode === 'segwit' || mode === 'taproot') {
    const p = prefix.toLowerCase();
    const hrp = mode === 'taproot' ? 'bc1p' : 'bc1q';
    const body = p.startsWith(hrp)
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
      return {
        valid: false,
        error:
          mode === 'taproot'
            ? 'Taproot prefixes should start with bc1p.'
            : 'SegWit prefixes should start with bc1 or bc1q.',
      };
    }
    return { valid: true };
  }

  if (![...prefix].every((c) => BTC_BASE58.includes(c))) {
    return {
      valid: false,
      error: 'Invalid Base58. No 0, O, I, or l. Legacy addresses typically start with 1.',
    };
  }
  if (isBtcLegacyCaseSensitivePrefixUnrealistic(prefix, caseSensitive)) {
    return {
      valid: false,
      error:
        'With Case sensitive on, the first letter after 1 must be uppercase (or a digit). Lowercase there almost never occurs — turn Case sensitive off.',
    };
  }
  return { valid: true };
}

export function validateBtcSuffix(suffix: string, mode: BtcMode): ValidationResult {
  if (!suffix) return { valid: true };
  if (suffix.length > 10) {
    return { valid: false, error: 'Suffix too long. Maximum 10 characters.' };
  }
  if (mode === 'segwit' || mode === 'taproot') {
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
  if (mode === 'legacy' && isBtcLegacyCaseSensitivePrefixUnrealistic(prefix, caseSensitive)) {
    return Number.POSITIVE_INFINITY;
  }
  const total = btcVariablePatternLength(prefix, suffix, mode);
  if (total === 0) return 1;
  if (mode === 'segwit' || mode === 'taproot') return Math.pow(32, total);
  return Math.pow(caseSensitive ? 58 : 33, total);
}

export function formatBtcDifficulty(difficulty: number): string {
  if (!Number.isFinite(difficulty)) return 'effectively impossible';
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateBtcTime(difficulty: number, ratePerSecond: number): string {
  if (!Number.isFinite(difficulty)) return '—';
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
