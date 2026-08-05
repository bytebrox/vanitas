/**
 * Gas accounting for payouts.
 *
 * The marketplace takes no commission, which means there is no margin to pay
 * network fees out of. Every transfer the platform signs therefore has to fund
 * itself from the money it is moving, and it must do so without ever going a
 * wei over the balance it has available.
 *
 * The trick is to pin the fee on the transaction instead of letting the wallet
 * re-quote it at send time. Once `maxFeePerGas` is fixed, the protocol
 * guarantees the transfer cannot cost more than `gas * maxFeePerGas`, so that
 * product is an exact upper bound and can be reserved up front.
 */

import type { Hex } from 'viem';
import { publicClient } from './chain';

/** A transfer between two plain accounts costs exactly this much gas. */
export const TRANSFER_GAS = 21_000n;

/**
 * Ceiling on the gas limit for one payout.
 *
 * A recipient whose receive hook is more expensive than this is not worth
 * paying out to automatically: the reserve would eat a visible share of the
 * sale. Such a payout is skipped and surfaces as an open record instead.
 */
const MAX_TRANSFER_GAS = 200_000n;

/**
 * Gas limit for moving the balance of `from` to `to`.
 *
 * 21000 is only correct when the recipient is a plain account. A contract
 * wallet, or a plain account carrying an EIP-7702 delegation, runs code on
 * receipt and needs more, and a transfer pinned to 21000 would revert out of
 * gas and burn the fee without moving anything. So the limit is measured
 * against the actual recipient.
 */
export async function transferGasLimit(from: Hex, to: Hex): Promise<bigint> {
  // Probing with 1 wei keeps the estimate affordable no matter what the
  // deposit holds; the eventual value differs, the code path does not.
  const estimate = await publicClient()
    .estimateGas({ account: from, to, value: 1n })
    .catch(() => null);

  if (estimate === null || estimate <= TRANSFER_GAS) return TRANSFER_GAS;

  const padded = (estimate * 3n) / 2n;
  return padded > MAX_TRANSFER_GAS ? MAX_TRANSFER_GAS : padded;
}

/**
 * Headroom on top of the quoted fee.
 *
 * A transaction whose `maxFeePerGas` falls below the base fee before it is
 * mined sits in the mempool and blocks the sending account's nonce, which is a
 * far worse outcome than leaving dust behind. On an L2 the absolute amounts are
 * fractions of a cent either way.
 */
const HEADROOM = 2n;

export interface PayoutFee {
  /**
   * Pinned on the transaction. Either EIP-1559 fields or a legacy gas price,
   * depending on what the chain quotes.
   */
  pinned:
    | { kind: 'eip1559'; maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }
    | { kind: 'legacy'; gasPrice: bigint };
  /** Exact upper bound on what a transfer at this fee and limit can cost. */
  reserveWei: bigint;
}

/**
 * Quote the fee for one transfer and the reserve it implies.
 *
 * `gasLimit` has to be the same value that ends up pinned on the transaction,
 * otherwise the reserve stops being an upper bound.
 */
export async function payoutFee(gasLimit: bigint = TRANSFER_GAS): Promise<PayoutFee> {
  const client = publicClient();
  const quote = await client.estimateFeesPerGas().catch(() => null);

  if (quote?.maxFeePerGas) {
    const maxFeePerGas = quote.maxFeePerGas * HEADROOM;
    return {
      pinned: {
        kind: 'eip1559',
        maxFeePerGas,
        // Cannot exceed the cap, or the node rejects the transaction outright.
        maxPriorityFeePerGas:
          quote.maxPriorityFeePerGas && quote.maxPriorityFeePerGas < maxFeePerGas
            ? quote.maxPriorityFeePerGas
            : maxFeePerGas,
      },
      reserveWei: maxFeePerGas * gasLimit,
    };
  }

  const gasPrice = (quote?.gasPrice ?? (await client.getGasPrice())) * HEADROOM;
  return {
    pinned: { kind: 'legacy', gasPrice },
    reserveWei: gasPrice * gasLimit,
  };
}

/**
 * What a payout would withhold right now, for display before a sale exists.
 *
 * Returns null when the chain cannot be reached: an unavailable estimate is
 * worth leaving out of the UI, not worth failing a page load over.
 */
export async function payoutReserveEstimate(): Promise<string | null> {
  try {
    return (await payoutFee()).reserveWei.toString();
  } catch {
    return null;
  }
}
