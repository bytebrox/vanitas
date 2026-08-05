/** Reserve a listing and open a payment window, or list your own orders. */

import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import { assertMarketEnabled, handler, jsonOk, readJson, ApiError } from '@/server/market/http';
import { createOrder, toOrderView } from '@/server/market/orders';
import { requireUser } from '@/server/market/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Every order the caller placed, newest first. Backs the purchases list. */
export const GET = handler(async () => {
  assertMarketEnabled();
  const user = await requireUser();

  const rows = await db()
    .select({ order: schema.orders, listing: schema.listings })
    .from(schema.orders)
    .innerJoin(schema.listings, eq(schema.listings.id, schema.orders.listingId))
    .where(eq(schema.orders.buyerId, user.id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(100);

  return jsonOk(rows.map(({ order, listing }) => toOrderView(order, listing.address)));
});

export const POST = handler(async (request: Request) => {
  assertMarketEnabled();
  const user = await requireUser();

  const body = await readJson<{ listingId?: string }>(request);
  if (typeof body.listingId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.listingId)) {
    throw new ApiError('invalid_listing', 400);
  }

  return jsonOk(await createOrder(body.listingId, user.id));
});
