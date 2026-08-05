/**
 * Split-key grinding unit tests.
 *
 * The property that carries the whole marketplace trust model is that the
 * address the browser sees while grinding equals the address of the combined
 * private key. If that ever breaks, buyers receive keys to the wrong address.
 */

import { describe, expect, it } from 'vitest';
import { etc } from '@noble/secp256k1';
import {
  CURVE_ORDER,
  addressForHalfAndPoint,
  addressFromPrivateKey,
  bytesToScalar,
  combineHalves,
  isValidHalf,
  pointFromCompressedHex,
  pointFromHalf,
  pointToCompressedHex,
  randomHalf,
  scalarToBytes,
} from '@/lib/splitkey';

describe('splitkey', () => {
  it('grinds against the same address the combined key controls', () => {
    for (let i = 0; i < 25; i++) {
      const serverHalf = randomHalf();
      const clientHalf = randomHalf();
      const serverPoint = pointFromHalf(serverHalf);

      const groundAddress = addressForHalfAndPoint(clientHalf, serverPoint);
      const finalKey = combineHalves(clientHalf, serverHalf);

      expect(addressFromPrivateKey(finalKey)).toBe(groundAddress);
    }
  });

  it('survives the compressed point round trip the API uses', () => {
    const serverHalf = randomHalf();
    const clientHalf = randomHalf();
    const point = pointFromHalf(serverHalf);

    const restored = pointFromCompressedHex(pointToCompressedHex(point));

    expect(addressForHalfAndPoint(clientHalf, restored)).toBe(
      addressForHalfAndPoint(clientHalf, point)
    );
  });

  it('is order independent, so neither half is privileged', () => {
    const a = randomHalf();
    const b = randomHalf();
    expect(etc.bytesToHex(combineHalves(a, b))).toBe(etc.bytesToHex(combineHalves(b, a)));
  });

  it('rejects halves outside the valid scalar range', () => {
    expect(isValidHalf(scalarToBytes(0n))).toBe(false);
    expect(isValidHalf(scalarToBytes(CURVE_ORDER - 1n))).toBe(true);
    expect(isValidHalf(new Uint8Array(31))).toBe(false);
    expect(isValidHalf(new Uint8Array(33))).toBe(false);
  });

  it('rejects a pair that sums to the curve order', () => {
    const serverHalf = randomHalf();
    const complement = scalarToBytes(CURVE_ORDER - bytesToScalar(serverHalf));
    expect(() => combineHalves(complement, serverHalf)).toThrow();
  });

  it('wraps sums that exceed the curve order', () => {
    const high = scalarToBytes(CURVE_ORDER - 5n);
    const small = scalarToBytes(10n);
    const combined = bytesToScalar(combineHalves(high, small));

    expect(combined).toBe(5n);
    expect(addressFromPrivateKey(combineHalves(high, small))).toBe(
      addressForHalfAndPoint(high, pointFromHalf(small))
    );
  });

  it('produces a different address for a tampered client half', () => {
    const serverPoint = pointFromHalf(randomHalf());
    const clientHalf = randomHalf();
    const tampered = Uint8Array.from(clientHalf);
    tampered[31] ^= 0x01;

    expect(addressForHalfAndPoint(tampered, serverPoint)).not.toBe(
      addressForHalfAndPoint(clientHalf, serverPoint)
    );
  });

  it('gives the server no way to reach the address on its own', () => {
    const serverHalf = randomHalf();
    const clientHalf = randomHalf();
    const listed = addressForHalfAndPoint(clientHalf, pointFromHalf(serverHalf));

    expect(addressFromPrivateKey(serverHalf)).not.toBe(listed);
    expect(addressFromPrivateKey(clientHalf)).not.toBe(listed);
  });
});
