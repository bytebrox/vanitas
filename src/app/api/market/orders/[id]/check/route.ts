/**
 * On-demand payment check.
 *
 * The settlement cron does the same work on a schedule; this endpoint exists
 * so a buyer who just sent the transaction does not have to wait for it.
 */

import { assertMarketEnabled, handler, jsonOk } from '@/server/market/http';
import { findOrder, settlePendingOrder, toOrderView } from '@/server/market/orders';
import { requireUser } from '@/server/market/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    assertMarketEnabled();
    const user = await requireUser();
    const { id } = await context.params;

    const { order, listing } = await findOrder(id, user.id);
    const settled = await settlePendingOrder(order);

    return jsonOk(toOrderView(settled, listing.address));
  }
);
