/**
 * Cardano vanity Web Worker — enterprise addr1… (CIP-19 type 6)
 */

import { getPublicKey, utils, etc, hashes } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { cardanoEnterpriseAddress } from '../lib/address-encoding';

hashes.sha512 = sha512;

interface CardanoGeneratorConfig {
  prefix: string;
  suffix: string;
  threads: number;
}

interface GeneratedCardanoResult {
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
  config?: CardanoGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedCardanoResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

function stripHrp(value: string): string {
  const v = (value || '').trim().toLowerCase();
  return v.startsWith('addr1') ? v.slice(5) : v;
}

function matches(address: string, prefix: string, suffix: string): boolean {
  if (!prefix && !suffix) return true;
  const addr = address.toLowerCase();
  const body = addr.startsWith('addr1') ? addr.slice(5) : addr;
  const p = stripHrp(prefix);
  const s = stripHrp(suffix);
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}

let isRunning = false;
let workerId = 0;

async function generateCardanoVanity(config: CardanoGeneratorConfig): Promise<void> {
  const prefix = stripHrp(config.prefix || '');
  const suffix = stripHrp(config.suffix || '');
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 48;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const pub = getPublicKey(secret);
      const address = cardanoEnterpriseAddress(pub);
      attempts++;

      if (matches(address, prefix, suffix)) {
        const duration = performance.now() - startTime;
        const result: GeneratedCardanoResult = {
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
          await generateCardanoVanity(config);
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
