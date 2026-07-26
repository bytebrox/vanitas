/**
 * Worker thread entry for vanity mining
 */

import { parentPort, workerData } from 'worker_threads';
import { tryOnce, type MineConfig } from './chains';

const cfg = workerData as MineConfig & { workerId: number };
const batch = 64;
let attempts = 0;
const t0 = Date.now();
let lastReport = t0;

function report() {
  const now = Date.now();
  const elapsed = (now - t0) / 1000;
  parentPort?.postMessage({
    type: 'progress',
    workerId: cfg.workerId,
    attempts,
    rate: elapsed > 0 ? attempts / elapsed : 0,
  });
  lastReport = now;
}

while (true) {
  for (let i = 0; i < batch; i++) {
    attempts++;
    const hit = tryOnce(cfg);
    if (hit) {
      parentPort?.postMessage({
        type: 'found',
        workerId: cfg.workerId,
        result: {
          ...hit,
          attempts,
          durationMs: Date.now() - t0,
        },
      });
      process.exit(0);
    }
  }
  if (Date.now() - lastReport >= 400) report();
}
