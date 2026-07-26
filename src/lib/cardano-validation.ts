/**
 * Validation for Cardano Bech32 vanity patterns (body after addr1)
 */

import type { ValidationResult } from '@/types';
import { CARDANO_BECH32 } from '@/types/cardano';

export function stripCardanoHrp(value: string): string {
  const v = (value || '').trim().toLowerCase();
  if (v.startsWith('addr1')) return v.slice(5);
  return v;
}

export function isValidCardanoBech32(str: string): boolean {
  return [...str.toLowerCase()].every((c) => CARDANO_BECH32.includes(c));
}

export function validateCardanoPrefix(prefix: string): ValidationResult {
  if (!prefix) return { valid: true };
  const body = stripCardanoHrp(prefix);
  if (body.length > 8) {
    return {
      valid: false,
      error: 'Prefix too long. Maximum 8 characters after addr1.',
    };
  }
  if (!isValidCardanoBech32(body)) {
    return {
      valid: false,
      error: 'Invalid Bech32. Use qpzry9x8gf2tvdw0s3jn54khce6mua7l only.',
    };
  }
  return { valid: true };
}

export function validateCardanoSuffix(suffix: string): ValidationResult {
  if (!suffix) return { valid: true };
  const body = stripCardanoHrp(suffix);
  if (body.length > 8) {
    return { valid: false, error: 'Suffix too long. Maximum 8 characters.' };
  }
  if (!isValidCardanoBech32(body)) {
    return {
      valid: false,
      error: 'Invalid Bech32. Use qpzry9x8gf2tvdw0s3jn54khce6mua7l only.',
    };
  }
  return { valid: true };
}

export function estimateCardanoDifficulty(prefix: string, suffix: string): number {
  const p = stripCardanoHrp(prefix);
  const s = stripCardanoHrp(suffix);
  const total = p.length + s.length;
  if (total === 0) return 1;
  return Math.pow(32, total);
}

export function formatCardanoDifficulty(difficulty: number): string {
  if (difficulty < 1000) return `~${difficulty} attempts`;
  if (difficulty < 1_000_000) return `~${(difficulty / 1000).toFixed(1)}K attempts`;
  if (difficulty < 1_000_000_000) return `~${(difficulty / 1_000_000).toFixed(1)}M attempts`;
  if (difficulty < 1_000_000_000_000) return `~${(difficulty / 1_000_000_000).toFixed(1)}B attempts`;
  return `~${(difficulty / 1_000_000_000_000).toFixed(1)}T attempts`;
}

export function estimateCardanoTime(difficulty: number, ratePerSecond: number): string {
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

export function normalizeCardanoPattern(value: string): string {
  return stripCardanoHrp(value);
}

export function cardanoMatches(
  address: string,
  prefix: string,
  suffix: string
): boolean {
  if (!prefix && !suffix) return true;
  const addr = address.toLowerCase();
  const body = addr.startsWith('addr1') ? addr.slice(5) : addr;
  const p = stripCardanoHrp(prefix);
  const s = stripCardanoHrp(suffix);
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}
