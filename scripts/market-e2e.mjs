/**
 * End to end rehearsal of a marketplace sale against a running server.
 *
 * Drives the same HTTP API the browser uses, so it exercises sign in, split
 * key grinding, listing, ordering, payment, settlement and key delivery
 * exactly as a real pair of users would. The only thing it fakes is the
 * wallet: instead of MetaMask it signs with a local key.
 *
 * The final assertion is the one that matters. It takes the private key the
 * buyer was handed, derives an address from it, and checks that address is the
 * one that was advertised. If that holds, the split key scheme delivered.
 *
 *   node scripts/market-e2e.mjs
 *
 * Needs a funded account on the testnet to play the buyer. Run it once without
 * funds and it prints the address to top up from the faucet, then stops.
 */

import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, createWalletClient, formatEther, http, parseEther } from 'viem';
import { defineChain } from 'viem';
import { getPublicKey, etc } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';

const BASE = process.env.E2E_BASE ?? 'http://localhost:3000';
const API = `${BASE}/api/market`;
const RPC = process.env.ROBINHOOD_RPC_URL ?? 'https://rpc.testnet.chain.robinhood.com';

/**
 * Fixed phrase so the funding account is the same on every run. This is a
 * throwaway test identity on a testnet and holds nothing of value.
 */
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

const PRICE = parseEther(process.env.E2E_PRICE_ETH ?? '0.0005');
/** Short enough to hit in a second or two on one core. */
const PATTERN = 'ab';

let step = 0;
const log = (message) => {
  console.log(`\n[${++step}] ${message}`);
};
const detail = (label, value) => {
  console.log(`    ${label.padEnd(16)} ${value}`);
};

class Actor {
  constructor(name) {
    this.name = name;
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
      throw new Error(
        `${method} ${path} -> ${response.status} ${JSON.stringify(payload?.error ?? payload)}`
      );
    }
    return payload?.data ?? payload;
  }

  /** Full EIP-4361 round trip, signing with the local key. */
  async signIn() {
    const { nonce, message } = await this.call('/auth/nonce', {
      method: 'POST',
      body: { address: this.account.address },
    });
    const signature = await this.account.signMessage({ message });
    await this.call('/auth/verify', { method: 'POST', body: { nonce, signature } });
  }
}

function addressFromPoint(pointBytes) {
  return `0x${etc.bytesToHex(keccak_256(pointBytes.slice(1)).slice(-20))}`.toLowerCase();
}

/**
 * Grind a client half b such that address(b*G + S) starts with the pattern.
 *
 * Mirrors the browser worker: the server half never appears here, only the
 * point S, which is exactly the property the whole scheme rests on.
 */
async function grind(serverPointHex, pattern) {
  const { Point } = await import('@noble/secp256k1');
  const S = Point.fromHex(serverPointHex);
  const target = pattern.toLowerCase();

  for (let attempts = 1; ; attempts++) {
    const half = etc.randomBytes(32);
    let point;
    try {
      point = Point.BASE.multiply(etc.bytesToNumberBE(half)).add(S);
    } catch {
      continue;
    }
    const address = addressFromPoint(point.toBytes(false));
    if (address.slice(2).startsWith(target)) {
      return { clientHalf: etc.bytesToHex(half), address, attempts };
    }
  }
}

async function main() {
  console.log('Robinhood testnet marketplace rehearsal');
  detail('server', BASE);
  detail('rpc', RPC);

  const funder = mnemonicToAccount(FUNDER_PHRASE);
  const funderBalance = await publicClient.getBalance({ address: funder.address });
  detail('funder', funder.address);
  detail('funder balance', `${formatEther(funderBalance)} ETH`);

  const needed = PRICE + parseEther('0.0001');
  if (funderBalance < needed) {
    console.log(
      [
        '',
        'Not enough testnet ETH to play the buyer.',
        '',
        `  Send at least ${formatEther(needed)} ETH to:`,
        `    ${funder.address}`,
        '',
        '  Faucet: https://faucet.testnet.chain.robinhood.com/',
        '',
        'Then run this script again and it will drive the whole sale by itself.',
      ].join('\n')
    );
    process.exit(2);
  }

  log('Seller signs in');
  const seller = new Actor('seller');
  await seller.signIn();
  detail('seller', seller.account.address);

  log('Seller opens a grinding session');
  const session = await seller.call('/forge/session', {
    method: 'POST',
    body: { pattern: PATTERN },
  });
  detail('server point', session.serverPoint);

  log(`Grinding for a 0x${PATTERN}… address`);
  const found = await grind(session.serverPoint, PATTERN);
  detail('address', found.address);
  detail('attempts', found.attempts);

  log('Seller redeems the session into a draft listing');
  let listing = await seller.call('/forge/submit', {
    method: 'POST',
    body: {
      sessionId: session.sessionId,
      clientHalf: found.clientHalf,
      address: found.address,
      matchedPattern: PATTERN,
      attempts: found.attempts,
    },
  });
  detail('listing', listing.id);
  detail('status', listing.status);

  log('Seller prices and publishes it');
  listing = await seller.call(`/listings/${listing.id}`, {
    method: 'PATCH',
    body: { priceWei: PRICE.toString(), status: 'active' },
  });
  detail('price', `${formatEther(BigInt(listing.priceWei))} ETH`);
  detail('status', listing.status);

  log('Seller points payouts at a fresh address');
  const payoutTo = privateKeyToAccount(`0x${etc.bytesToHex(etc.randomBytes(32))}`).address;
  await seller.call('/auth/session', {
    method: 'PATCH',
    body: { payoutAddress: payoutTo.toLowerCase() },
  });
  detail('payout to', payoutTo);

  log('Buyer signs in and places an order');
  const buyer = new Actor('buyer');
  await buyer.signIn();
  const order = await buyer.call('/orders', {
    method: 'POST',
    body: { listingId: listing.id },
  });
  detail('order', order.id);
  detail('deposit', order.depositAddress);
  detail('amount', `${formatEther(BigInt(order.amountWei))} ETH`);

  log('Buyer pays');
  const wallet = createWalletClient({ account: funder, chain, transport: http(RPC) });
  const paymentHash = await wallet.sendTransaction({
    to: order.depositAddress,
    value: BigInt(order.amountWei),
  });
  await publicClient.waitForTransactionReceipt({ hash: paymentHash });
  detail('payment tx', paymentHash);

  log('Buyer asks for an immediate check');
  const checked = await buyer.call(`/orders/${order.id}/check`, { method: 'POST' });
  detail('status', checked.status);
  if (checked.status !== 'paid' && checked.status !== 'released') {
    throw new Error(`order did not credit, status is ${checked.status}`);
  }

  log('Buyer collects the key');
  const delivered = await buyer.call(`/orders/${order.id}/key`, { method: 'POST' });
  detail('address', delivered.address);
  detail('key', `${delivered.privateKey.slice(0, 12)}…`);

  log('Verifying the key really controls that address');
  const derived = addressFromPoint(
    getPublicKey(etc.hexToBytes(delivered.privateKey.replace(/^0x/, '')), false)
  );
  if (derived !== delivered.address.toLowerCase()) {
    throw new Error(`key derives ${derived}, listing advertised ${delivered.address}`);
  }
  console.log('    key matches the advertised address');

  log('Buyer fetches it a second time from their account');
  const orders = await buyer.call('/orders');
  const again = await buyer.call(`/orders/${order.id}/key`, { method: 'POST' });
  detail('orders listed', orders.length);
  detail('same key', String(again.privateKey === delivered.privateKey));

  log('Running settlement so the seller gets paid');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.log('    CRON_SECRET not in the environment, skipping. Run the cron by hand.');
  } else {
    const report = await fetch(`${BASE}/api/cron/market-settle`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    }).then((r) => r.json());
    detail('report', JSON.stringify(report?.data ?? report));
  }

  for (let i = 0; i < 20; i++) {
    const balance = await publicClient.getBalance({ address: payoutTo });
    if (balance > 0n) {
      log('Seller received the money');
      detail('payout', `${formatEther(balance)} ETH`);
      detail('of price', `${formatEther(PRICE)} ETH`);
      detail('gas kept', `${formatEther(PRICE - balance)} ETH`);
      console.log('\nPASS: the whole round trip works.\n');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error('seller payout never landed');
}

main().catch((err) => {
  console.error(`\nFAIL: ${err.message}\n`);
  process.exit(1);
});
