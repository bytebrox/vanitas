/**
 * Wallet sign-in and session cookies.
 *
 * Login follows EIP-4361: the server issues the complete message, the wallet
 * signs it verbatim, and verification runs against the stored copy. Nothing
 * about the message is reconstructed from client input.
 */

import { cookies } from 'next/headers';
import { and, eq, isNull, lt } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import { AUTH_NONCE_TTL_MS, SESSION_TTL_MS, adminAddresses } from './config';
import { constantTimeEquals, hmac, randomToken, sessionSecret } from './crypto';
import { ApiError } from './http';
import type { MarketSession } from '@/types/market';

export const SESSION_COOKIE = 'vanitas_market_session';

interface SessionPayload {
  sub: string;
  address: string;
  exp: number;
}

export function normalizeAddress(value: unknown): string {
  if (typeof value !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(value.trim())) {
    throw new ApiError('invalid_address', 400, 'Expected a 20 byte hex address');
  }
  return value.trim().toLowerCase();
}

export function buildSignInMessage(opts: {
  domain: string;
  uri: string;
  address: string;
  chainId: number;
  nonce: string;
  issuedAt: Date;
}): string {
  return [
    `${opts.domain} wants you to sign in with your Ethereum account:`,
    opts.address,
    '',
    'Sign in to the Vanitas marketplace. This signature costs no gas and does not authorise any transaction.',
    '',
    `URI: ${opts.uri}`,
    'Version: 1',
    `Chain ID: ${opts.chainId}`,
    `Nonce: ${opts.nonce}`,
    `Issued At: ${opts.issuedAt.toISOString()}`,
    `Expiration Time: ${new Date(opts.issuedAt.getTime() + AUTH_NONCE_TTL_MS).toISOString()}`,
  ].join('\n');
}

function encodeToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = hmac(sessionSecret(), body).toString('base64url');
  return `${body}.${signature}`;
}

function decodeToken(token: string): SessionPayload | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = hmac(sessionSecret(), body);
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (!constantTimeEquals(expected, provided)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.sub || !payload.address || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function issueSession(userId: string, address: string): Promise<void> {
  const token = encodeToken({ sub: userId, address, exp: Date.now() + SESSION_TTL_MS });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export interface AuthenticatedUser {
  id: string;
  address: string;
  payoutAddress: string | null;
  isAdmin: boolean;
}

/** Resolve the signed-in user, or null when there is no valid session. */
export async function currentUser(): Promise<AuthenticatedUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  const rows = await db()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.sub))
    .limit(1);
  const user = rows[0];
  if (!user || user.address !== payload.address) return null;

  return {
    id: user.id,
    address: user.address,
    payoutAddress: user.payoutAddress,
    isAdmin: user.isAdmin || adminAddresses().has(user.address),
  };
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await currentUser();
  if (!user) throw new ApiError('unauthenticated', 401, 'Connect a wallet first');
  return user;
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!user.isAdmin) throw new ApiError('forbidden', 403);
  return user;
}

export function toSessionView(user: AuthenticatedUser): MarketSession {
  return {
    address: user.address,
    payoutAddress: user.payoutAddress,
    isAdmin: user.isAdmin,
  };
}

export async function createNonce(opts: {
  address: string;
  domain: string;
  uri: string;
  chainId: number;
}): Promise<{ nonce: string; message: string; expiresAt: Date }> {
  const nonce = randomToken(16);
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + AUTH_NONCE_TTL_MS);
  const message = buildSignInMessage({ ...opts, nonce, issuedAt });

  await db().delete(schema.authNonces).where(lt(schema.authNonces.expiresAt, new Date()));
  await db().insert(schema.authNonces).values({
    nonce,
    address: opts.address,
    message,
    issuedAt,
    expiresAt,
  });

  return { nonce, message, expiresAt };
}

/** Consume a nonce exactly once and hand back the message that was signed. */
export async function consumeNonce(nonce: string): Promise<{ address: string; message: string }> {
  if (typeof nonce !== 'string' || nonce.length < 8 || nonce.length > 128) {
    throw new ApiError('invalid_nonce', 400);
  }

  const updated = await db()
    .update(schema.authNonces)
    .set({ consumedAt: new Date() })
    .where(and(eq(schema.authNonces.nonce, nonce), isNull(schema.authNonces.consumedAt)))
    .returning();

  const row = updated[0];
  if (!row) throw new ApiError('invalid_nonce', 400, 'Nonce is unknown or already used');
  if (row.expiresAt.getTime() < Date.now()) {
    throw new ApiError('nonce_expired', 400, 'Sign-in request expired, try again');
  }

  return { address: row.address, message: row.message };
}

/** Find or create the account behind a wallet address. */
export async function upsertUser(address: string): Promise<AuthenticatedUser> {
  const existing = await db()
    .select()
    .from(schema.users)
    .where(eq(schema.users.address, address))
    .limit(1);

  if (existing[0]) {
    await db()
      .update(schema.users)
      .set({ lastSeenAt: new Date() })
      .where(eq(schema.users.id, existing[0].id));
    return {
      id: existing[0].id,
      address: existing[0].address,
      payoutAddress: existing[0].payoutAddress,
      isAdmin: existing[0].isAdmin || adminAddresses().has(address),
    };
  }

  const inserted = await db()
    .insert(schema.users)
    .values({ address, isAdmin: adminAddresses().has(address) })
    .returning();

  return {
    id: inserted[0].id,
    address: inserted[0].address,
    payoutAddress: inserted[0].payoutAddress,
    isAdmin: inserted[0].isAdmin,
  };
}
