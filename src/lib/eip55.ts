/**
 * EIP-55 checksum helpers for EVM addresses.
 * Grind matches hex case-insensitively; checksum is a post-find display concern.
 */

import { keccak_256 } from '@noble/hashes/sha3.js';

function strip0x(hex: string): string {
  return hex.replace(/^0x/i, '');
}

/** EIP-55 mixed-case checksum of a 20-byte hex address. */
export function toChecksumAddress(address: string): string {
  const body = strip0x(address).toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(body)) {
    throw new Error('Invalid EVM address for EIP-55');
  }
  const hash = keccak_256(new TextEncoder().encode(body));
  let out = '0x';
  for (let i = 0; i < 40; i++) {
    const nibble = hash[i >> 1]!;
    const n = i % 2 === 0 ? nibble >> 4 : nibble & 0xf;
    const ch = body[i]!;
    out += n >= 8 ? ch.toUpperCase() : ch;
  }
  return out;
}

export function tryChecksumAddress(address: string): string | null {
  try {
    return toChecksumAddress(address);
  } catch {
    return null;
  }
}

/**
 * Fraction of vanity hex letters that landed uppercase in the EIP-55 form.
 * Digits never contribute (they have no case). Returns 0–1, or 0 if no letters.
 */
export function scoreChecksumVanity(
  checksummed: string,
  prefix: string,
  suffix: string
): { score: number; upper: number; letters: number } {
  const body = strip0x(checksummed);
  const p = strip0x(prefix).toLowerCase();
  const s = strip0x(suffix).toLowerCase();

  let upper = 0;
  let letters = 0;

  const scoreRegion = (start: number, raw: string) => {
    for (let i = 0; i < raw.length; i++) {
      const ch = body[start + i];
      if (!ch || !/[a-f]/i.test(ch)) continue;
      letters += 1;
      if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) upper += 1;
    }
  };

  if (p) scoreRegion(0, p);
  if (s) scoreRegion(Math.max(0, 40 - s.length), s);

  return {
    score: letters === 0 ? 0 : upper / letters,
    upper,
    letters,
  };
}

/** Aesthetic display casings for a hex pattern — grind difficulty is unchanged. */
export function suggestPatternCasings(hex: string): string[] {
  const raw = strip0x(hex).toLowerCase();
  if (!raw || !/^[0-9a-f]+$/.test(raw)) return [];

  const upper = raw.toUpperCase();
  const capitalize = raw.replace(/[a-f]/, (c) => c.toUpperCase());
  const alternating = raw
    .split('')
    .map((c, i) => (/[a-f]/.test(c) && i % 2 === 0 ? c.toUpperCase() : c))
    .join('');

  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of [raw, upper, capitalize, alternating]) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}
