/**
 * Split-key forge controller — parallel Web Workers.
 *
 * Mirrors `EthVanityGenerator`, but every worker grinds against the same
 * server point and reports back a client half instead of a private key.
 */

import { verifiedWorkerUrl } from './verified-worker';
import { clampThreads, optimalThreadCount } from '@/lib/threads';
import type {
  MarketForgeConfig,
  MarketForgeResult,
  MarketForgeState,
  MarketForgeStats,
  MarketWorkerInbound,
  MarketWorkerOutbound,
} from '@/types/market';

export type MarketForgeCallback = (state: MarketForgeState) => void;

const WORKER_PATH = '/market-eth-worker.js';

export class MarketVanityGenerator {
  private workers: Worker[] = [];
  private config: MarketForgeConfig;
  private callback: MarketForgeCallback;
  private startTime = 0;
  private workerAttempts = new Map<number, number>();
  private workerRates = new Map<number, number>();
  private result: MarketForgeResult | null = null;
  private isRunning = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private runToken = 0;

  constructor(callback: MarketForgeCallback) {
    this.callback = callback;
    this.config = {
      serverPoint: '',
      prefix: '',
      suffix: '',
      threads: optimalThreadCount(),
    };
  }

  private createWorker(workerId: number, workerUrl: string): Worker {
    const worker = new Worker(workerUrl);

    worker.onmessage = (event: MessageEvent<MarketWorkerOutbound>) => {
      this.handleWorkerMessage(event.data);
    };

    worker.onerror = (error) => {
      console.error(`Market worker ${workerId} error:`, error);
      this.emitState('error', `Worker error: ${error.message}`);
    };

    return worker;
  }

  private handleWorkerMessage(message: MarketWorkerOutbound): void {
    const { type, workerId, result, attempts, rate } = message;

    switch (type) {
      case 'found':
        if (result) {
          this.result = result;
          this.stop();
          this.emitState('found');
        }
        break;
      case 'progress':
        if (attempts !== undefined) this.workerAttempts.set(workerId, attempts);
        if (rate !== undefined) this.workerRates.set(workerId, rate);
        break;
      case 'stopped':
        if (attempts !== undefined) this.workerAttempts.set(workerId, attempts);
        break;
      case 'error':
        console.error(`Market worker ${workerId} error:`, message.error);
        this.emitState('error', message.error ?? 'Worker error');
        break;
      case 'ready':
        break;
    }
  }

  private getStats(): MarketForgeStats {
    let totalAttempts = 0;
    let totalRate = 0;
    this.workerAttempts.forEach((value) => {
      totalAttempts += value;
    });
    this.workerRates.forEach((value) => {
      totalRate += value;
    });
    return {
      totalAttempts,
      attemptsPerSecond: totalRate,
      elapsedTime: this.isRunning ? Date.now() - this.startTime : 0,
      activeWorkers: this.workers.length,
    };
  }

  private emitState(status: MarketForgeState['status'], error: string | null = null): void {
    this.callback({
      status,
      config: this.config,
      stats: this.getStats(),
      result: this.result,
      error,
    });
  }

  start(config: Partial<MarketForgeConfig>): void {
    if (this.isRunning) this.stop();

    this.config = { ...this.config, ...config };
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.startTime = Date.now();
    this.isRunning = true;

    this.emitState('running');

    const token = ++this.runToken;
    void verifiedWorkerUrl(WORKER_PATH)
      .then((workerUrl) => {
        if (!this.isRunning || token !== this.runToken) return;

        for (let i = 0; i < this.config.threads; i++) {
          const worker = this.createWorker(i, workerUrl);
          this.workers.push(worker);
          const message: MarketWorkerInbound = {
            type: 'start',
            config: {
              serverPoint: this.config.serverPoint,
              prefix: this.config.prefix,
              suffix: this.config.suffix,
              patterns: this.config.patterns,
            },
            workerId: i,
          };
          worker.postMessage(message);
        }

        this.statsInterval = setInterval(() => {
          if (this.isRunning) this.emitState('running');
        }, 250);
      })
      .catch((err: unknown) => {
        this.isRunning = false;
        this.emitState(
          'error',
          err instanceof Error ? err.message : 'Worker verification failed'
        );
      });
  }

  stop(): void {
    this.isRunning = false;
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    this.workers.forEach((worker, index) => {
      worker.postMessage({ type: 'stop', workerId: index } satisfies MarketWorkerInbound);
      worker.terminate();
    });
    this.workers = [];
    if (!this.result) this.emitState('stopped');
  }

  reset(): void {
    this.isRunning = false;
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.emitState('idle');
  }

  patchConfig(updates: Partial<MarketForgeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setThreadCount(count: number): void {
    this.config.threads = clampThreads(count);
  }

  destroy(): void {
    this.reset();
  }
}
