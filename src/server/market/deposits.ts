/**
 * Per-order deposit addresses.
 *
 * Every order gets a fresh address derived from one BIP32 seed, so a payment
 * is matched by the address it landed on rather than by amount guessing or a
 * memo the buyer has to remember. It also means a buyer can pay straight from
 * an exchange withdrawal, without ever connecting a wallet.
 *
 * The deposit address also signs the onward transfer to the seller, so the
 * money never passes through a platform wallet. Index 0 stays unused.
 */

import { HDKey } from '@scure/bip32';
import { sql } from 'drizzle-orm';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { db, schema } from '@/server/db/client';
import { requiredEnv } from './config';

const ACCOUNT_PATH = "m/44'/60'/0'/0";
const FIRST_DEPOSIT_INDEX = 1;
const COUNTER_NAME = 'deposit_index';

function masterKey(): HDKey {
  const hex = requiredEnv('MARKET_HD_SEED').trim().replace(/^0x/i, '');
  if (hex.length < 32 || !/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error('MARKET_HD_SEED must be an even length hex string of at least 16 bytes');
  }
  return HDKey.fromMasterSeed(Buffer.from(hex, 'hex'));
}

function accountAt(index: number): PrivateKeyAccount {
  const derived = masterKey().derive(`${ACCOUNT_PATH}/${index}`);
  if (!derived.privateKey) throw new Error(`Could not derive key at index ${index}`);
  return privateKeyToAccount(`0x${Buffer.from(derived.privateKey).toString('hex')}`);
}

export function depositAccount(index: number): PrivateKeyAccount {
  if (!Number.isInteger(index) || index < FIRST_DEPOSIT_INDEX) {
    throw new Error('Deposit index must be a positive integer');
  }
  return accountAt(index);
}

/**
 * Reserve the next index. The upsert is a single statement so two concurrent
 * orders can never be handed the same address.
 */
export async function nextDepositIndex(): Promise<number> {
  const rows = await db()
    .insert(schema.counters)
    .values({ name: COUNTER_NAME, value: 1 })
    .onConflictDoUpdate({
      target: schema.counters.name,
      set: { value: sql`${schema.counters.value} + 1` },
    })
    .returning({ value: schema.counters.value });

  const index = rows[0]?.value;
  if (!index || index < FIRST_DEPOSIT_INDEX) throw new Error('Deposit counter is out of range');
  return index;
}
