/**
 * Shared address encodings for Bitcoin, Tron & Cardano (browser + workers)
 */

import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { blake2b } from '@noble/hashes/blake2.js';

export const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Bitcoin Bech32 charset (BIP-173) */
export const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

export function doubleSha256(data: Uint8Array): Uint8Array {
  return sha256(sha256(data));
}

export function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;

  const size = Math.ceil(((bytes.length - zeros) * 138) / 100) + 1;
  const buf = new Uint8Array(size);
  let length = 0;

  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    let j = 0;
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 256 * buf[k];
      buf[k] = carry % 58;
      carry = (carry / 58) | 0;
    }
    length = j;
  }

  let start = size - length;
  while (start < size && buf[start] === 0) start++;

  let str = '1'.repeat(zeros);
  for (let i = start; i < size; i++) str += BASE58_ALPHABET[buf[i]];
  return str;
}

export function base58CheckEncode(payload: Uint8Array): string {
  const checksum = doubleSha256(payload).slice(0, 4);
  return base58Encode(concatBytes(payload, checksum));
}

/** Convert 5-bit groups */
function convertBits(
  data: Uint8Array,
  fromBits: number,
  toBits: number,
  pad: boolean
): number[] | null {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (const value of data) {
    if (value < 0 || value >> fromBits) return null;
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
  } else if (bits >= fromBits || (acc << (toBits - bits)) & maxv) {
    return null;
  }
  return ret;
}

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function bech32CreateChecksum(hrp: string, data: number[]): number[] {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const polymod = bech32Polymod(values) ^ 1;
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) ret.push((polymod >> (5 * (5 - i))) & 31);
  return ret;
}

/** BIP-350 Bech32m checksum (Taproot witness v1) */
function bech32mCreateChecksum(hrp: string, data: number[]): number[] {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const polymod = bech32Polymod(values) ^ 0x2bc830a3;
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) ret.push((polymod >> (5 * (5 - i))) & 31);
  return ret;
}

/** BIP-173 Bech32 encode (for P2WPKH / witness v0) */
export function bech32Encode(hrp: string, witver: number, witprog: Uint8Array): string {
  const data = [witver].concat(convertBits(witprog, 8, 5, true)!);
  const combined = data.concat(bech32CreateChecksum(hrp, data));
  let str = hrp + '1';
  for (const d of combined) str += BECH32_ALPHABET[d];
  return str;
}

/** BIP-173 Bech32 encode of arbitrary bytes (Cardano Shelley / enterprise) */
export function bech32EncodeData(hrp: string, payload: Uint8Array): string {
  const data = convertBits(payload, 8, 5, true);
  if (!data) throw new Error('bech32 convertBits failed');
  const combined = data.concat(bech32CreateChecksum(hrp, data));
  let str = hrp + '1';
  for (const d of combined) str += BECH32_ALPHABET[d];
  return str;
}

/** BIP-350 Bech32m encode (for Taproot / witness v1) */
export function bech32mEncode(hrp: string, witver: number, witprog: Uint8Array): string {
  const data = [witver].concat(convertBits(witprog, 8, 5, true)!);
  const combined = data.concat(bech32mCreateChecksum(hrp, data));
  let str = hrp + '1';
  for (const d of combined) str += BECH32_ALPHABET[d];
  return str;
}

/** Bitcoin mainnet P2PKH (legacy, starts with 1) from compressed pubkey */
export function btcLegacyAddress(pubCompressed: Uint8Array): string {
  const payload = new Uint8Array(21);
  payload[0] = 0x00;
  payload.set(hash160(pubCompressed), 1);
  return base58CheckEncode(payload);
}

/** Bitcoin mainnet native SegWit P2WPKH (bc1q…) */
export function btcSegwitAddress(pubCompressed: Uint8Array): string {
  return bech32Encode('bc', 0, hash160(pubCompressed));
}

/**
 * Bitcoin mainnet Taproot P2TR (bc1p…) from 32-byte x-only pubkey (BIP-341 key-path).
 * Pass schnorr.getPublicKey(secret) output.
 */
export function btcTaprootAddress(xOnlyPubkey32: Uint8Array): string {
  if (xOnlyPubkey32.length !== 32) {
    throw new Error('Taproot output key must be 32 bytes');
  }
  return bech32mEncode('bc', 1, xOnlyPubkey32);
}

/** Bitcoin WIF (compressed) */
export function btcWifCompressed(secret: Uint8Array): string {
  const payload = new Uint8Array(34);
  payload[0] = 0x80;
  payload.set(secret, 1);
  payload[33] = 0x01;
  return base58CheckEncode(payload);
}

/** Tron mainnet Base58Check address (starts with T) */
export function tronAddressFromEth20(addr20: Uint8Array): string {
  const payload = new Uint8Array(21);
  payload[0] = 0x41;
  payload.set(addr20, 1);
  return base58CheckEncode(payload);
}

/**
 * Cardano mainnet enterprise address (CIP-19 type 6): payment key only.
 * Header 0x61 = type 6 (PaymentKeyHash, no delegation) + network 1 (mainnet).
 */
export function cardanoEnterpriseAddress(pubEd25519: Uint8Array): string {
  const paymentHash = blake2b(pubEd25519, { dkLen: 28 });
  const payload = new Uint8Array(29);
  payload[0] = 0x61;
  payload.set(paymentHash, 1);
  return bech32EncodeData('addr', payload);
}
