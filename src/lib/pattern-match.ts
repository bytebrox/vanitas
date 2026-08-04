/**
 * OR-match an address against several prefix/suffix targets.
 */

import {
  formatMatchedPattern,
  normalizePatterns,
  type PatternTarget,
} from '@/lib/patterns';

export interface MatchOptions {
  /** Compare with original case (Base58 chains). Default false. */
  caseSensitive?: boolean;
  /** Strip leading 0x before comparing (EVM / Aptos / Sui). */
  strip0x?: boolean;
  /** Cardano: strip addr1 before comparing body. */
  stripAddr1?: boolean;
}

function prepare(value: string, opts: MatchOptions): string {
  let v = value || '';
  if (opts.strip0x) v = v.replace(/^0x/i, '');
  if (opts.stripAddr1) {
    const lower = v.toLowerCase();
    if (lower.startsWith('addr1')) v = v.slice(5);
  }
  return opts.caseSensitive ? v : v.toLowerCase();
}

export function matchTarget(
  address: string,
  target: PatternTarget,
  opts: MatchOptions = {}
): boolean {
  const addr = prepare(address, opts);
  const prefix = prepare(target.prefix, opts);
  const suffix = prepare(target.suffix, opts);
  if (!prefix && !suffix) return true;
  return (!prefix || addr.startsWith(prefix)) && (!suffix || addr.endsWith(suffix));
}

export function matchAny(
  address: string,
  patterns: PatternTarget[] | { patterns?: PatternTarget[]; prefix?: string; suffix?: string },
  opts: MatchOptions = {}
): { matched: PatternTarget; matchedPattern: string } | null {
  const list = normalizePatterns(patterns);
  if (list.length === 0) {
    return { matched: { prefix: '', suffix: '' }, matchedPattern: '...' };
  }
  for (const target of list) {
    if (matchTarget(address, target, opts)) {
      return { matched: target, matchedPattern: formatMatchedPattern(target) };
    }
  }
  return null;
}
