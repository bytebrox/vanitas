/**
 * Marketplace configuration and required secrets.
 *
 * Every secret is read lazily so that a build without marketplace env vars
 * still succeeds; the failure surfaces on the first request instead.
 */

import { ConfigError } from '../errors';

export const FORGE_SESSION_TTL_MS = 6 * 60 * 60 * 1000;
export const ORDER_TTL_MS = 60 * 60 * 1000;
export const AUTH_NONCE_TTL_MS = 10 * 60 * 1000;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Read a wei bound, falling back on anything that is not a plain integer.
 *
 * A variable that exists but is empty is the common case here: hosting panels
 * keep the key once it has been added. `BigInt('')` is `0n`, which would
 * silently drop the price floor to nothing.
 */
function weiEnv(name: string, fallback: string): bigint {
  const raw = (process.env[name] ?? '').trim();
  return /^\d+$/.test(raw) ? BigInt(raw) : BigInt(fallback);
}

export function minPriceWei(): bigint {
  return weiEnv('MARKET_MIN_PRICE_WEI', '1000000000000000');
}

export function maxPriceWei(): bigint {
  return weiEnv('MARKET_MAX_PRICE_WEI', '1000000000000000000000');
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new ConfigError(name);
  return value;
}

/** Wallet addresses allowed to list platform inventory and reach admin routes. */
export function adminAddresses(): Set<string> {
  return new Set(
    (process.env.MARKET_ADMIN_ADDRESSES || '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isMarketEnabled(): boolean {
  return (process.env.NEXT_PUBLIC_MARKET_ENABLED || '').toLowerCase() === 'true';
}
