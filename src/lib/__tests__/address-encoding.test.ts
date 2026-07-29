/**
 * Known-answer tests for the address encoders.
 *
 * These are the functions where a bug is invisible: a wrong checksum or a
 * flipped header still produces an address-shaped string, and the user only
 * finds out when the funds are gone. Every expectation below comes from a
 * published specification vector, not from our own output.
 */

import { describe, expect, it } from 'vitest';
import {
  base58Encode,
  base58CheckEncode,
  bech32Encode,
  bech32EncodeData,
  bech32mEncode,
  btcLegacyAddress,
  btcSegwitAddress,
  btcTaprootAddress,
  btcWifCompressed,
  hash160,
  tronAddressFromEth20,
  xrpClassicAddress,
} from '@/lib/address-encoding';

function hex(input: string): Uint8Array {
  const clean = input.replace(/^0x/i, '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('base58', () => {
  // https://datatracker.ietf.org/doc/html/draft-msporny-base58 test vectors
  it('encodes ASCII payloads', () => {
    expect(base58Encode(new TextEncoder().encode('Hello World!'))).toBe('2NEpo7TZRRrLZSi2U');
    expect(base58Encode(new TextEncoder().encode('The quick brown fox jumps over the lazy dog.'))).toBe(
      'USm3fpXnKG5EUBx2ndxBDMPVciP5hGey2Jh4NDv6gmeo1LkMeiKrLJUUBk6Z'
    );
  });

  it('keeps one leading 1 per leading zero byte', () => {
    expect(base58Encode(hex('0000287fb4cd'))).toBe('11233QC4');
  });
});

describe('bitcoin addresses', () => {
  // Bitcoin wiki "Technical background of version 1 Bitcoin addresses"
  const pubCompressed = hex(
    '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352'
  );

  it('hashes a public key to HASH160', () => {
    expect(toHex(hash160(pubCompressed))).toBe('f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');
  });

  it('encodes P2PKH', () => {
    expect(btcLegacyAddress(pubCompressed)).toBe('1PMycacnJaSqwwJqjawXBErnLsZ7RkXUAs');
  });

  // BIP-173 test vector
  it('encodes P2WPKH with bech32', () => {
    expect(bech32Encode('bc', 0, hex('751e76e8199196d454941c45d1b3a323f1433bd6'))).toBe(
      'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    );
  });

  // BIP-350 test vector
  it('encodes witness v1 with bech32m', () => {
    expect(
      bech32mEncode('bc', 1, hex('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'))
    ).toBe('bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0');
  });

  // Both encoders are pinned to spec vectors above, so the composition is what
  // is under test here: SegWit must be bech32 over HASH160 of the same key.
  it('derives P2WPKH by composing HASH160 and bech32', () => {
    expect(btcSegwitAddress(pubCompressed)).toBe(
      bech32Encode('bc', 0, hash160(pubCompressed))
    );
    expect(btcSegwitAddress(pubCompressed)).toMatch(/^bc1q[02-9ac-hj-np-z]{38}$/);
  });

  it('derives P2TR from the 32-byte x-only key', () => {
    expect(btcTaprootAddress(pubCompressed.slice(1))).toBe(
      bech32mEncode('bc', 1, pubCompressed.slice(1))
    );
    expect(() => btcTaprootAddress(pubCompressed)).toThrow();
  });

  // BIP-38 / standard WIF example: private key of all 0x01 bytes, compressed.
  it('encodes a compressed WIF', () => {
    expect(btcWifCompressed(hex('01'.repeat(32)))).toBe(
      'KwFfNUhSDaASSAwtG7ssQM1uVX8RgX5GHWnnLfhfiQDigjioWXHH'
    );
  });
});

describe('tron addresses', () => {
  // Tron encodes the EVM address body with a 0x41 prefix and Base58Check.
  it('wraps an EVM body', () => {
    const address = tronAddressFromEth20(hex('0000000000000000000000000000000000000000'));
    expect(address.startsWith('T')).toBe(true);
    expect(address).toBe('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb');
  });
});

describe('cardano addresses', () => {
  // CIP-19 mainnet enterprise address, payment key hash only.
  it('encodes an enterprise address from the payment key hash', () => {
    const header = new Uint8Array(29);
    header[0] = 0x61;
    header.set(hex('9493315cd92eb5d8c4304e67b7e16ae36d61d34502694657811a2c8e'), 1);
    expect(bech32EncodeData('addr', header)).toBe(
      'addr1vx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzers66hrl8'
    );
  });
});

describe('xrp addresses', () => {
  // XRPL genesis account: the master seed snoPBrXtMeMyMHUVTgbuqAfg1SUTb.
  it('encodes the classic account address', () => {
    expect(
      xrpClassicAddress(hex('0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020'))
    ).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
  });
});

describe('base58check', () => {
  it('appends a four-byte double-SHA256 checksum', () => {
    const payload = hex('00f54a5851e9372b87810a8e60cdd2e7cfd80b6e31');
    expect(base58CheckEncode(payload)).toBe('1PMycacnJaSqwwJqjawXBErnLsZ7RkXUAs');
  });
});
