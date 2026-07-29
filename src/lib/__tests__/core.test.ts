import { describe, expect, it } from 'vitest';
import { validatePrefix, validateSuffix, isValidBase58 } from '@/lib/validation';
import {
  analyzeLookalike,
  hasBlockingLookalikeErrors,
} from '@/lib/lookalike';
import {
  buildProofUrl,
  parseProofSearchParams,
  splitMatchedPattern,
  verifyProofMatch,
} from '@/lib/proof-of-find';
import {
  normalizeHex,
  hashInitCode,
  computeCreate2Address,
} from '@/lib/create2-helper';
import { resolvePostFindProfile } from '@/lib/post-find';

describe('validation (sol base58)', () => {
  it('accepts empty prefix', () => {
    expect(validatePrefix('').valid).toBe(true);
  });

  it('rejects 0/O/I in base58', () => {
    expect(validatePrefix('0ab', true).valid).toBe(false);
    expect(validatePrefix('Oab', true).valid).toBe(false);
  });

  it('accepts short valid prefix', () => {
    expect(validatePrefix('Ace', true).valid).toBe(true);
    expect(isValidBase58('Ace')).toBe(true);
  });

  it('rejects overlong prefix', () => {
    expect(validatePrefix('abcdefghij', true).valid).toBe(false);
  });

  it('validates suffix similarly', () => {
    expect(validateSuffix('dead', true).valid).toBe(true);
  });
});

describe('lookalike', () => {
  it('flags invalid base58 glyphs as errors on sol', () => {
    const findings = analyzeLookalike('0Ace', 'sol');
    expect(findings.some((f) => f.severity === 'error')).toBe(true);
  });

  it('blocks forge when prefix has lookalike errors', () => {
    expect(hasBlockingLookalikeErrors('sol', '0Ace', '')).toBe(true);
    expect(hasBlockingLookalikeErrors('sol', 'Ace', '')).toBe(false);
  });

  it('allows clean hex on evm', () => {
    expect(hasBlockingLookalikeErrors('evm', 'cafe', 'dead')).toBe(false);
  });
});

describe('proof-of-find', () => {
  it('builds and parses proof URLs', () => {
    const url = buildProofUrl('https://www.vanitas.fun', {
      chain: 'sol',
      address: 'Ace111111111111111111111111111111111111111',
      prefix: 'Ace',
    });
    expect(url).toContain('/proof?');
    const sp = new URL(url).searchParams;
    const parsed = parseProofSearchParams(sp);
    expect(parsed?.chain).toBe('sol');
    expect(parsed?.prefix).toBe('Ace');
  });

  it('splits matched patterns', () => {
    expect(splitMatchedPattern('cafe...dead')).toEqual({
      prefix: 'cafe',
      suffix: 'dead',
    });
    expect(splitMatchedPattern('only')).toEqual({ prefix: 'only', suffix: '' });
  });

  it('verifies evm prefix match', () => {
    const r = verifyProofMatch({
      chain: 'evm',
      address: '0xcafe1234567890abcdef1234567890abcdef1234',
      prefix: 'cafe',
    });
    expect(r.ok).toBe(true);
  });

  it('fails closed on mismatch', () => {
    const r = verifyProofMatch({
      chain: 'evm',
      address: '0xdead1234567890abcdef1234567890abcdef1234',
      prefix: 'cafe',
    });
    expect(r.ok).toBe(false);
  });
});

describe('create2 helpers', () => {
  it('normalizes hex', () => {
    expect(normalizeHex('0xab').ok).toBe(true);
    expect(normalizeHex('xyz').ok).toBe(false);
    expect(normalizeHex('a').ok).toBe(false);
  });

  it('hashes init code', () => {
    const h = hashInitCode('0x6001600155');
    expect(h.ok).toBe(true);
    expect(h.initCodeHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('computes CREATE2 address (known vector shape)', () => {
    const deployer = '0x0000000000000000000000000000000000000001';
    const salt = '0x' + '00'.repeat(32);
    const init = hashInitCode('0x00');
    expect(init.ok).toBe(true);
    const addr = computeCreate2Address(deployer, salt, init.initCodeHash!);
    expect(addr.ok).toBe(true);
    expect(addr.address).toMatch(/^0x[0-9a-f]{40}$/);
  });
});

describe('post-find catalog', () => {
  it('uses full launch kit for mint and CREATE2', () => {
    expect(resolvePostFindProfile('sol', 'mint').launch).toBe('full');
    expect(resolvePostFindProfile('evm', 'create2-salt').launch).toBe('full');
    expect(resolvePostFindProfile('evm', 'contract').playbookId).toBe('evmContract');
  });

  it('uses compact launch kit for wallets', () => {
    expect(resolvePostFindProfile('sol', 'wallet').launch).toBe('compact');
    expect(resolvePostFindProfile('btc', 'taproot').importId).toBe('btcWif');
  });
});
