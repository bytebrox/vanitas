/**
 * Bitcoin vanity Web Worker
 * Modes: legacy (1…) · segwit (bc1q…) · taproot (bc1p…)
 */

import { getPublicKey, utils, etc, schnorr } from '@noble/secp256k1';
import {
  btcLegacyAddress,
  btcSegwitAddress,
  btcTaprootAddress,
  btcWifCompressed,
} from '../lib/address-encoding';

type BtcMode = 'legacy' | 'segwit' | 'taproot';

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

  if (mode === 'segwit' || mode === 'taproot') {
    const addr = address.toLowerCase();
    let p = (prefix || '').toLowerCase();
    const s = (suffix || '').toLowerCase();
    const hrp = mode === 'taproot' ? 'bc1p' : 'bc1q';
    if (p && !p.startsWith('bc1')) p = `${hrp}${p}`;
    return (!p || addr.startsWith(p)) && (!s || addr.endsWith(s));
  }

  let p = prefix || '';
  if (p && !p.startsWith('1')) p = `1${p}`;
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

function deriveAddress(secret: Uint8Array, mode: BtcMode): string {
  if (mode === 'taproot') {
    return btcTaprootAddress(schnorr.getPublicKey(secret));
  }
  const pub = getPublicKey(secret, true);
  return mode === 'segwit' ? btcSegwitAddress(pub) : btcLegacyAddress(pub);
}

let isRunning = false;
let workerId = 0;

async function generateBtcVanity(config: BtcGeneratorConfig): Promise<void> {
  const prefix = config.prefix || '';
  const suffix = config.suffix || '';
  const mode = config.mode || 'legacy';
  const caseSensitive =
    mode === 'segwit' || mode === 'taproot' ? false : Boolean(config.caseSensitive);
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 48;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const address = deriveAddress(secret, mode);
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
