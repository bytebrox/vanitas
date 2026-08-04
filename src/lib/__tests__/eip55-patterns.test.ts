/**
 * EIP-55 + pattern-match unit tests
 */

import { describe, expect, it } from 'vitest';
import {
  scoreChecksumVanity,
  suggestPatternCasings,
  toChecksumAddress,
} from '@/lib/eip55';
import { combineOrDifficulty, normalizePatterns } from '@/lib/patterns';
import { matchAny } from '@/lib/pattern-match';

describe('eip55', () => {
  it('checksums the EIP-55 reference vector', () => {
    // EIP-55 example from the spec
    expect(toChecksumAddress('0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed')).toBe(
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
    );
  });

  it('is idempotent on already-checksummed input', () => {
    const mixed = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
    expect(toChecksumAddress(mixed)).toBe(mixed);
  });

  it('scores vanity letter uppercase share', () => {
    const checksummed = toChecksumAddress('0xdead00000000000000000000000000000000beef');
    const { letters, upper, score } = scoreChecksumVanity(checksummed, 'dead', 'beef');
    expect(letters).toBeGreaterThan(0);
    expect(upper).toBeGreaterThanOrEqual(0);
    expect(upper).toBeLessThanOrEqual(letters);
    expect(score).toBeCloseTo(upper / letters);
  });

  it('suggests distinct aesthetic casings', () => {
    const casings = suggestPatternCasings('dead');
    expect(casings).toContain('dead');
    expect(casings).toContain('DEAD');
    expect(new Set(casings).size).toBe(casings.length);
  });
});

describe('pattern-match OR', () => {
  it('normalizes legacy prefix/suffix into one target', () => {
    expect(normalizePatterns({ prefix: 'Ace', suffix: '' })).toEqual([
      { prefix: 'Ace', suffix: '' },
    ]);
  });

  it('keeps scalar prefix/suffix as target 0 over a stale patterns[0]', () => {
    expect(
      normalizePatterns({
        prefix: 'Ace',
        suffix: 'zz',
        patterns: [
          { prefix: 'OLD', suffix: 'xx' },
          { prefix: 'Bee', suffix: '' },
        ],
      })
    ).toEqual([
      { prefix: 'Ace', suffix: 'zz' },
      { prefix: 'Bee', suffix: '' },
    ]);
  });

  it('matches the first OR target that fits', () => {
    const hit = matchAny(
      'AceXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXzzz',
      [
        { prefix: 'Nope', suffix: '' },
        { prefix: 'Ace', suffix: 'zzz' },
      ],
      { caseSensitive: true }
    );
    expect(hit?.matched).toEqual({ prefix: 'Ace', suffix: 'zzz' });
    expect(hit?.matchedPattern).toBe('Ace...zzz');
  });

  it('returns null when nothing matches', () => {
    expect(
      matchAny('zzzz', [{ prefix: 'Ace', suffix: '' }, { prefix: 'Bee', suffix: '' }], {
        caseSensitive: false,
      })
    ).toBeNull();
  });

  it('combines OR difficulties as harmonic mean of rates', () => {
    // 1/Σ(1/d) for 100 and 100 → 50
    expect(combineOrDifficulty([100, 100])).toBe(50);
    expect(combineOrDifficulty([100])).toBe(100);
  });
});
