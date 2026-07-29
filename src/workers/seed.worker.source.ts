/**
 * Seed Forge worker — grinds BIP32 derivation indices against a fixed seed.
 *
 * SECURITY: runs entirely in the browser. The seed arrives once over
 * postMessage, never leaves, and no network request is made from here.
 *
 * Each worker walks its own arithmetic progression of indices (start + n*stride)
 * so several threads cover a contiguous range without overlapping.
 */

import { yieldToEventLoop } from './yield';
import {
  createWalker,
  matchesAddress,
  pathStyleById,
  renderPath,
  MAX_INDEX,
} from './seed-derivation';

interface SeedWorkerConfig {
  seed: Uint8Array;
  styleId: string;
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  /** First index this worker tries. */
  startIndex: number;
  /** Distance between the indices this worker tries. */
  stride: number;
}

interface SeedResult {
  address: string;
  privateKey: string;
  index: number;
  path: string;
  styleId: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

interface InboundMessage {
  type: 'start' | 'stop';
  config?: SeedWorkerConfig;
  workerId?: number;
}

interface OutboundMessage {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready' | 'exhausted';
  workerId: number;
  result?: SeedResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

let isRunning = false;
let workerId = 0;

function post(message: OutboundMessage) {
  self.postMessage(message);
}

async function grind(config: SeedWorkerConfig): Promise<void> {
  const style = pathStyleById(config.styleId);
  if (!style) {
    post({ type: 'error', workerId, error: `Unknown derivation style ${config.styleId}` });
    return;
  }

  const walker = createWalker(config.seed, style);
  const startTime = performance.now();
  const progressInterval = 500;
  const batchSize = 64;

  let index = config.startIndex;
  let attempts = 0;
  let lastProgressUpdate = startTime;

  isRunning = true;

  while (isRunning) {
    for (let i = 0; i < batchSize && isRunning; i++) {
      if (index > MAX_INDEX) {
        post({ type: 'exhausted', workerId, attempts });
        isRunning = false;
        return;
      }

      const address = walker.addressAt(index);
      attempts++;

      if (matchesAddress(style.chain, address, config.prefix, config.suffix, config.caseSensitive)) {
        const secret = walker.secretAt(index);
        post({
          type: 'found',
          workerId,
          attempts,
          rate: attempts / ((performance.now() - startTime) / 1000),
          result: {
            address: secret.address,
            privateKey: secret.privateKey,
            index,
            path: renderPath(style, index),
            styleId: style.id,
            attempts,
            duration: performance.now() - startTime,
            matchedPattern: `${config.prefix}...${config.suffix}`,
          },
        });
        isRunning = false;
        return;
      }

      index += config.stride;
    }

    const now = performance.now();
    if (now - lastProgressUpdate >= progressInterval) {
      post({
        type: 'progress',
        workerId,
        attempts,
        rate: attempts / ((now - startTime) / 1000),
      });
      lastProgressUpdate = now;
    }

    await yieldToEventLoop();
  }

  post({ type: 'stopped', workerId, attempts });
}

self.onmessage = async (event: MessageEvent<InboundMessage>) => {
  const { type, config, workerId: id } = event.data;

  switch (type) {
    case 'start':
      if (config && id !== undefined) {
        workerId = id;
        try {
          await grind(config);
        } catch (err) {
          post({
            type: 'error',
            workerId,
            error: err instanceof Error ? err.message : 'Seed grind failed',
          });
        }
      }
      break;
    case 'stop':
      isRunning = false;
      break;
  }
};

post({ type: 'ready', workerId: 0 });
