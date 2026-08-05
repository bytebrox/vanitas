/**
 * Redeem a grinding session into a draft listing.
 *
 * The submitted half is never trusted: the server recombines it with its own
 * scalar and only accepts the result if the derived address matches what the
 * client claims. A forged or replayed half simply fails the check.
 */

import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import { decryptSecret, encryptSecret } from '@/server/market/crypto';
import { ApiError, assertMarketEnabled, handler, jsonOk, readJson } from '@/server/market/http';
import { toListingSummary } from '@/server/market/listings';
import { requireUser } from '@/server/market/session';
import {
  addressForHalfAndPoint,
  combineHalves,
  isValidHalf,
  pointFromCompressedHex,
} from '@/lib/splitkey';
import type { ForgeSubmitRequest } from '@/types/market';
import { etc } from '@noble/secp256k1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseHalf(value: unknown): Uint8Array {
  if (typeof value !== 'string') throw new ApiError('invalid_half', 400);
  const clean = value.replace(/^0x/i, '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(clean)) throw new ApiError('invalid_half', 400);

  const bytes = etc.hexToBytes(clean);
  if (!isValidHalf(bytes)) throw new ApiError('invalid_half', 400, 'Half is outside the curve order');
  return bytes;
}

export const POST = handler(async (request: Request) => {
  assertMarketEnabled();
  const user = await requireUser();

  const body = await readJson<ForgeSubmitRequest>(request);
  const clientHalf = parseHalf(body.clientHalf);

  if (typeof body.sessionId !== 'string') throw new ApiError('invalid_session', 400);
  if (typeof body.address !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(body.address)) {
    throw new ApiError('invalid_address', 400);
  }
  const claimedAddress = body.address.toLowerCase();

  // Claiming the session first makes a concurrent second submission a no-op.
  const claimed = await db()
    .update(schema.forgeSessions)
    .set({ status: 'redeemed' })
    .where(
      and(
        eq(schema.forgeSessions.id, body.sessionId),
        eq(schema.forgeSessions.userId, user.id),
        eq(schema.forgeSessions.status, 'open')
      )
    )
    .returning();

  const session = claimed[0];
  if (!session) throw new ApiError('invalid_session', 400, 'Session is unknown or already used');
  if (session.expiresAt.getTime() < Date.now()) {
    throw new ApiError('session_expired', 400, 'Forge session expired, start a new run');
  }

  const derived = addressForHalfAndPoint(
    clientHalf,
    pointFromCompressedHex(session.serverPoint)
  );
  if (derived !== claimedAddress) {
    throw new ApiError('address_mismatch', 400, 'Submitted half does not produce that address');
  }

  const serverHalf = decryptSecret(session.encServerHalf, session.id);
  let privateKey: Uint8Array;
  try {
    privateKey = combineHalves(clientHalf, serverHalf);
  } catch {
    throw new ApiError('degenerate_key', 400, 'Unusable key pair, please forge again');
  } finally {
    serverHalf.fill(0);
    clientHalf.fill(0);
  }

  const listingId = crypto.randomUUID();
  const encKey = encryptSecret(privateKey, listingId);
  privateKey.fill(0);

  const attempts =
    typeof body.attempts === 'number' && Number.isFinite(body.attempts) && body.attempts >= 0
      ? BigInt(Math.floor(body.attempts))
      : null;
  const difficultyBits =
    typeof body.difficultyBits === 'number' && Number.isFinite(body.difficultyBits)
      ? body.difficultyBits.toFixed(4)
      : null;

  const inserted = await db()
    .insert(schema.listings)
    .values({
      id: listingId,
      sellerId: user.id,
      address: derived,
      pattern: session.pattern,
      matchedPattern:
        typeof body.matchedPattern === 'string' ? body.matchedPattern.slice(0, 120) : '',
      difficultyBits,
      attempts,
      encKey,
      status: 'draft',
      origin: user.isAdmin ? 'platform' : 'user',
    })
    .onConflictDoNothing({ target: schema.listings.address })
    .returning();

  if (!inserted[0]) {
    throw new ApiError('address_taken', 409, 'That address already exists in the marketplace');
  }

  // The private key is intentionally not part of the response.
  await db()
    .delete(schema.forgeSessions)
    .where(eq(schema.forgeSessions.id, session.id));

  return jsonOk(
    toListingSummary({ listing: inserted[0], sellerAddress: user.address }, user.id)
  );
});
