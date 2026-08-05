import { assertMarketEnabled, handler, jsonOk } from '@/server/market/http';
import { findOrder, toOrderView } from '@/server/market/orders';
import { requireUser } from '@/server/market/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handler(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  assertMarketEnabled();
  const user = await requireUser();
  const { id } = await context.params;

  const { order, listing } = await findOrder(id, user.id);
  return jsonOk(toOrderView(order, listing.address));
});
