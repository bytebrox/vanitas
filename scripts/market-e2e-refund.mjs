/**
 * Rehearsal of the refund path.
 *
 * A buyer sends less than the price and the window closes. Nothing was sold,
 * so the money has to find its way back rather than sit on a deposit address
 * nobody will ever touch again.
 *
 * The order window is an hour, which is too long to wait for, so the expiry is
 * moved into the past directly in the database. Everything else is the real
 * code path: the cron notices the expiry, opens a refund and signs it.
 *
 *   node scripts/market-e2e-refund.mjs
 */

import { neon } from '@neondatabase/serverless';
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, createWalletClient, defineChain, formatEther, http, parseEther } from 'viem';
import { etc, Point } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';

process.loadEnvFile('.env.local');

const BASE = process.env.E2E_BASE ?? 'http://localhost:3000';
const API = `${BASE}/api/market`;
const RPC = process.env.ROBINHOOD_RPC_URL || 'https://rpc.testnet.chain.robinhood.com';
const FUNDER_PHRASE =
  process.env.E2E_FUNDER_PHRASE ??
  'test test test test test test test test test test test junk';

const chain = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  testnet: true,
});

const publicClient = createPublicClient({ chain, transport: http(RPC) });
const sql = neon(process.env.DATABASE_URL);

const PRICE = parseEther('0.0004');
/** Deliberately short of the price, which is what makes this a refund. */
const UNDERPAY = parseEther('0.0002');

let step = 0;
const log = (m) => console.log(`\n[${++step}] ${m}`);
const detail = (l, v) => console.log(`    ${l.padEnd(16)} ${v}`);

class Actor {
  constructor() {
    this.account = privateKeyToAccount(`0x${etc.bytesToHex(etc.randomBytes(32))}`);
    this.cookie = null;
  }

  async call(path, { method = 'GET', body } = {}) {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) this.cookie = setCookie.split(';')[0];
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`${method} ${path} -> ${response.status} ${JSON.stringify(payload?.error)}`);
    }
    return payload?.data ?? payload;
  }

  async signIn() {
    const { nonce, message } = await this.call('/auth/nonce', {
      method: 'POST',
      body: { address: this.account.address },
    });
    const signature = await this.account.signMessage({ message });
    await this.call('/auth/verify', { method: 'POST', body: { nonce, signature } });
  }
}

const addressFromPoint = (bytes) =>
  `0x${etc.bytesToHex(keccak_256(bytes.slice(1)).slice(-20))}`.toLowerCase();

function grind(serverPointHex, pattern) {
  const S = Point.fromHex(serverPointHex);
  for (let attempts = 1; ; attempts++) {
    const half = etc.randomBytes(32);
    let point;
    try {
      point = Point.BASE.multiply(etc.bytesToNumberBE(half)).add(S);
    } catch {
      continue;
    }
    const address = addressFromPoint(point.toBytes(false));
    if (address.slice(2).startsWith(pattern)) {
      return { clientHalf: etc.bytesToHex(half), address, attempts };
    }
  }
}

async function main() {
  console.log('Refund rehearsal on the Robinhood testnet');

  const funder = mnemonicToAccount(FUNDER_PHRASE);
  const balance = await publicClient.getBalance({ address: funder.address });
  detail('funder', funder.address);
  detail('balance', `${formatEther(balance)} ETH`);
  if (balance < UNDERPAY + parseEther('0.0001')) {
    console.log('\nNot enough testnet ETH. Top up the funder and retry.\n');
    process.exit(2);
  }

  log('Seller lists an address');
  const seller = new Actor();
  await seller.signIn();
  const session = await seller.call('/forge/session', { method: 'POST', body: { pattern: 'c' } });
  const found = grind(session.serverPoint, 'c');
  const draft = await seller.call('/forge/submit', {
    method: 'POST',
    body: {
      sessionId: session.sessionId,
      clientHalf: found.clientHalf,
      address: found.address,
      matchedPattern: 'c',
      attempts: found.attempts,
    },
  });
  await seller.call(`/listings/${draft.id}`, {
    method: 'PATCH',
    body: { priceWei: PRICE.toString(), status: 'active' },
  });
  detail('address', found.address);
  detail('price', `${formatEther(PRICE)} ETH`);

  log('Buyer orders and then underpays');
  const buyer = new Actor();
  await buyer.signIn();
  const order = await buyer.call('/orders', { method: 'POST', body: { listingId: draft.id } });
  detail('deposit', order.depositAddress);
  detail('refund goes to', buyer.account.address);

  const wallet = createWalletClient({ account: funder, chain, transport: http(RPC) });
  const hash = await wallet.sendTransaction({ to: order.depositAddress, value: UNDERPAY });
  await publicClient.waitForTransactionReceipt({ hash });
  detail('sent', `${formatEther(UNDERPAY)} ETH of ${formatEther(PRICE)} ETH`);

  log('Closing the payment window by hand');
  await sql`update orders set expires_at = now() - interval '1 minute' where id = ${order.id}`;

  log('Running settlement');
  const cronSecret = process.env.CRON_SECRET;
  const report = await fetch(`${BASE}/api/cron/market-settle`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  }).then((r) => r.json());
  detail('report', JSON.stringify(report?.data ?? report));

  log('Second pass, so the refund opened above gets signed');
  const second = await fetch(`${BASE}/api/cron/market-settle`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  }).then((r) => r.json());
  detail('report', JSON.stringify(second?.data ?? second));

  for (let i = 0; i < 20; i++) {
    const refunded = await publicClient.getBalance({ address: buyer.account.address });
    if (refunded > 0n) {
      log('Buyer got the money back');
      detail('refunded', `${formatEther(refunded)} ETH`);
      detail('sent', `${formatEther(UNDERPAY)} ETH`);
      detail('gas kept', `${formatEther(UNDERPAY - refunded)} ETH`);

      const rows = await sql`select status, kind from payouts where order_id = ${order.id}`;
      detail('payout row', JSON.stringify(rows[0]));
      console.log('\nPASS: an underpayment finds its way home.\n');
      return;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error('refund never landed');
}

main().catch((err) => {
  console.error(`\nFAIL: ${err.message}\n`);
  process.exit(1);
});
