/**
 * ETH vanity Web Worker
 *
 * Compiled with esbuild to public/eth-worker.js
 *
 * Modes:
 * - wallet: grind secp256k1 keys until address matches
 * - contract: grind deployer keys until CREATE(address, nonce=0) matches
 *
 * SECURITY: Runs entirely in the browser. No network. Keys only leave via postMessage.
 */

import { getPublicKey, utils, etc } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';

type EthMode = 'wallet' | 'contract';

interface EthGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  mode: EthMode;
}

interface GeneratedEthResult {
  mode: EthMode;
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
  config?: EthGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedEthResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

function toAddress(pubUncompressed: Uint8Array): string {
  // Uncompressed = 0x04 || X(32) || Y(32); hash without prefix
  const hash = keccak_256(pubUncompressed.slice(1));
  return '0x' + etc.bytesToHex(hash.slice(-20));
}

/** CREATE address for deployer at nonce 0: keccak256(rlp([from, 0]))[12:] */
function contractAddressAtNonce0(from20: Uint8Array): string {
  const rlp = new Uint8Array(23);
  rlp[0] = 0xd6;
  rlp[1] = 0x94;
  rlp.set(from20, 2);
  rlp[22] = 0x80;
  return '0x' + etc.bytesToHex(keccak_256(rlp).slice(-20));
}

function matchesHexBody(
  address: string,
  prefix: string,
  suffix: string
): boolean {
  if (!prefix && !suffix) return true;
  const body = address.slice(2).toLowerCase();
  const p = prefix.toLowerCase();
  const s = suffix.toLowerCase();
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}

let isRunning = false;
let workerId = 0;

async function generateEthVanity(config: EthGeneratorConfig): Promise<void> {
  const prefix = (config.prefix || '').replace(/^0x/i, '');
  const suffix = (config.suffix || '').replace(/^0x/i, '');
  const mode = config.mode || 'wallet';
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 64;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const pub = getPublicKey(secret, false);
      const walletAddress = toAddress(pub);
      attempts++;

      let targetAddress = walletAddress;
      let deployerAddress: string | undefined;

      if (mode === 'contract') {
        const from20 = etc.hexToBytes(walletAddress.slice(2));
        targetAddress = contractAddressAtNonce0(from20);
        deployerAddress = walletAddress;
      }

      if (matchesHexBody(targetAddress, prefix, suffix)) {
        const duration = performance.now() - startTime;
        const result: GeneratedEthResult = {
          mode,
          address: targetAddress,
          privateKey: '0x' + etc.bytesToHex(secret),
          privateKeyBytes: secret,
          deployerAddress,
          attempts,
          duration,
          matchedPattern: `${prefix}...${suffix}`,
        };

        const message: WorkerOutboundMessage = {
          type: 'found',
          workerId,
          result,
          attempts,
          rate: attempts / (duration / 1000),
        };
        self.postMessage(message);
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
          await generateEthVanity(config);
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
    default:
      console.error('Unknown message type:', type);
  }
};

self.postMessage({ type: 'ready', workerId: 0 } satisfies WorkerOutboundMessage);
