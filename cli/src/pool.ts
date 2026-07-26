import { Worker } from 'worker_threads';
import { join } from 'path';
import type { MineConfig, MineHit } from './chains';

export interface MineProgress {
  attempts: number;
  rate: number;
  elapsedMs: number;
}

export async function mineParallel(
  cfg: MineConfig,
  threads: number,
  onProgress: (p: MineProgress) => void
): Promise<MineHit> {
  const workerPath = join(__dirname, 'mine-worker.js');
  const start = Date.now();
  const attemptsByWorker = new Map<number, number>();
  const ratesByWorker = new Map<number, number>();

  return new Promise((resolve, reject) => {
    const workers: Worker[] = [];
    let settled = false;

    const cleanup = () => {
      for (const w of workers) {
        void w.terminate();
      }
    };

    const tick = () => {
      let attempts = 0;
      let rate = 0;
      attemptsByWorker.forEach((a) => {
        attempts += a;
      });
      ratesByWorker.forEach((r) => {
        rate += r;
      });
      onProgress({ attempts, rate, elapsedMs: Date.now() - start });
    };

    for (let i = 0; i < threads; i++) {
      const w = new Worker(workerPath, {
        workerData: { ...cfg, workerId: i },
      });
      workers.push(w);
      w.on(
        'message',
        (msg: {
          type: string;
          workerId: number;
          attempts?: number;
          rate?: number;
          result?: MineHit;
        }) => {
          if (msg.type === 'progress') {
            if (msg.attempts != null) attemptsByWorker.set(msg.workerId, msg.attempts);
            if (msg.rate != null) ratesByWorker.set(msg.workerId, msg.rate);
            tick();
          }
          if (msg.type === 'found' && msg.result && !settled) {
            settled = true;
            let totalAttempts = 0;
            attemptsByWorker.forEach((a) => {
              totalAttempts += a;
            });
            totalAttempts = Math.max(totalAttempts, msg.result.attempts);
            cleanup();
            resolve({
              ...msg.result,
              attempts: totalAttempts,
              durationMs: Date.now() - start,
            });
          }
        }
      );
      w.on('error', (err) => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(err);
        }
      });
    }
  });
}
