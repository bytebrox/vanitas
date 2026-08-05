/**
 * Shared response helpers for the marketplace API.
 *
 * Marketplace responses are never cached and never indexed: they carry order
 * state and, in one case, a private key.
 */

import { NextResponse } from 'next/server';
import { ConfigError } from '../errors';
import { isMarketEnabled } from './config';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow',
};

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data as Record<string, unknown>, {
    status,
    headers: NO_STORE,
  });
}

export function jsonError(code: string, status: number, detail?: string): NextResponse {
  return NextResponse.json({ error: code, detail }, { status, headers: NO_STORE });
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    detail?: string
  ) {
    super(detail || code);
    this.name = 'ApiError';
  }
}

/**
 * Wrap a handler so thrown `ApiError`s become clean responses and anything
 * else becomes a 500 without leaking internals to the client.
 */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        return jsonError(err.code, err.status, err.message);
      }
      if (err instanceof ConfigError) {
        console.error('market api misconfigured', err.variable);
        return jsonError('market_misconfigured', 503, `Missing ${err.variable}`);
      }
      console.error('market api error', err);
      return jsonError('internal_error', 500);
    }
  };
}

/** Every marketplace endpoint is inert until the feature flag is switched on. */
export function assertMarketEnabled(): void {
  if (!isMarketEnabled()) {
    throw new ApiError('market_disabled', 404, 'The marketplace is not enabled');
  }
}

/** Origin of the current request, used for the EIP-4361 domain binding. */
export function requestOrigin(request: Request): { domain: string; uri: string } {
  const host = request.headers.get('host');
  if (!host) throw new ApiError('invalid_request', 400, 'Missing Host header');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  return { domain: host, uri: `${proto}://${host}` };
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError('invalid_json', 400);
  }
}
