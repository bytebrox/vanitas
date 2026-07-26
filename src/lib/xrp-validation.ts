/**
 * Validation for XRPL classic vanity patterns (`r…`)
 */

import type { ValidationResult } from '@/types';
import { XRP_BASE58 } from '@/types/xrp';

/** Classic addresses always start with r. Users type "Ace" meaning "rAce…". */
export function normalizeXrpPrefix(prefix: string): string {
  if (!prefix) return '';
  return prefix.startsWith('r') ? prefix : `r${prefix}`;
}

export function xrpPrefixBody(prefix: string): string {
  const norm = normalizeXrpPrefix(prefix);
  return norm.startsWith('r') ? norm.slice(1) : norm;
}

export function xrpVariablePatternLength(prefix: string, suffix: string): number {
  const norm = normalizeXrpPrefix(prefix);
  const prefixLen = norm.startsWith('r') ? Math.max(0, norm.length - 1) : norm.length;
  return prefixLen + suffix.length;
}

export function validateXrpPrefix(prefix: string): ValidationResult {
  if (!prefix) return { valid: true };
  if (prefix.length > 10) {
    return { valid: false, error: 'Prefix too long. Maximum 10 characters.' };
  }
  if (![...prefix].every((c) => XRP_BASE58.includes(c))) {
    return {
      valid: false,
      error:
        'Invalid XRPL Base58. Alphabet: rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz',
    };
  }
  return { valid: true };
}

export function validateXrpSuffix(suffix: string): ValidationResult {
  if (!suffix) return { valid: true };
  if (suffix.length > 10) {
    return { valid: false, error: 'Suffix too long. Maximum 10 characters.' };
  }
  if (![...suffix].every((c) => XRP_BASE58.includes(c))) {
    return {
      valid: false,
      error:
        'Invalid XRPL Base58. Alphabet: rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz',
    };
  }
  return { valid: true };
}

export function estimateXrpDifficulty(
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): number {
  const total = xrpVariablePatternLength(prefix, suffix);
  if (total === 0) return 1;
  return Math.pow(caseSensitive ? 58 : 33, total);
}

export function formatXrpDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateXrpTime(difficulty: number, ratePerSecond: number): string {
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

export function xrpMatches(
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): boolean {
  if (!prefix && !suffix) return true;
  let p = prefix || '';
  if (p && !p.startsWith('r')) p = `r${p}`;
  const s = suffix || '';
  if (caseSensitive) {
    return (!p || address.startsWith(p)) && (!s || address.endsWith(s));
  }
  const addr = address.toLowerCase();
  return (
    (!p || addr.startsWith(p.toLowerCase())) &&
    (!s || addr.endsWith(s.toLowerCase()))
  );
}
