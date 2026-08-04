/**
 * Aptos vanity Web Worker — Ed25519 + sha3_256(pubkey ‖ 0x00)
 */

import { getPublicKey, utils, etc, hashes } from '@noble/ed25519';
import { yieldToEventLoop } from './yield';
import { sha512 } from '@noble/hashes/sha2.js';
import { sha3_256 } from '@noble/hashes/sha3.js';
import { normalizePatterns, formatMatchedPattern } from '../lib/patterns';

hashes.sha512 = sha512;

interface AptosGeneratorConfig {
  prefix: string;
  suffix: string;
  patterns?: { prefix: string; suffix: string }[];
  threads: number;
}

interface GeneratedAptosResult {
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
  config?: AptosGeneratorConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: GeneratedAptosResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

function strip0x(hex: string): string {
  return (hex || '').replace(/^0x/i, '').toLowerCase();
}

/** Aptos Ed25519 auth key: sha3_256(pubkey_bytes ‖ 0x00) */
function aptosAddressFromPubkey(pub: Uint8Array): string {
  const preimage = new Uint8Array(33);
  preimage.set(pub, 0);
  preimage[32] = 0x00;
  return '0x' + etc.bytesToHex(sha3_256(preimage));
}

function matchesHexBody(address: string, prefix: string, suffix: string): boolean {
  if (!prefix && !suffix) return true;
  const body = address.slice(2).toLowerCase();
  const p = prefix.toLowerCase();
  const s = suffix.toLowerCase();
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}

let isRunning = false;
let workerId = 0;

async function generateAptosVanity(config: AptosGeneratorConfig): Promise<void> {
  const patterns = normalizePatterns(config).map((t) => ({
    prefix: strip0x(t.prefix),
    suffix: strip0x(t.suffix),
  }));
  const startTime = performance.now();
  let attempts = 0;
  let lastProgressUpdate = startTime;
  const progressInterval = 500;
  const batchSize = 64;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      const secret = utils.randomSecretKey();
      const pub = getPublicKey(secret);
      const address = aptosAddressFromPubkey(pub);
      attempts++;

      let matchedTarget: { prefix: string; suffix: string } | null = null;
      for (const target of patterns.length > 0 ? patterns : [{ prefix: '', suffix: '' }]) {
        if (matchesHexBody(address, target.prefix, target.suffix)) {
          matchedTarget = target;
          break;
        }
      }
      if (matchedTarget) {
        const duration = performance.now() - startTime;
        const result: GeneratedAptosResult = {
          address,
          privateKey: '0x' + etc.bytesToHex(secret),
          privateKeyBytes: secret,
          publicKey: '0x' + etc.bytesToHex(pub),
          attempts,
          duration,
          matchedPattern: formatMatchedPattern(matchedTarget),
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
          await generateAptosVanity(config);
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
