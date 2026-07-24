/**
 * Sui vanity generator — parallel Web Workers
 */

import type {
  SuiGeneratorConfig,
  SuiGeneratorState,
  SuiGeneratorStats,
  GeneratedSuiResult,
  SuiWorkerInboundMessage,
  SuiWorkerOutboundMessage,
} from '@/types/sui';

export type SuiGeneratorCallback = (state: SuiGeneratorState) => void;

export class SuiVanityGenerator {
  private workers: Worker[] = [];
  private config: SuiGeneratorConfig;
  private callback: SuiGeneratorCallback;
  private startTime = 0;
  private workerAttempts: Map<number, number> = new Map();
  private workerRates: Map<number, number> = new Map();
  private result: GeneratedSuiResult | null = null;
  private isRunning = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;

  constructor(callback: SuiGeneratorCallback) {
    this.callback = callback;
    this.config = {
      prefix: '',
      suffix: '',
      threads: this.getOptimalThreadCount(),
    };
  }

  private getOptimalThreadCount(): number {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      return Math.max(1, navigator.hardwareConcurrency - 1);
    }
    return 4;
  }

  private createWorker(workerId: number): Worker {
    const worker = new Worker('/sui-worker.js');
    worker.onmessage = (event: MessageEvent<SuiWorkerOutboundMessage>) => {
      this.handleWorkerMessage(event.data);
    };
    worker.onerror = (error) => {
      this.emitState('error', `Worker error: ${error.message}`);
    };
    return worker;
  }

  private handleWorkerMessage(message: SuiWorkerOutboundMessage): void {
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
        console.error(`SUI worker ${workerId}:`, message.error);
        break;
    }
  }

  private getStats(): SuiGeneratorStats {
    let totalAttempts = 0;
    let totalRate = 0;
    this.workerAttempts.forEach((a) => {
      totalAttempts += a;
    });
    this.workerRates.forEach((r) => {
      totalRate += r;
    });
    return {
      totalAttempts,
      attemptsPerSecond: totalRate,
      elapsedTime: this.isRunning ? Date.now() - this.startTime : 0,
      activeWorkers: this.workers.length,
    };
  }

  private emitState(
    status: SuiGeneratorState['status'],
    error: string | null = null
  ): void {
    this.callback({
      status,
      config: this.config,
      stats: this.getStats(),
      result: this.result,
      error,
    });
  }

  start(config: Partial<SuiGeneratorConfig>): void {
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
      } satisfies SuiWorkerInboundMessage);
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
      worker.postMessage({ type: 'stop', workerId: index } satisfies SuiWorkerInboundMessage);
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
    this.workers.forEach((w) => {
      w.terminate();
    });
    this.workers = [];
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.emitState('idle');
  }

  patchConfig(updates: Partial<SuiGeneratorConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setThreadCount(count: number): void {
    this.config.threads = Math.max(1, Math.min(count, 16));
  }

  destroy(): void {
    this.reset();
  }
}
