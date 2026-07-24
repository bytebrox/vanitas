/**
 * Bitcoin vanity Web Worker
 * Modes: legacy (1…) P2PKH · segwit (bc1q…) P2WPKH
 */

import { getPublicKey, utils, etc } from '@noble/secp256k1';
import {
  btcLegacyAddress,
  btcSegwitAddress,
  btcWifCompressed,
} from '../lib/address-encoding';

type BtcMode = 'legacy' | 'segwit';

interface BtcGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
  mode: BtcMode;
  caseSensitive: boolean;
}

interface GeneratedBtcResult {
  mode: BtcMode;
  address: string;
  privateKeyHex: string;
  privateKeyWif: string;
  privateKeyBytes: Uint8Array;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: BtcGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedBtcResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

function matches(
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean,
  mode: BtcMode
): boolean {
  if (!prefix && !suffix) return true;

  if (mode === 'segwit') {
    // bc1q + 38 bech32 chars typically; match on full address (lowercase)
    const addr = address.toLowerCase();
    const p = prefix.toLowerCase();
    const s = suffix.toLowerCase();
    return (!p || addr.startsWith(p)) && (!s || addr.endsWith(s));
  }

  // Legacy: match against full address (includes leading 1)
  if (caseSensitive) {
    return (!prefix || address.startsWith(prefix)) && (!suffix || address.endsWith(suffix));
  }
  const addr = address.toLowerCase();
  return (
    (!prefix || addr.startsWith(prefix.toLowerCase())) &&
    (!suffix || addr.endsWith(suffix.toLowerCase()))
  );
}

let isRunning = false;
let workerId = 0;

async function generateBtcVanity(config: BtcGeneratorConfig): Promise<void> {
  const prefix = config.prefix || '';
  const suffix = config.suffix || '';
  const mode = config.mode || 'legacy';
  const caseSensitive = mode === 'segwit' ? false : Boolean(config.caseSensitive);
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 48;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const pub = getPublicKey(secret, true);
      const address =
        mode === 'segwit' ? btcSegwitAddress(pub) : btcLegacyAddress(pub);
      attempts++;

      if (matches(address, prefix, suffix, caseSensitive, mode)) {
        const duration = performance.now() - startTime;
        const result: GeneratedBtcResult = {
          mode,
          address,
          privateKeyHex: etc.bytesToHex(secret),
          privateKeyWif: btcWifCompressed(secret),
          privateKeyBytes: secret,
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
          await generateBtcVanity(config);
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
