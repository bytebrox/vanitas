/**
 * Order lifecycle.
 *
 * pending -> paid -> released, or pending -> expired. A pending order holds
 * the listing in `reserved` so two buyers cannot pay for the same address.
 */

import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import { publicClient } from './chain';
import { ORDER_TTL_MS } from './config';
import { depositAccount, nextDepositIndex } from './deposits';
import { ApiError } from './http';
import type { OrderStatus, OrderView } from '@/types/market';

type OrderRow = typeof schema.orders.$inferSelect;

export function toOrderView(order: OrderRow, listingAddress: string): OrderView {
  return {
    id: order.id,
    listingId: order.listingId,
    address: listingAddress,
    depositAddress: order.depositAddress,
    amountWei: order.amountWei,
    status: order.status as OrderStatus,
    expiresAt: order.expiresAt.toISOString(),
    paidTxHash: order.paidTxHash,
    createdAt: order.createdAt.toISOString(),
  };
}

/**
 * Reserve a listing and hand back a fresh deposit address.
 *
 * The listing update is conditional on it still being active, which is what
 * makes two simultaneous buyers resolve to one winner.
 */
export async function createOrder(listingId: string, buyerId: string): Promise<OrderView> {
  const listings = await db()
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.id, listingId))
    .limit(1);

  const listing = listings[0];
  if (!listing) throw new ApiError('not_found', 404);
  if (listing.sellerId === buyerId) {
    throw new ApiError('own_listing', 400, 'You cannot buy your own listing');
  }
  if (listing.status !== 'active') throw new ApiError('listing_unavailable', 409);
  if (!listing.priceWei) throw new ApiError('listing_unpriced', 409);

  const reserved = await db()
    .update(schema.listings)
    .set({ status: 'reserved' })
    .where(and(eq(schema.listings.id, listingId), eq(schema.listings.status, 'active')))
    .returning();

  if (!reserved[0]) throw new ApiError('listing_unavailable', 409);

  const depositIndex = await nextDepositIndex();
  const inserted = await db()
    .insert(schema.orders)
    .values({
      listingId,
      buyerId,
      depositIndex,
      depositAddress: depositAccount(depositIndex).address.toLowerCase(),
      amountWei: listing.priceWei,
      expiresAt: new Date(Date.now() + ORDER_TTL_MS),
    })
    .returning();

  return toOrderView(inserted[0], listing.address);
}

/**
 * Look at the chain and move the order forward if the money arrived.
 *
 * Matching is on balance rather than on a specific transaction, so it works
 * regardless of how the buyer paid: wallet, exchange withdrawal, or several
 * transfers adding up.
 */
export async function settlePendingOrder(order: OrderRow): Promise<OrderRow> {
  if (order.status !== 'pending') return order;

  const balance = await publicClient().getBalance({
    address: order.depositAddress as `0x${string}`,
  });

  if (balance >= BigInt(order.amountWei)) {
    const paid = await db()
      .update(schema.orders)
      .set({ status: 'paid', paidAt: new Date() })
      .where(and(eq(schema.orders.id, order.id), eq(schema.orders.status, 'pending')))
      .returning();
    return paid[0] ?? order;
  }

  if (order.expiresAt.getTime() < Date.now()) {
    return await expireOrder(order);
  }

  return order;
}

/** Release the reservation so the address can go back on the board. */
export async function expireOrder(order: OrderRow): Promise<OrderRow> {
  const expired = await db()
    .update(schema.orders)
    .set({ status: 'expired' })
    .where(and(eq(schema.orders.id, order.id), eq(schema.orders.status, 'pending')))
    .returning();

  if (expired[0]) {
    await db()
      .update(schema.listings)
      .set({ status: 'active' })
      .where(
        and(eq(schema.listings.id, order.listingId), eq(schema.listings.status, 'reserved'))
      );
  }

  return expired[0] ?? order;
}

export async function findOrder(id: string, buyerId: string): Promise<{
  order: OrderRow;
  listing: typeof schema.listings.$inferSelect;
}> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError('not_found', 404);

  const rows = await db()
    .select({ order: schema.orders, listing: schema.listings })
    .from(schema.orders)
    .innerJoin(schema.listings, eq(schema.listings.id, schema.orders.listingId))
    .where(eq(schema.orders.id, id))
    .limit(1);

  const row = rows[0];
  if (!row || row.order.buyerId !== buyerId) throw new ApiError('not_found', 404);
  return row;
}
