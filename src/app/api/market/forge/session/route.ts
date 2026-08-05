/**
 * Open a grinding session.
 *
 * The response carries the point S only. The scalar behind it stays encrypted
 * in the database, which is what stops a seller from reconstructing the key
 * for an address their own browser found.
 */

import { and, eq, lt, sql } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import { FORGE_SESSION_TTL_MS } from '@/server/market/config';
import { encryptSecret } from '@/server/market/crypto';
import { ApiError, assertMarketEnabled, handler, jsonOk, readJson } from '@/server/market/http';
import { requireUser } from '@/server/market/session';
import { pointFromHalf, pointToCompressedHex, randomHalf } from '@/lib/splitkey';
import type { ForgeSessionResponse } from '@/types/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPEN_SESSIONS = 8;

export const POST = handler(async (request: Request) => {
  assertMarketEnabled();
  const user = await requireUser();

  const body = await readJson<{ pattern?: string }>(request);
  const pattern = typeof body.pattern === 'string' ? body.pattern.slice(0, 120) : '';

  await db()
    .delete(schema.forgeSessions)
    .where(
      and(
        eq(schema.forgeSessions.userId, user.id),
        eq(schema.forgeSessions.status, 'open'),
        lt(schema.forgeSessions.expiresAt, new Date())
      )
    );

  const open = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.forgeSessions)
    .where(and(eq(schema.forgeSessions.userId, user.id), eq(schema.forgeSessions.status, 'open')));

  if ((open[0]?.count ?? 0) >= MAX_OPEN_SESSIONS) {
    throw new ApiError('too_many_sessions', 429, 'Finish or abandon an open forge run first');
  }

  const serverHalf = randomHalf();
  const serverPoint = pointToCompressedHex(pointFromHalf(serverHalf));
  const expiresAt = new Date(Date.now() + FORGE_SESSION_TTL_MS);

  // The row id doubles as the AAD, so a ciphertext cannot be replayed
  // against a different session.
  const id = crypto.randomUUID();
  await db().insert(schema.forgeSessions).values({
    id,
    userId: user.id,
    encServerHalf: encryptSecret(serverHalf, id),
    serverPoint,
    pattern,
    expiresAt,
  });
  serverHalf.fill(0);

  const payload: ForgeSessionResponse = {
    sessionId: id,
    serverPoint,
    expiresAt: expiresAt.toISOString(),
  };
  return jsonOk(payload);
});
