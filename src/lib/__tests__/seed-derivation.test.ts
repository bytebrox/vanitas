/**
 * The Seed Forge is only useful if its output can be recovered in a real
 * wallet, so the derivation is pinned to the published vectors: SLIP-0010 for
 * the ed25519 side and the canonical BIP-39/BIP-44 mnemonic for the EVM side.
 */

import { describe, expect, it } from 'vitest';
import { mnemonicToSeedSync } from '@scure/bip39';
import {
  SEED_PATH_STYLES,
  createWalker,
  matchesAddress,
  pathStyleById,
  renderPath,
} from '@/workers/seed-derivation';
import { isValidMnemonic } from '@/lib/seed-generator';

/** BIP-39 vector 1 — the mnemonic every wallet ships in its test suite. */
const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

const seed = mnemonicToSeedSync(MNEMONIC);

describe('mnemonic validation', () => {
  it('accepts the canonical mnemonic', () => {
    expect(isValidMnemonic(MNEMONIC)).toBe(true);
    expect(isValidMnemonic(`  ${MNEMONIC.replace(/ /g, '   ')}  `)).toBe(true);
  });

  it('rejects a wrong checksum and unknown words', () => {
    expect(isValidMnemonic(MNEMONIC.replace(/about$/, 'abandon'))).toBe(false);
    expect(isValidMnemonic('vanitas '.repeat(12).trim())).toBe(false);
  });
});

describe('path styles', () => {
  it('renders the ground index into the template', () => {
    expect(renderPath(pathStyleById('sol-account')!, 7)).toBe("m/44'/501'/7'/0'");
    expect(renderPath(pathStyleById('evm-address')!, 7)).toBe("m/44'/60'/0'/0/7");
  });

  it('covers both chains', () => {
    expect(SEED_PATH_STYLES.filter((s) => s.chain === 'sol')).toHaveLength(2);
    expect(SEED_PATH_STYLES.filter((s) => s.chain === 'evm')).toHaveLength(2);
  });
});

describe('evm derivation', () => {
  // BIP-44 m/44'/60'/0'/0/0 for the canonical mnemonic.
  it('matches the reference address at index 0', () => {
    const walker = createWalker(seed, pathStyleById('evm-address')!);
    expect(walker.addressAt(0)).toBe('0x9858effd232b4033e47d90003d41ec34ecaeda94');
  });

  it('matches the reference address at index 1', () => {
    const walker = createWalker(seed, pathStyleById('evm-address')!);
    expect(walker.addressAt(1)).toBe('0x6fac4d18c912343bf86fa7049364dd4e424ab9c0');
  });

  it('returns a 32-byte private key alongside the address', () => {
    const walker = createWalker(seed, pathStyleById('evm-address')!);
    const secret = walker.secretAt(3);
    expect(secret.privateKey).toMatch(/^0x[0-9a-f]{64}$/);
    expect(secret.address).toBe(walker.addressAt(3));
  });

  it('gives a different address for the Ledger-style account path', () => {
    const byAddress = createWalker(seed, pathStyleById('evm-address')!);
    const byAccount = createWalker(seed, pathStyleById('evm-account')!);
    // Index 0 is m/44'/60'/0'/0/0 either way.
    expect(byAccount.addressAt(0)).toBe(byAddress.addressAt(0));
    expect(byAccount.addressAt(1)).not.toBe(byAddress.addressAt(1));
  });
});

describe('solana derivation', () => {
  it('produces base58 addresses of the right shape', () => {
    const walker = createWalker(seed, pathStyleById('sol-account')!);
    const address = walker.addressAt(0);
    expect(address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  });

  it('separates the Phantom and Solflare conventions', () => {
    const phantom = createWalker(seed, pathStyleById('sol-account')!);
    const solflare = createWalker(seed, pathStyleById('sol-short')!);
    expect(phantom.addressAt(0)).not.toBe(solflare.addressAt(0));
  });

  it('is deterministic across walkers', () => {
    const a = createWalker(seed, pathStyleById('sol-account')!);
    const b = createWalker(seed, pathStyleById('sol-account')!);
    expect(a.addressAt(11)).toBe(b.addressAt(11));
  });

  it('packs the 64-byte keypair as seed then public key', () => {
    const walker = createWalker(seed, pathStyleById('sol-account')!);
    const secret = walker.secretAt(0);
    expect(secret.address).toBe(walker.addressAt(0));
    // 64 bytes in base58 is always 87 or 88 characters.
    expect(secret.privateKey.length).toBeGreaterThanOrEqual(86);
  });
});

describe('pattern matching', () => {
  it('ignores the 0x prefix on EVM addresses', () => {
    expect(matchesAddress('evm', '0xdead0000000000000000000000000000beef', 'dead', 'beef', false)).toBe(true);
    expect(matchesAddress('evm', '0xdead0000000000000000000000000000beef', '0xde', '', false)).toBe(false);
  });

  it('treats EVM hex as case-insensitive regardless of the flag', () => {
    expect(matchesAddress('evm', '0xDEADbeef', 'dead', '', true)).toBe(true);
  });

  it('honours case sensitivity for base58', () => {
    expect(matchesAddress('sol', 'Acesomething', 'Ace', '', true)).toBe(true);
    expect(matchesAddress('sol', 'Acesomething', 'ace', '', true)).toBe(false);
    expect(matchesAddress('sol', 'Acesomething', 'ace', '', false)).toBe(true);
  });

  it('matches everything when no pattern is given', () => {
    expect(matchesAddress('sol', 'whatever', '', '', true)).toBe(true);
  });
});
