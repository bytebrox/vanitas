/** Read a single listing, or change price and shelf state as its owner. */

import { and, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import { maxPriceWei, minPriceWei } from '@/server/market/config';
import { ApiError, assertMarketEnabled, handler, jsonOk, readJson } from '@/server/market/http';
import { findListing, toListingSummary } from '@/server/market/listings';
import { currentUser, requireUser } from '@/server/market/session';
import type { ListingStatus } from '@/types/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

/** Drafts and withdrawn listings are private to their seller. */
const PUBLIC_STATUSES: ListingStatus[] = ['active', 'reserved', 'sold'];

export const GET = handler(async (_request: Request, context: Context) => {
  assertMarketEnabled();
  const { id } = await context.params;

  const row = await findListing(id);
  const viewer = await currentUser();
  const isOwner = viewer?.id === row.listing.sellerId;

  if (!isOwner && !PUBLIC_STATUSES.includes(row.listing.status as ListingStatus)) {
    throw new ApiError('not_found', 404);
  }

  return jsonOk(toListingSummary(row, viewer?.id ?? null));
});

function parsePrice(raw: unknown): string {
  if (typeof raw !== 'string' || !/^\d{1,78}$/.test(raw)) {
    throw new ApiError('invalid_price', 400, 'Price must be a wei amount');
  }
  const value = BigInt(raw);
  if (value < minPriceWei()) throw new ApiError('price_too_low', 400);
  if (value > maxPriceWei()) throw new ApiError('price_too_high', 400);
  return value.toString();
}

export const PATCH = handler(async (request: Request, context: Context) => {
  assertMarketEnabled();
  const user = await requireUser();
  const { id } = await context.params;

  const row = await findListing(id);
  if (row.listing.sellerId !== user.id) throw new ApiError('forbidden', 403);

  // A listing with an order against it must not move until settlement is done.
  if (row.listing.status === 'reserved' || row.listing.status === 'sold') {
    throw new ApiError('listing_locked', 409, 'This listing has an order against it');
  }

  const body = await readJson<{ priceWei?: string; status?: string }>(request);
  const updates: Partial<typeof schema.listings.$inferInsert> = {};

  if (body.priceWei !== undefined) updates.priceWei = parsePrice(body.priceWei);

  if (body.status !== undefined) {
    if (body.status !== 'active' && body.status !== 'withdrawn') {
      throw new ApiError('invalid_status', 400, 'Only active or withdrawn can be set');
    }
    if (body.status === 'active') {
      const price = updates.priceWei ?? row.listing.priceWei;
      if (!price) throw new ApiError('price_required', 400, 'Set a price before publishing');
      updates.listedAt = new Date();
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) throw new ApiError('nothing_to_update', 400);

  const updated = await db()
    .update(schema.listings)
    .set(updates)
    .where(
      and(
        eq(schema.listings.id, id),
        eq(schema.listings.sellerId, user.id),
        inArray(schema.listings.status, ['draft', 'active', 'withdrawn'])
      )
    )
    .returning();

  if (!updated[0]) throw new ApiError('listing_locked', 409);

  return jsonOk(toListingSummary({ listing: updated[0], sellerAddress: user.address }, user.id));
});
