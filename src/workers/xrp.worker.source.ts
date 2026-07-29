/**
 * XRPL classic vanity Web Worker — `r…` addresses (secp256k1)
 */

import { getPublicKey, utils, etc } from '@noble/secp256k1';
import { yieldToEventLoop } from './yield';
import { xrpClassicAddress } from '../lib/address-encoding';

interface XrpGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  caseSensitive: boolean;
}

interface GeneratedXrpResult {
  address: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: XrpGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedXrpResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

function matches(
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): boolean {
  if (!prefix && !suffix) return true;
  let p = prefix || '';
  if (p && !p.startsWith('r')) p = `r${p}`;
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

async function generateXrpVanity(config: XrpGeneratorConfig): Promise<void> {
  const prefix = config.prefix || '';
  const suffix = config.suffix || '';
  const caseSensitive = Boolean(config.caseSensitive);
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 64;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const pub = getPublicKey(secret, true);
      const address = xrpClassicAddress(pub);
      attempts++;

      if (matches(address, prefix, suffix, caseSensitive)) {
        const duration = performance.now() - startTime;
        const result: GeneratedXrpResult = {
          address,
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
          await generateXrpVanity(config);
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
