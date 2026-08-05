/** Browse the board, or list your own inventory across all states. */

import { assertMarketEnabled, handler, jsonOk } from '@/server/market/http';
import { queryListings, toListingSummary } from '@/server/market/listings';
import { currentUser } from '@/server/market/session';
import type { ListingPage, ListingStatus } from '@/types/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PUBLIC_STATUSES: ListingStatus[] = ['active', 'reserved', 'sold'];

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const value = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export const GET = handler(async (request: Request) => {
  assertMarketEnabled();

  const url = new URL(request.url);
  const mine = url.searchParams.get('mine') === '1';
  const viewer = await currentUser();

  const requested = url.searchParams.get('status') as ListingStatus | null;
  const status = mine
    ? (requested ?? undefined)
    : requested && PUBLIC_STATUSES.includes(requested)
      ? requested
      : 'active';

  const offset = clampInt(url.searchParams.get('offset'), 0, 0, 100_000);
  const limit = clampInt(url.searchParams.get('limit'), 24, 1, 60);

  // Drafts and withdrawn listings are only ever visible to their owner.
  if (mine && !viewer) {
    const empty: ListingPage = { items: [], total: 0, offset, limit };
    return jsonOk(empty);
  }

  const { rows, total } = await queryListings({
    status,
    sellerId: mine ? viewer!.id : undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    query: url.searchParams.get('q')?.slice(0, 64) ?? undefined,
    offset,
    limit,
  });

  const payload: ListingPage = {
    items: rows.map((row) => toListingSummary(row, viewer?.id ?? null)),
    total,
    offset,
    limit,
  };
  return jsonOk(payload);
});
