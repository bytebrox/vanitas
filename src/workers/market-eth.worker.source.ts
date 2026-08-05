/**
 * Marketplace split-key vanity Web Worker.
 *
 * Unlike the regular EVM forge this worker never holds a complete private key.
 * It receives the server point S and searches for a scalar b whose combined
 * address `addr(b*G + S)` matches the pattern. Only b is reported back; the
 * key itself does not exist until the server adds its own half.
 *
 * The search runs incrementally: after computing `P = b*G + S` once, the next
 * candidate is `P + G` with `b + 1`. That replaces a full scalar
 * multiplication per attempt with a single point addition.
 */

import { Point, etc, utils } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { yieldToEventLoop } from './yield';
import { normalizePatterns, formatMatchedPattern } from '../lib/patterns';

interface MarketWorkerConfig {
  serverPoint: string;
  prefix: string;
  suffix: string;
  patterns?: { prefix: string; suffix: string }[];
}

interface MarketWorkerResult {
  address: string;
  clientHalf: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface WorkerInboundMessage {
  type: 'start' | 'stop';
  config?: MarketWorkerConfig;
  workerId?: number;
}

interface WorkerOutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: MarketWorkerResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

const CURVE_ORDER = Point.CURVE().n;

function strip0x(hex: string): string {
  return (hex || '').replace(/^0x/i, '').toLowerCase();
}

function toAddress(pubUncompressed: Uint8Array): string {
  return '0x' + etc.bytesToHex(keccak_256(pubUncompressed.slice(1)).slice(-20));
}

function scalarToHex(scalar: bigint): string {
  return scalar.toString(16).padStart(64, '0');
}

function matchesHexBody(address: string, prefix: string, suffix: string): boolean {
  if (!prefix && !suffix) return true;
  const body = address.slice(2);
  return (!prefix || body.startsWith(prefix)) && (!suffix || body.endsWith(suffix));
}

function parseServerPoint(hex: string): Point {
  const clean = strip0x(hex);
  if (!/^0[23][0-9a-f]{64}$/.test(clean)) {
    throw new Error('serverPoint must be a 33 byte compressed point');
  }
  return Point.fromBytes(etc.hexToBytes(clean));
}

let isRunning = false;
let workerId = 0;

async function grindSplitKey(config: MarketWorkerConfig): Promise<void> {
  const patterns = normalizePatterns(config).map((target) => ({
    prefix: strip0x(target.prefix),
    suffix: strip0x(target.suffix),
  }));
  const targets = patterns.length > 0 ? patterns : [{ prefix: '', suffix: '' }];

  const serverPoint = parseServerPoint(config.serverPoint);
  const startTime = performance.now();
  const progressInterval = 500;
  const batchSize = 256;
  // Bounds how far a single random start is walked, so the scalar can never
  // approach the curve order.
  const maxRunLength = 1_000_000;

  let attempts = 0;
  let lastProgressUpdate = startTime;
  let scalar = 0n;
  let point = Point.ZERO;
  let runLength = maxRunLength;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      if (runLength >= maxRunLength) {
        scalar = etc.bytesToNumberBE(utils.randomSecretKey());
        point = Point.BASE.multiply(scalar).add(serverPoint);
        runLength = 0;
      } else {
        scalar += 1n;
        point = point.add(Point.BASE);
        runLength++;
      }

      // Re-roll rather than wrap: a scalar at or past the order is not a
      // valid half and the server would reject it.
      if (scalar >= CURVE_ORDER) {
        runLength = maxRunLength;
        continue;
      }

      attempts++;
      const address = toAddress(point.toBytes(false));

      for (const target of targets) {
        if (!matchesHexBody(address, target.prefix, target.suffix)) continue;

        const duration = performance.now() - startTime;
        self.postMessage({
          type: 'found',
          workerId,
          result: {
            address,
            clientHalf: scalarToHex(scalar),
            attempts,
            duration,
            matchedPattern: formatMatchedPattern(target),
          },
          attempts,
          rate: attempts / (duration / 1000),
        } satisfies WorkerOutboundMessage);
        isRunning = false;
        return;
      }
    }

    const now = performance.now();
    if (now - lastProgressUpdate >= progressInterval) {
      self.postMessage({
        type: 'progress',
        workerId,
        attempts,
        rate: attempts / ((now - startTime) / 1000),
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
          await grindSplitKey(config);
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
