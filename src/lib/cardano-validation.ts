/**
 * Validation for Cardano Bech32 vanity patterns (body after addr1)
 */

import type { ValidationResult } from '@/types';
import { CARDANO_BECH32 } from '@/types/cardano';

/**
 * CIP-19 type-6 mainnet header 0x61 → Bech32 body always starts with `v`,
 * and the next symbol is only one of y/9/x/8 (remaining header bits).
 */
export const CARDANO_ENTERPRISE_FIXED = 'v';
export const CARDANO_ENTERPRISE_SECOND = 'y9x8';

export function stripCardanoHrp(value: string): string {
  const v = (value || '').trim().toLowerCase();
  if (v.startsWith('addr1')) return v.slice(5);
  return v;
}

/**
 * Normalize a user prefix to the full Bech32 body prefix after `addr1`.
 * Enterprise addresses always start with `v`; UI usually omits it (`addr1v` + input).
 */
export function cardanoEffectivePrefix(prefix: string): string {
  const body = stripCardanoHrp(prefix);
  if (!body) return '';
  if (body.startsWith(CARDANO_ENTERPRISE_FIXED)) return body;
  return CARDANO_ENTERPRISE_FIXED + body;
}

/** Strip fixed enterprise `v` for the input field (shown after `addr1v`). */
export function cardanoUserPrefix(prefix: string): string {
  const body = stripCardanoHrp(prefix);
  if (body.startsWith(CARDANO_ENTERPRISE_FIXED)) return body.slice(1);
  return body;
}

export function isValidCardanoBech32(str: string): boolean {
  return [...str.toLowerCase()].every((c) => CARDANO_BECH32.includes(c));
}

export function validateCardanoPrefix(prefix: string): ValidationResult {
  if (!prefix) return { valid: true };
  const body = cardanoUserPrefix(prefix);
  if (body.length > 8) {
    return {
      valid: false,
      error: 'Prefix too long. Maximum 8 characters after addr1v.',
    };
  }
  if (!isValidCardanoBech32(body)) {
    return {
      valid: false,
      error: 'Invalid Bech32. Use qpzry9x8gf2tvdw0s3jn54khce6mua7l only.',
    };
  }
  if (body.length >= 1 && !CARDANO_ENTERPRISE_SECOND.includes(body[0]!)) {
    return {
      valid: false,
      error: 'After addr1v the next character must be y, 9, x, or 8 (fixed address header).',
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
  const p = cardanoUserPrefix(prefix);
  const s = stripCardanoHrp(suffix);
  if (!p && !s) return 1;
  let difficulty = 1;
  if (p.length >= 1) {
    // First char after `v` has only 4 possibilities
    difficulty *= 4;
    if (p.length > 1) difficulty *= Math.pow(32, p.length - 1);
  }
  if (s.length > 0) difficulty *= Math.pow(32, s.length);
  return difficulty;
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
  return cardanoUserPrefix(value);
}

export function cardanoMatches(
  address: string,
  prefix: string,
  suffix: string
): boolean {
  if (!prefix && !suffix) return true;
  const addr = address.toLowerCase();
  const body = addr.startsWith('addr1') ? addr.slice(5) : addr;
  const p = cardanoEffectivePrefix(prefix);
  const s = stripCardanoHrp(suffix);
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}
