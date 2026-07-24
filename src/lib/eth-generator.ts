/**
 * ETH vanity generator controller — parallel Web Workers
 */

import type {
  EthGeneratorConfig,
  EthGeneratorState,
  EthGeneratorStats,
  GeneratedEthResult,
  EthWorkerInboundMessage,
  EthWorkerOutboundMessage,
} from '@/types/eth';

export type EthGeneratorCallback = (state: EthGeneratorState) => void;

export class EthVanityGenerator {
  private workers: Worker[] = [];
  private config: EthGeneratorConfig;
  private callback: EthGeneratorCallback;
  private startTime = 0;
  private workerAttempts: Map<number, number> = new Map();
  private workerRates: Map<number, number> = new Map();
  private result: GeneratedEthResult | null = null;
  private isRunning = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;

  constructor(callback: EthGeneratorCallback) {
    this.callback = callback;
    this.config = {
      prefix: '',
      suffix: '',
      threads: this.getOptimalThreadCount(),
      mode: 'wallet',
    };
  }

  private getOptimalThreadCount(): number {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      return Math.max(1, navigator.hardwareConcurrency - 1);
    }
    return 4;
  }

  private createWorker(workerId: number): Worker {
    const worker = new Worker('/eth-worker.js');

    worker.onmessage = (event: MessageEvent<EthWorkerOutboundMessage>) => {
      this.handleWorkerMessage(event.data);
    };

    worker.onerror = (error) => {
      console.error(`ETH worker ${workerId} error:`, error);
      this.emitState('error', `Worker error: ${error.message}`);
    };

    return worker;
  }

  private handleWorkerMessage(message: EthWorkerOutboundMessage): void {
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
        console.error(`ETH worker ${workerId} error:`, message.error);
        break;
      case 'ready':
        break;
    }
  }

  private getStats(): EthGeneratorStats {
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
    status: EthGeneratorState['status'],
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

  start(config: Partial<EthGeneratorConfig>): void {
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
      const message: EthWorkerInboundMessage = {
        type: 'start',
        config: this.config,
        workerId: i,
      };
      worker.postMessage(message);
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
      worker.postMessage({ type: 'stop', workerId: index } satisfies EthWorkerInboundMessage);
      worker.terminate();
    });
    this.workers = [];
    if (!this.result) this.emitState('stopped');
  }

  /** Clear result and return to idle — keeps current pattern/mode/threads */
  reset(): void {
    this.isRunning = false;
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    this.workers.forEach((worker) => {
      worker.terminate();
    });
    this.workers = [];
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.emitState('idle');
  }

  patchConfig(updates: Partial<EthGeneratorConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setThreadCount(count: number): void {
    this.config.threads = Math.max(1, Math.min(count, 16));
  }

  destroy(): void {
    this.reset();
  }
}
