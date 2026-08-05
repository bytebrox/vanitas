/** Chain and pricing parameters the browser needs before anything else. */

import { publicChainInfo } from '@/server/market/chain';
import { ORDER_TTL_MS, maxPriceWei, minPriceWei } from '@/server/market/config';
import { payoutReserveEstimate } from '@/server/market/gas';
import { handler, jsonOk } from '@/server/market/http';
import type { MarketConfigResponse } from '@/types/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  const payload: MarketConfigResponse = {
    chain: publicChainInfo(),
    minPriceWei: minPriceWei().toString(),
    maxPriceWei: maxPriceWei().toString(),
    orderTtlMs: ORDER_TTL_MS,
    payoutReserveWei: await payoutReserveEstimate(),
  };
  return jsonOk(payload);
});
