/**
 * Deposit address derivation.
 *
 * Every order is matched to a payment purely by which address it landed on,
 * so a repeated or colliding address would credit the wrong buyer.
 */

import { beforeAll, describe, expect, it } from 'vitest';

const TEST_SEED = 'a'.repeat(128);

let depositAccount: typeof import('@/server/market/deposits').depositAccount;

beforeAll(async () => {
  process.env.MARKET_HD_SEED = TEST_SEED;
  ({ depositAccount } = await import('@/server/market/deposits'));
});

describe('market deposits', () => {
  it('derives the same address for the same index', () => {
    expect(depositAccount(7).address).toBe(depositAccount(7).address);
  });

  it('produces a distinct address per index', () => {
    const addresses = new Set<string>();
    for (let index = 1; index <= 200; index++) {
      addresses.add(depositAccount(index).address.toLowerCase());
    }
    expect(addresses.size).toBe(200);
  });

  it('refuses indices outside the deposit range', () => {
    expect(() => depositAccount(0)).toThrow();
    expect(() => depositAccount(-1)).toThrow();
    expect(() => depositAccount(1.5)).toThrow();
  });

  it('rejects a malformed seed', async () => {
    process.env.MARKET_HD_SEED = 'not-hex';
    expect(() => depositAccount(1)).toThrow();
    process.env.MARKET_HD_SEED = TEST_SEED;
  });
});
