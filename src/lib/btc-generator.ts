/**
 * Bitcoin vanity generator — parallel Web Workers
 */

import type {
  BtcGeneratorConfig,
  BtcGeneratorState,
  BtcGeneratorStats,
  GeneratedBtcResult,
  BtcWorkerInboundMessage,
  BtcWorkerOutboundMessage,
} from '@/types/btc';

export type BtcGeneratorCallback = (state: BtcGeneratorState) => void;

export class BtcVanityGenerator {
  private workers: Worker[] = [];
  private config: BtcGeneratorConfig;
  private callback: BtcGeneratorCallback;
  private startTime = 0;
  private workerAttempts: Map<number, number> = new Map();
  private workerRates: Map<number, number> = new Map();
  private result: GeneratedBtcResult | null = null;
  private isRunning = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;

  constructor(callback: BtcGeneratorCallback) {
    this.callback = callback;
    this.config = {
      prefix: '',
      suffix: '',
      threads: this.getOptimalThreadCount(),
      mode: 'legacy',
      caseSensitive: true,
    };
  }

  private getOptimalThreadCount(): number {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      return Math.max(1, navigator.hardwareConcurrency - 1);
    }
    return 4;
  }

  private createWorker(workerId: number): Worker {
    const worker = new Worker('/btc-worker.js');
    worker.onmessage = (event: MessageEvent<BtcWorkerOutboundMessage>) => {
      this.handleWorkerMessage(event.data);
    };
    worker.onerror = (error) => {
      this.emitState('error', `Worker error: ${error.message}`);
    };
    return worker;
  }

  private handleWorkerMessage(message: BtcWorkerOutboundMessage): void {
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
        console.error(`BTC worker ${workerId}:`, message.error);
        break;
    }
  }

  private getStats(): BtcGeneratorStats {
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

  private emitState(status: BtcGeneratorState['status'], error: string | null = null): void {
    this.callback({
      status,
      config: this.config,
      stats: this.getStats(),
      result: this.result,
      error,
    });
  }

  start(config: Partial<BtcGeneratorConfig>): void {
    if (this.isRunning) this.stop();
    this.config = { ...this.config, ...config };
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.startTime = Date.now();
    this.isRunning = true;

    for (let i = 0; i < this.config.threads; i++) {
      const worker = this.createWorker(i);
      this.workers.push(worker);
      worker.postMessage({
        type: 'start',
        config: this.config,
        workerId: i,
      } satisfies BtcWorkerInboundMessage);
    }

    this.statsInterval = setInterval(() => {
      if (this.isRunning) this.emitState('running');
    }, 250);
    this.emitState('running');
  }

  stop(): void {
    this.isRunning = false;
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    this.workers.forEach((worker, index) => {
      worker.postMessage({ type: 'stop', workerId: index } satisfies BtcWorkerInboundMessage);
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

  patchConfig(updates: Partial<BtcGeneratorConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setThreadCount(count: number): void {
    this.config.threads = Math.max(1, Math.min(count, 16));
  }

  destroy(): void {
    this.reset();
  }
}
