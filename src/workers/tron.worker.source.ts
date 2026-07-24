/**
 * Tron vanity Web Worker — Base58 T… addresses (secp256k1 + keccak)
 * Modes: wallet | contract (CREATE at nonce 0, same RLP as EVM)
 */

import { getPublicKey, utils, etc } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { tronAddressFromEth20 } from '../lib/address-encoding';

type TronMode = 'wallet' | 'contract';

interface TronGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  caseSensitive: boolean;
  mode?: TronMode;
}

interface GeneratedTronResult {
  mode: TronMode;
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  deployerAddress?: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: TronGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedTronResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

/** EVM CREATE(deployer, nonce=0) → last 20 bytes of keccak(RLP([from, 0])) */
function contractEth20AtNonce0(from20: Uint8Array): Uint8Array {
  const rlp = new Uint8Array(23);
  rlp[0] = 0xd6;
  rlp[1] = 0x94;
  rlp.set(from20, 2);
  rlp[22] = 0x80;
  return keccak_256(rlp).slice(-20);
}

function matches(
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): boolean {
  if (!prefix && !suffix) return true;
  // Mainnet addresses always start with T — auto-prepend so "RON" means TRON…
  let p = prefix || '';
  if (p && !p.startsWith('T')) p = `T${p}`;
  const s = suffix || '';
  if (caseSensitive) {
    return (!p || address.startsWith(p)) && (!s || address.endsWith(s));
  }
  const addr = address.toLowerCase();
  return (
    (!p || addr.startsWith(p.toLowerCase())) &&
    (!s || addr.endsWith(s.toLowerCase()))
  );
}

let isRunning = false;
let workerId = 0;

async function generateTronVanity(config: TronGeneratorConfig): Promise<void> {
  const prefix = config.prefix || '';
  const suffix = config.suffix || '';
  const caseSensitive = Boolean(config.caseSensitive);
  const mode: TronMode = config.mode === 'contract' ? 'contract' : 'wallet';
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 48;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const pub = getPublicKey(secret, false);
      const hash = keccak_256(pub.slice(1));
      const wallet20 = hash.slice(-20);
      const walletAddress = tronAddressFromEth20(wallet20);

      let address = walletAddress;
      let deployerAddress: string | undefined;
      if (mode === 'contract') {
        address = tronAddressFromEth20(contractEth20AtNonce0(wallet20));
        deployerAddress = walletAddress;
      }

      attempts++;

      if (matches(address, prefix, suffix, caseSensitive)) {
        const duration = performance.now() - startTime;
        const result: GeneratedTronResult = {
          mode,
          address,
          privateKey: etc.bytesToHex(secret),
          privateKeyBytes: secret,
          deployerAddress,
          attempts,
          duration,
          matchedPattern: `${prefix}...${suffix}`,
        };
        self.postMessage({
          type: 'found',
          workerId,
          result,
          attempts,
          rate: attempts / (duration / 1000),
        } satisfies WorkerOutboundMessage);
        isRunning = false;
        return;
      }
    }

    const now = performance.now();
    if (now - lastProgressUpdate >= progressInterval) {
      const elapsed = now - startTime;
      self.postMessage({
        type: 'progress',
        workerId,
        attempts,
        rate: attempts / (elapsed / 1000),
      } satisfies WorkerOutboundMessage);
      lastProgressUpdate = now;
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  self.postMessage({
    type: 'stopped',
    workerId,
    attempts,
  } satisfies WorkerOutboundMessage);
}

self.onmessage = async (event: MessageEvent<WorkerInboundMessage>) => {
  const { type, config, workerId: id } = event.data;
  switch (type) {
    case 'start':
      if (config && id !== undefined) {
        workerId = id;
        try {
          await generateTronVanity(config);
        } catch (err) {
          self.postMessage({
            type: 'error',
            workerId,
            error: err instanceof Error ? err.message : 'Unknown worker error',
          } satisfies WorkerOutboundMessage);
        }
      }
      break;
    case 'stop':
      isRunning = false;
      break;
  }
};

self.postMessage({ type: 'ready', workerId: 0 } satisfies WorkerOutboundMessage);
