/**
 * Split-key vanity grinding on secp256k1.
 *
 * A marketplace listing is ground from two independent halves. The server
 * keeps a scalar `s` and publishes only the point `S = s*G`. The browser
 * searches for a scalar `b` whose combined address `addr(b*G + S)` matches the
 * wanted pattern, then hands `b` back.
 *
 * The full key is `k = (b + s) mod n`, which neither side can compute alone:
 * the browser never sees `s`, and the server only receives `b` after the fact.
 * Recovering `s` from `S` would mean solving the discrete logarithm.
 *
 * Both halves are needed to spend, so a seller cannot keep a usable copy of an
 * address they ground themselves.
 */

import { Point, etc, utils } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';

export const CURVE_ORDER = Point.CURVE().n;

export function scalarToBytes(scalar: bigint): Uint8Array {
  const hex = scalar.toString(16).padStart(64, '0');
  if (hex.length !== 64) throw new Error('Scalar does not fit in 32 bytes');
  return etc.hexToBytes(hex);
}

export function bytesToScalar(bytes: Uint8Array): bigint {
  if (bytes.length !== 32) throw new Error('Scalar must be 32 bytes');
  return etc.bytesToNumberBE(bytes);
}

/** A usable half is a scalar in [1, n-1]; anything else cannot be combined. */
export function isValidHalf(bytes: Uint8Array): boolean {
  if (bytes.length !== 32) return false;
  const scalar = etc.bytesToNumberBE(bytes);
  return scalar > 0n && scalar < CURVE_ORDER;
}

export function randomHalf(): Uint8Array {
  return utils.randomSecretKey();
}

export function pointFromHalf(half: Uint8Array): Point {
  return Point.BASE.multiply(bytesToScalar(half));
}

export function pointToCompressedHex(point: Point): string {
  return etc.bytesToHex(point.toBytes(true));
}

export function pointFromCompressedHex(hex: string): Point {
  const clean = hex.replace(/^0x/i, '').toLowerCase();
  if (!/^0[23][0-9a-f]{64}$/.test(clean)) {
    throw new Error('Expected a 33 byte compressed secp256k1 point');
  }
  return Point.fromBytes(etc.hexToBytes(clean));
}

/** Ethereum address of a curve point: keccak256 of the uncompressed x‖y. */
export function addressFromPoint(point: Point): string {
  const uncompressed = point.toBytes(false);
  return '0x' + etc.bytesToHex(keccak_256(uncompressed.slice(1)).slice(-20));
}

export function addressFromPrivateKey(key: Uint8Array): string {
  return addressFromPoint(pointFromHalf(key));
}

/**
 * The address that results from a client half combined with a server point.
 * This is what the worker checks against the pattern, and what the server
 * re-derives on submission.
 */
export function addressForHalfAndPoint(clientHalf: Uint8Array, serverPoint: Point): string {
  return addressFromPoint(Point.BASE.multiply(bytesToScalar(clientHalf)).add(serverPoint));
}

/**
 * Combine both halves into the final private key.
 *
 * `b + s` can land on a multiple of the curve order, which would yield the
 * point at infinity and an unusable key. The probability is negligible, but
 * the caller has to be able to reject the pair rather than hand out something
 * broken.
 */
export function combineHalves(clientHalf: Uint8Array, serverHalf: Uint8Array): Uint8Array {
  const sum = (bytesToScalar(clientHalf) + bytesToScalar(serverHalf)) % CURVE_ORDER;
  if (sum === 0n) throw new Error('Combined key is zero, halves must be regenerated');
  return scalarToBytes(sum);
}
