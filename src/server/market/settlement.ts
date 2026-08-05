/**
 * Settlement pass.
 *
 * Runs on a schedule and does four things: credit payments, expire stale
 * orders, forward completed sales to the seller, and return money that no sale
 * will ever use to the buyer who sent it.
 *
 * Every transfer goes straight from a one-time deposit address to one
 * recipient. There is no platform wallet in the middle, no commission, and no
 * float to keep topped up: the network fee is paid out of the funds being
 * moved, so the platform never spends anything of its own.
 */

import { and, eq, lt, or, sql } from 'drizzle-orm';
import { createWalletClient, http, type Hex } from 'viem';
import { db, schema } from '@/server/db/client';
import { activeChain, publicClient, rpcUrl } from './chain';
import { depositAccount } from './deposits';
import { payoutFee, transferGasLimit } from './gas';
import { settlePendingOrder } from './orders';

const MAX_ORDERS_PER_RUN = 5;
const MAX_PAYOUT_ATTEMPTS = 5;

export interface SettlementReport {
  credited: number;
  expired: number;
  /** Sales forwarded to sellers and refunds returned to buyers, together. */
  paidOut: number;
  failed: number;
}

/**
 * Walk every pending order. `settlePendingOrder` credits the ones that were
 * funded and writes off the ones whose window closed unpaid, so a late
 * payment that lands after expiry still counts.
 */
async function creditPayments(): Promise<{ credited: number; expired: number }> {
  const pending = await db()
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.status, 'pending'))
    .limit(50);

  let credited = 0;
  let expired = 0;
  for (const order of pending) {
    const settled = await settlePendingOrder(order);
    if (settled.status === 'paid') credited++;
    if (settled.status === 'expired') expired++;
  }
  return { credited, expired };
}

/**
 * Open a sale payout for every credited order that does not have one yet.
 *
 * Amounts are left open until the transfer is actually signed, because what
 * the seller receives depends on the fee quoted at that moment.
 */
async function openPayouts(): Promise<void> {
  const rows = await db()
    .select({ orderId: schema.orders.id, seller: schema.users })
    .from(schema.orders)
    .innerJoin(schema.listings, eq(schema.listings.id, schema.orders.listingId))
    .innerJoin(schema.users, eq(schema.users.id, schema.listings.sellerId))
    .leftJoin(schema.payouts, eq(schema.payouts.orderId, schema.orders.id))
    .where(
      and(
        or(eq(schema.orders.status, 'paid'), eq(schema.orders.status, 'released')),
        sql`${schema.payouts.id} is null`
      )
    )
    .limit(MAX_ORDERS_PER_RUN);

  for (const row of rows) {
    await db()
      .insert(schema.payouts)
      .values({
        orderId: row.orderId,
        kind: 'sale',
        recipient: row.seller.payoutAddress ?? row.seller.address,
      })
      .onConflictDoNothing({ target: schema.payouts.orderId });
  }
}

/**
 * Open a refund for money sitting on a deposit address that no sale will use.
 *
 * An order only expires once its window closed without the full price landing,
 * so anything on that address is either an underpayment or a transfer that
 * arrived too late. Either way it belongs to the buyer, and without this it
 * would sit there permanently.
 *
 * The destination is the wallet the buyer signed in with, not their payout
 * address: the payout address is where someone wants sale proceeds, which is
 * not necessarily where they want their own money back.
 */
async function openRefunds(): Promise<void> {
  const rows = await db()
    .select({ order: schema.orders, buyer: schema.users })
    .from(schema.orders)
    .innerJoin(schema.users, eq(schema.users.id, schema.orders.buyerId))
    .leftJoin(schema.payouts, eq(schema.payouts.orderId, schema.orders.id))
    .where(and(eq(schema.orders.status, 'expired'), sql`${schema.payouts.id} is null`))
    .orderBy(sql`${schema.orders.refundCheckedAt} asc nulls first`)
    .limit(MAX_ORDERS_PER_RUN);

  for (const row of rows) {
    const balance = await publicClient().getBalance({
      address: row.order.depositAddress as Hex,
    });

    await db()
      .update(schema.orders)
      .set({ refundCheckedAt: new Date() })
      .where(eq(schema.orders.id, row.order.id));

    if (balance === 0n) continue;

    await db()
      .insert(schema.payouts)
      .values({ orderId: row.order.id, kind: 'refund', recipient: row.buyer.address })
      .onConflictDoNothing({ target: schema.payouts.orderId });
  }
}

type PayoutRow = typeof schema.payouts.$inferSelect;

/** `waiting` means the money is in flight and the next run should look again. */
type PayoutOutcome = 'done' | 'failed' | 'skipped' | 'waiting';

/** How long a signed transfer may stay unmined before it is presumed dropped. */
const SENT_GRACE_MS = 10 * 60 * 1000;

/** How long one run waits at the RPC for a transfer to be mined. */
const RECEIPT_TIMEOUT_MS = 15_000;

async function markDone(payout: PayoutRow): Promise<void> {
  await db()
    .update(schema.payouts)
    .set({ status: 'done', settledAt: new Date() })
    .where(eq(schema.payouts.id, payout.id));
}

/**
 * Decide what happened to a transfer this run already signed.
 *
 * Every deposit address signs exactly one transfer in its life, so its nonce
 * is the reliable tell: still zero and no receipt means nothing landed and
 * re-sending is safe. Without that check a dropped transaction would either
 * strand the sale forever or get paid out twice.
 */
async function resumeSentPayout(payout: PayoutRow, deposit: Hex): Promise<PayoutOutcome> {
  const hash = payout.payoutTxHash as Hex;
  const receipt = await publicClient()
    .waitForTransactionReceipt({ hash, timeout: RECEIPT_TIMEOUT_MS })
    .catch(() => null);

  if (receipt?.status === 'success') {
    await markDone(payout);
    return 'done';
  }

  if (receipt) {
    // Mined and reverted. The fee is gone, the value never moved. Clearing the
    // hash lets the next run re-quote against the balance that is left.
    await db()
      .update(schema.payouts)
      .set({
        payoutTxHash: null,
        sellerAmountWei: null,
        gasWei: null,
        status: 'pending',
        lastError: `transfer reverted (${hash})`,
      })
      .where(eq(schema.payouts.id, payout.id));
    return 'failed';
  }

  const nonce = await publicClient().getTransactionCount({ address: deposit, blockTag: 'latest' });
  const staleFor = Date.now() - (payout.settledAt?.getTime() ?? payout.createdAt.getTime());
  if (nonce === 0 && staleFor > SENT_GRACE_MS) {
    await db()
      .update(schema.payouts)
      .set({ payoutTxHash: null, sellerAmountWei: null, gasWei: null, status: 'pending' })
      .where(eq(schema.payouts.id, payout.id));
    return 'failed';
  }

  return 'waiting';
}

/**
 * Send the deposit balance on to the seller, less the fee for that one
 * transfer.
 *
 * Whatever the buyer sent is forwarded, so an overpayment ends up with the
 * seller rather than stranded. The reserve is an upper bound, which leaves a
 * little dust on the deposit address; recovering it would cost another full
 * transfer, so it stays there.
 */
async function processPayout(payout: PayoutRow): Promise<PayoutOutcome> {
  const rows = await db()
    .select({ order: schema.orders })
    .from(schema.orders)
    .where(eq(schema.orders.id, payout.orderId))
    .limit(1);

  const row = rows[0];
  if (!row || !payout.recipient) return 'failed';

  const recipient = payout.recipient as Hex;
  const deposit = depositAccount(row.order.depositIndex);

  if (payout.payoutTxHash) return await resumeSentPayout(payout, deposit.address);

  const balance = await publicClient().getBalance({ address: deposit.address });
  const gasLimit = await transferGasLimit(deposit.address, recipient);
  const { pinned, reserveWei } = await payoutFee(gasLimit);
  if (balance <= reserveWei) return 'skipped';

  const value = balance - reserveWei;
  const wallet = createWalletClient({
    account: deposit,
    chain: activeChain(),
    transport: http(rpcUrl()),
  });

  const payoutTxHash =
    pinned.kind === 'legacy'
      ? await wallet.sendTransaction({
          to: recipient,
          value,
          gas: gasLimit,
          gasPrice: pinned.gasPrice,
        })
      : await wallet.sendTransaction({
          to: recipient,
          value,
          gas: gasLimit,
          maxFeePerGas: pinned.maxFeePerGas,
          maxPriorityFeePerGas: pinned.maxPriorityFeePerGas,
        });

  // Recorded before the receipt is awaited. If this run dies here, the next
  // one finds the hash and resolves it rather than signing a second transfer.
  await db()
    .update(schema.payouts)
    .set({
      payoutTxHash,
      sellerAmountWei: value.toString(),
      gasWei: reserveWei.toString(),
      status: 'sent',
      settledAt: new Date(),
    })
    .where(eq(schema.payouts.id, payout.id));

  return await resumeSentPayout({ ...payout, payoutTxHash, settledAt: new Date() }, deposit.address);
}

async function runPayouts(): Promise<{ paidOut: number; failed: number }> {
  const open = await db()
    .select()
    .from(schema.payouts)
    .where(
      and(
        or(eq(schema.payouts.status, 'pending'), eq(schema.payouts.status, 'sent')),
        lt(schema.payouts.attempts, MAX_PAYOUT_ATTEMPTS)
      )
    )
    .limit(MAX_ORDERS_PER_RUN);

  let paidOut = 0;
  let failed = 0;

  for (const payout of open) {
    try {
      const outcome = await processPayout(payout);
      if (outcome === 'done') paidOut++;

      // Only a real attempt to move money counts against the retry budget. A
      // run that skipped, or that is still waiting on a receipt, must not be
      // able to exhaust it and strand the sale.
      if (outcome === 'done' || outcome === 'failed') {
        await db()
          .update(schema.payouts)
          .set({ attempts: payout.attempts + 1 })
          .where(eq(schema.payouts.id, payout.id));
      }

      if (outcome === 'failed') failed++;
    } catch (err) {
      failed++;
      const attempts = payout.attempts + 1;
      await db()
        .update(schema.payouts)
        .set({
          attempts,
          lastError: err instanceof Error ? err.message.slice(0, 500) : 'unknown error',
          status: attempts >= MAX_PAYOUT_ATTEMPTS ? 'failed' : payout.status,
        })
        .where(eq(schema.payouts.id, payout.id));
    }
  }

  return { paidOut, failed };
}

export async function runSettlement(): Promise<SettlementReport> {
  const { credited, expired } = await creditPayments();
  await openPayouts();
  await openRefunds();
  const { paidOut, failed } = await runPayouts();

  return { credited, expired, paidOut, failed };
}
