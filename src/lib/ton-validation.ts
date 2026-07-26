/**
 * Validation for TON user-friendly vanity patterns (UQ… / EQ…)
 */

import type { ValidationResult } from '@/types';
import { TON_BASE64URL, type TonMode } from '@/types/ton';

export function isValidTonBase64Url(str: string): boolean {
  return [...str].every((c) => TON_BASE64URL.includes(c));
}

export function tonAddressTag(mode: TonMode): 'UQ' | 'EQ' {
  return mode === 'bounceable' ? 'EQ' : 'UQ';
}

/**
 * Full address prefix used for matching. Wallet v4R2 user-friendly addresses
 * always start with UQ (non-bounceable) or EQ (bounceable).
 */
export function tonEffectivePrefix(prefix: string, mode: TonMode): string {
  if (!prefix) return '';
  if (prefix.startsWith('UQ') || prefix.startsWith('EQ')) return prefix;
  return tonAddressTag(mode) + prefix;
}

/** Part after the fixed UQ/EQ tag for the input field. */
export function tonUserPrefix(prefix: string, mode: TonMode): string {
  if (!prefix) return '';
  const tag = tonAddressTag(mode);
  if (prefix.startsWith(tag)) return prefix.slice(tag.length);
  if (prefix.startsWith('UQ') || prefix.startsWith('EQ')) return prefix.slice(2);
  return prefix;
}

export function validateTonPrefix(prefix: string): ValidationResult {
  if (!prefix) return { valid: true };
  const body = prefix.startsWith('UQ') || prefix.startsWith('EQ') ? prefix.slice(2) : prefix;
  if (body.length > 8) {
    return {
      valid: false,
      error: 'Prefix too long. Maximum 8 characters after UQ/EQ (case-sensitive).',
    };
  }
  if (!isValidTonBase64Url(body)) {
    return {
      valid: false,
      error: 'Invalid characters. Use A-Z a-z 0-9 - _ (base64url).',
    };
  }
  return { valid: true };
}

export function validateTonSuffix(suffix: string): ValidationResult {
  if (!suffix) return { valid: true };
  if (suffix.length > 8) {
    return { valid: false, error: 'Suffix too long. Maximum 8 characters.' };
  }
  if (!isValidTonBase64Url(suffix)) {
    return {
      valid: false,
      error: 'Invalid characters. Use A-Z a-z 0-9 - _ (base64url).',
    };
  }
  return { valid: true };
}

/** ~64 symbols; case-sensitive. Counts only variable chars (not fixed UQ/EQ). */
export function estimateTonDifficulty(prefix: string, suffix: string, mode: TonMode = 'non-bounceable'): number {
  const p = tonUserPrefix(prefix, mode);
  const total = p.length + suffix.length;
  if (total === 0) return 1;
  return Math.pow(64, total);
}

export function formatTonDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateTonTime(difficulty: number, ratePerSecond: number): string {
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

export function tonMatches(
  address: string,
  prefix: string,
  suffix: string,
  mode: TonMode = 'non-bounceable'
): boolean {
  if (!prefix && !suffix) return true;
  const p = tonEffectivePrefix(prefix, mode);
  return (
    (!p || address.startsWith(p)) &&
    (!suffix || address.endsWith(suffix))
  );
}

export function tonPatternHint(mode: TonMode): string {
  return mode === 'bounceable'
    ? 'Pattern matches the bounceable EQ… address (Wallet v4R2).'
    : 'Pattern matches the non-bounceable UQ… wallet address (Wallet v4R2).';
}
