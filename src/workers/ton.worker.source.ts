/**
 * TON vanity Web Worker — Wallet v4R2 (UQ / EQ)
 */

import { Buffer } from 'buffer';
import { yieldToEventLoop } from './yield';
import { getPublicKey, utils, etc, hashes } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { WalletContractV4 } from '@ton/ton';

// @ton/core uses the free global `Buffer` (Buffer.alloc / .copy). In the
// browser worker there is no Node Buffer — pin the polyfill once up front.
(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

hashes.sha512 = sha512;

type TonMode = 'non-bounceable' | 'bounceable';

interface TonGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  mode?: TonMode;
}

interface GeneratedTonResult {
  mode: TonMode;
  address: string;
  bounceableAddress: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: TonGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedTonResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

function matches(
  address: string,
  prefix: string,
  suffix: string,
  mode: TonMode
): boolean {
  if (!prefix && !suffix) return true;
  let p = prefix || '';
  if (p && !p.startsWith('UQ') && !p.startsWith('EQ')) {
    p = (mode === 'bounceable' ? 'EQ' : 'UQ') + p;
  }
  return (
    (!p || address.startsWith(p)) &&
    (!suffix || address.endsWith(suffix))
  );
}

let isRunning = false;
let workerId = 0;

async function generateTonVanity(config: TonGeneratorConfig): Promise<void> {
  const prefix = config.prefix || '';
  const suffix = config.suffix || '';
  const mode: TonMode = config.mode === 'bounceable' ? 'bounceable' : 'non-bounceable';
  const bounceable = mode === 'bounceable';
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 24;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const pub = getPublicKey(secret);
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: Buffer.from(pub),
      });
      const uq = wallet.address.toString({ urlSafe: true, bounceable: false });
      const eq = wallet.address.toString({ urlSafe: true, bounceable: true });
      const address = bounceable ? eq : uq;
      attempts++;

      if (matches(address, prefix, suffix, mode)) {
        const duration = performance.now() - startTime;
        const result: GeneratedTonResult = {
          mode,
          address,
          bounceableAddress: eq,
          privateKey: '0x' + etc.bytesToHex(secret),
          privateKeyBytes: secret,
          publicKey: '0x' + etc.bytesToHex(pub),
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

    await yieldToEventLoop();
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
          await generateTonVanity(config);
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
