/**
 * Tron vanity generator — parallel Web Workers
 */

import type {
  TronGeneratorConfig,
  TronGeneratorState,
  TronGeneratorStats,
  GeneratedTronResult,
  TronWorkerInboundMessage,
  TronWorkerOutboundMessage,
} from '@/types/tron';
import { verifiedWorkerUrl } from './verified-worker';
import { clampThreads, optimalThreadCount } from '@/lib/threads';

export type TronGeneratorCallback = (state: TronGeneratorState) => void;

const WORKER_PATH = '/tron-worker.js';

export class TronVanityGenerator {
  private workers: Worker[] = [];
  private config: TronGeneratorConfig;
  private callback: TronGeneratorCallback;
  private startTime = 0;
  private workerAttempts: Map<number, number> = new Map();
  private workerRates: Map<number, number> = new Map();
  private result: GeneratedTronResult | null = null;
  private isRunning = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private runToken = 0;

  constructor(callback: TronGeneratorCallback) {
    this.callback = callback;
    this.config = {
      prefix: '',
      suffix: '',
      threads: this.getOptimalThreadCount(),
      caseSensitive: false,
      mode: 'wallet',
    };
  }

  private getOptimalThreadCount(): number {
    return optimalThreadCount();
  }

  private createWorker(workerId: number, workerUrl: string): Worker {
    const worker = new Worker(workerUrl);
    worker.onmessage = (event: MessageEvent<TronWorkerOutboundMessage>) => {
      this.handleWorkerMessage(event.data);
    };
    worker.onerror = (error) => {
      this.emitState('error', `Worker error: ${error.message}`);
    };
    return worker;
  }

  private handleWorkerMessage(message: TronWorkerOutboundMessage): void {
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
        console.error(`TRON worker ${workerId}:`, message.error);
        break;
    }
  }

  private getStats(): TronGeneratorStats {
    let totalAttempts = 0;
    let totalRate = 0;
    this.workerAttempts.forEach((a) => { totalAttempts += a; });
    this.workerRates.forEach((r) => { totalRate += r; });
    return {
      totalAttempts,
      attemptsPerSecond: totalRate,
      elapsedTime: this.isRunning ? Date.now() - this.startTime : 0,
      activeWorkers: this.workers.length,
    };
  }

  private emitState(status: TronGeneratorState['status'], error: string | null = null): void {
    this.callback({
      status,
      config: this.config,
      stats: this.getStats(),
      result: this.result,
      error,
    });
  }

  start(config: Partial<TronGeneratorConfig>): void {
    if (this.isRunning) this.stop();
    this.config = { ...this.config, ...config };
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.startTime = Date.now();
    this.isRunning = true;

    this.emitState('running');

    // Workers only start once the bundle has been verified against the hash
    // compiled into the app.
    const token = ++this.runToken;
    void verifiedWorkerUrl(WORKER_PATH)
      .then((workerUrl) => {
        if (!this.isRunning || token !== this.runToken) return;

        for (let i = 0; i < this.config.threads; i++) {
          const worker = this.createWorker(i, workerUrl);
          this.workers.push(worker);
          worker.postMessage({
            type: 'start',
            config: this.config,
            workerId: i,
          } satisfies TronWorkerInboundMessage);
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
      worker.postMessage({ type: 'stop', workerId: index } satisfies TronWorkerInboundMessage);
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
    this.workers.forEach((w) => { w.terminate(); });
    this.workers = [];
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.emitState('idle');
  }

  patchConfig(updates: Partial<TronGeneratorConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setThreadCount(count: number): void {
    this.config.threads = clampThreads(count);
  }

  destroy(): void {
    this.reset();
  }
}
