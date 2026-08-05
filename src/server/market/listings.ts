/** Shared listing queries and the row to API shape mapping. */

import { and, desc, asc, eq, sql, type SQL } from 'drizzle-orm';
import { db, schema } from '@/server/db/client';
import { ApiError } from './http';
import type { ListingStatus, ListingSummary } from '@/types/market';

export interface ListingRow {
  listing: typeof schema.listings.$inferSelect;
  sellerAddress: string;
}

export function toListingSummary(row: ListingRow, viewerId: string | null): ListingSummary {
  const { listing } = row;
  return {
    id: listing.id,
    address: listing.address,
    pattern: listing.pattern,
    matchedPattern: listing.matchedPattern,
    difficultyBits: listing.difficultyBits === null ? null : Number(listing.difficultyBits),
    priceWei: listing.priceWei,
    status: listing.status as ListingStatus,
    origin: listing.origin as ListingSummary['origin'],
    sellerAddress: row.sellerAddress,
    isOwn: viewerId !== null && listing.sellerId === viewerId,
    listedAt: listing.listedAt?.toISOString() ?? null,
    createdAt: listing.createdAt.toISOString(),
  };
}

const SORTS: Record<string, SQL> = {
  newest: desc(schema.listings.listedAt),
  oldest: asc(schema.listings.listedAt),
  cheapest: asc(schema.listings.priceWei),
  dearest: desc(schema.listings.priceWei),
  rarest: desc(schema.listings.difficultyBits),
};

/**
 * Turn a search box into an address filter.
 *
 * People paste all sorts of things in here, so a leading `0x` and any stray
 * whitespace are dropped, and the wildcards Postgres would otherwise treat as
 * syntax are escaped. Anything that is not a hex character cannot appear in an
 * address, so a query containing one is answered with nothing rather than with
 * a confusing partial match.
 */
function addressFilter(raw: string): SQL | null {
  const term = raw.trim().toLowerCase().replace(/^0x/, '');
  if (!term) return null;
  if (!/^[0-9a-f]+$/.test(term)) return sql`false`;
  return sql`${schema.listings.address} like ${`%${term}%`}`;
}

export async function queryListings(opts: {
  status?: ListingStatus;
  sellerId?: string;
  sort?: string;
  query?: string;
  offset: number;
  limit: number;
}): Promise<{ rows: ListingRow[]; total: number }> {
  const filters: SQL[] = [];
  if (opts.status) filters.push(eq(schema.listings.status, opts.status));
  if (opts.sellerId) filters.push(eq(schema.listings.sellerId, opts.sellerId));

  if (opts.query) {
    const search = addressFilter(opts.query);
    if (search) filters.push(search);
  }

  const where = filters.length ? and(...filters) : undefined;

  const rows = await db()
    .select({ listing: schema.listings, sellerAddress: schema.users.address })
    .from(schema.listings)
    .innerJoin(schema.users, eq(schema.users.id, schema.listings.sellerId))
    .where(where)
    .orderBy(SORTS[opts.sort ?? 'newest'] ?? SORTS.newest)
    .limit(opts.limit)
    .offset(opts.offset);

  const counted = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.listings)
    .where(where);

  return { rows, total: counted[0]?.count ?? 0 };
}

export async function findListing(id: string): Promise<ListingRow> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError('not_found', 404);

  const rows = await db()
    .select({ listing: schema.listings, sellerAddress: schema.users.address })
    .from(schema.listings)
    .innerJoin(schema.users, eq(schema.users.id, schema.listings.sellerId))
    .where(eq(schema.listings.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) throw new ApiError('not_found', 404);
  return row;
}
