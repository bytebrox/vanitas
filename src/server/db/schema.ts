/**
 * Marketplace schema.
 *
 * Wei amounts are stored as numeric strings rather than bigint columns so the
 * serverless driver never has to round trip through JavaScript numbers.
 */

import {
  bigint,
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    address: text('address').notNull(),
    payoutAddress: text('payout_address'),
    isAdmin: boolean('is_admin').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    addressIdx: uniqueIndex('users_address_idx').on(table.address),
  })
);

/**
 * The full sign-in message is stored rather than rebuilt on verification, so
 * the signature is always checked against the exact bytes that were issued.
 */
export const authNonces = pgTable(
  'auth_nonces',
  {
    nonce: text('nonce').primaryKey(),
    address: text('address').notNull(),
    message: text('message').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
  },
  (table) => ({
    expiryIdx: index('auth_nonces_expiry_idx').on(table.expiresAt),
  })
);

/**
 * One grinding session. `encServerHalf` holds the encrypted scalar s; the
 * browser only ever receives the corresponding point S.
 */
export const forgeSessions = pgTable(
  'forge_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    encServerHalf: text('enc_server_half').notNull(),
    serverPoint: text('server_point').notNull(),
    pattern: text('pattern').notNull().default(''),
    status: text('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    userIdx: index('forge_sessions_user_idx').on(table.userId),
    expiryIdx: index('forge_sessions_expiry_idx').on(table.expiresAt),
  })
);

/**
 * `encKey` is the encrypted full private key (b + s mod n), written once when
 * the grinding session is redeemed.
 *
 * It is kept after a sale rather than purged: the buyer paid for it and can
 * fetch it again from their account for as long as the account exists. That is
 * a deliberate trade of exposure for recoverability, and the reason a buyer is
 * told to move the funds to a key only they hold.
 */
export const listings = pgTable(
  'listings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    address: text('address').notNull(),
    pattern: text('pattern').notNull().default(''),
    matchedPattern: text('matched_pattern').notNull().default(''),
    difficultyBits: numeric('difficulty_bits', { precision: 12, scale: 4 }),
    attempts: bigint('attempts', { mode: 'bigint' }),
    priceWei: numeric('price_wei', { precision: 78, scale: 0 }),
    encKey: text('enc_key'),
    status: text('status').notNull().default('draft'),
    origin: text('origin').notNull().default('user'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    listedAt: timestamp('listed_at', { withTimezone: true }),
    soldAt: timestamp('sold_at', { withTimezone: true }),
  },
  (table) => ({
    addressIdx: uniqueIndex('listings_address_idx').on(table.address),
    statusIdx: index('listings_status_idx').on(table.status),
    sellerIdx: index('listings_seller_idx').on(table.sellerId),
  })
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'restrict' }),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    depositIndex: integer('deposit_index').notNull(),
    depositAddress: text('deposit_address').notNull(),
    amountWei: numeric('amount_wei', { precision: 78, scale: 0 }).notNull(),
    status: text('status').notNull().default('pending'),
    paidTxHash: text('paid_tx_hash'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    /**
     * Last time an expired order's deposit was checked for a stray payment.
     * Ordering the refund sweep by this column round robins over every expired
     * order, so a batch limit cannot starve the ones further down the list.
     */
    refundCheckedAt: timestamp('refund_checked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    depositIdx: uniqueIndex('orders_deposit_index_idx').on(table.depositIndex),
    statusIdx: index('orders_status_idx').on(table.status),
    listingIdx: index('orders_listing_idx').on(table.listingId),
    buyerIdx: index('orders_buyer_idx').on(table.buyerId),
  })
);

export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    /**
     * `sale` forwards a completed purchase to the seller. `refund` returns
     * money that reached a deposit address the sale never used, which is what
     * an underpayment or a payment after expiry leaves behind. Both move the
     * balance of one deposit address to one recipient, so they share a row
     * shape and a state machine.
     */
    kind: text('kind').notNull().default('sale'),
    /** Resolved when the row is opened so the transfer path stays uniform. */
    recipient: text('recipient'),
    // Both are written when the transfer is signed, not when the payout is
    // opened: what the recipient receives depends on the fee quoted at that
    // moment, and the platform adds nothing on top.
    sellerAmountWei: numeric('seller_amount_wei', { precision: 78, scale: 0 }),
    gasWei: numeric('gas_wei', { precision: 78, scale: 0 }),
    payoutTxHash: text('payout_tx_hash'),
    status: text('status').notNull().default('pending'),
    lastError: text('last_error'),
    attempts: integer('attempts').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    settledAt: timestamp('settled_at', { withTimezone: true }),
  },
  (table) => ({
    orderIdx: uniqueIndex('payouts_order_idx').on(table.orderId),
    statusIdx: index('payouts_status_idx').on(table.status),
  })
);

/** Monotonic counter backing HD deposit address derivation. */
export const counters = pgTable('counters', {
  name: text('name').primaryKey(),
  value: integer('value').notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type ForgeSession = typeof forgeSessions.$inferSelect;
