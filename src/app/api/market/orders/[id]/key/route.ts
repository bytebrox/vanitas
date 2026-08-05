/**
 * Hand the private key to the buyer.
 *
 * This is the only place in the codebase where a complete key leaves the
 * server, so it is gated on a paid order that belongs to the caller, and the
 * response is marked no-store.
 */

import { and, eq } from 'drizzle-orm';
import { etc } from '@noble/secp256k1';
import { db, schema } from '@/server/db/client';
import { decryptSecret } from '@/server/market/crypto';
import { ApiError, assertMarketEnabled, handler, jsonOk } from '@/server/market/http';
import { findOrder, settlePendingOrder } from '@/server/market/orders';
import { requireUser } from '@/server/market/session';
import type { OrderKeyResponse } from '@/types/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    assertMarketEnabled();
    const user = await requireUser();
    const { id } = await context.params;

    const { order, listing } = await findOrder(id, user.id);

    // A buyer who lands here straight after paying should not have to wait
    // for the cron to notice.
    const current = order.status === 'pending' ? await settlePendingOrder(order) : order;

    if (current.status !== 'paid' && current.status !== 'released') {
      throw new ApiError('not_paid', 409, 'No payment has been credited to this order');
    }
    // Sold keys are kept, so this only fires for a listing whose key was never
    // written or was cleared by hand.
    if (!listing.encKey) {
      throw new ApiError('key_unavailable', 410, 'No key is stored for this listing');
    }

    if (current.status === 'paid') {
      await db()
        .update(schema.orders)
        .set({ status: 'released', releasedAt: new Date() })
        .where(and(eq(schema.orders.id, current.id), eq(schema.orders.status, 'paid')));

      await db()
        .update(schema.listings)
        .set({ status: 'sold', soldAt: new Date() })
        .where(eq(schema.listings.id, listing.id));
    }

    const privateKey = decryptSecret(listing.encKey, listing.id);
    const payload: OrderKeyResponse = {
      address: listing.address,
      privateKey: '0x' + etc.bytesToHex(privateKey),
    };
    privateKey.fill(0);

    return jsonOk(payload);
  }
);
