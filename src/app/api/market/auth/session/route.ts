/** Current session, plus the seller payout address. */

import { assertMarketEnabled, handler, jsonOk, readJson } from '@/server/market/http';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import {
  currentUser,
  normalizeAddress,
  requireUser,
  toSessionView,
} from '@/server/market/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  assertMarketEnabled();
  const user = await currentUser();
  return jsonOk(user ? toSessionView(user) : null);
});

export const PATCH = handler(async (request: Request) => {
  assertMarketEnabled();
  const user = await requireUser();

  const body = await readJson<{ payoutAddress?: string }>(request);
  const payoutAddress = normalizeAddress(body.payoutAddress);

  await db()
    .update(schema.users)
    .set({ payoutAddress })
    .where(eq(schema.users.id, user.id));

  return jsonOk(toSessionView({ ...user, payoutAddress }));
});
