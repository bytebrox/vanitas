/**
 * Vanitas Generator Controller
 * 
 * Manages multiple Web Workers for parallel vanity address generation.
 * All computation happens client-side in Web Workers.
 */

import {
  GeneratorConfig,
  GeneratorState,
  GeneratorStats,
  GeneratedKeypair,
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from '@/types';
import { verifiedWorkerUrl } from './verified-worker';
import { clampThreads, optimalThreadCount } from '@/lib/threads';

export type GeneratorCallback = (state: GeneratorState) => void;

const WORKER_PATH = '/vanity-worker.js';

export class VanityGenerator {
  private workers: Worker[] = [];
  private config: GeneratorConfig;
  private callback: GeneratorCallback;
  private startTime: number = 0;
  private workerAttempts: Map<number, number> = new Map();
  private workerRates: Map<number, number> = new Map();
  private result: GeneratedKeypair | null = null;
  private isRunning: boolean = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private runToken = 0;

  constructor(callback: GeneratorCallback) {
    this.callback = callback;
    this.config = {
      prefix: '',
      suffix: '',
      caseSensitive: true,
      threads: this.getOptimalThreadCount(),
    };
  }

  /**
   * Get optimal number of threads based on available cores
   */
  private getOptimalThreadCount(): number {
    return optimalThreadCount();
  }

  /**
   * Create a new Web Worker
   */
  private createWorker(workerId: number, workerUrl: string): Worker {
    const worker = new Worker(workerUrl);

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      this.handleWorkerMessage(event.data);
    };

    worker.onerror = (error) => {
      console.error(`Worker ${workerId} error:`, error);
      this.emitState('error', `Worker error: ${error.message}`);
    };

    return worker;
  }

  /**
   * Handle messages from workers
   */
  private handleWorkerMessage(message: WorkerOutboundMessage): void {
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
        if (attempts !== undefined) {
          this.workerAttempts.set(workerId, attempts);
        }
        if (rate !== undefined) {
          this.workerRates.set(workerId, rate);
        }
        break;

      case 'stopped':
        if (attempts !== undefined) {
          this.workerAttempts.set(workerId, attempts);
        }
        break;

      case 'error':
        console.error(`Worker ${workerId} error:`, message.error);
        break;

      case 'ready':
        // Worker initialized successfully
        break;
    }
  }

  /**
   * Calculate current statistics
   */
  private getStats(): GeneratorStats {
    let totalAttempts = 0;
    let totalRate = 0;

    this.workerAttempts.forEach((attempts) => {
      totalAttempts += attempts;
    });

    this.workerRates.forEach((rate) => {
      totalRate += rate;
    });

    const elapsedTime = this.isRunning ? Date.now() - this.startTime : 0;

    return {
      totalAttempts,
      attemptsPerSecond: totalRate,
      elapsedTime,
      activeWorkers: this.workers.length,
    };
  }

  /**
   * Emit current state to callback
   */
  private emitState(
    status: GeneratorState['status'],
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

  /**
   * Start generating with the given configuration
   */
  start(config: Partial<GeneratorConfig>): void {
    if (this.isRunning) {
      this.stop();
    }

    // Update config
    this.config = {
      ...this.config,
      ...config,
    };

    // Reset state
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

          const message: WorkerInboundMessage = {
            type: 'start',
            config: this.config,
            workerId: i,
          };

          worker.postMessage(message);
        }

        this.statsInterval = setInterval(() => {
          if (this.isRunning) {
            this.emitState('running');
          }
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

  /**
   * Stop all workers
   */
  stop(): void {
    this.isRunning = false;

    // Stop stats interval
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    // Stop and terminate all workers
    this.workers.forEach((worker, index) => {
      const message: WorkerInboundMessage = {
        type: 'stop',
        workerId: index,
      };
      worker.postMessage(message);
      worker.terminate();
    });

    this.workers = [];

    if (!this.result) {
      this.emitState('stopped');
    }
  }

  /**
   * Clear result and return to idle — keeps current pattern/threads
   */
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

  patchConfig(updates: Partial<GeneratorConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Update thread count
   */
  setThreadCount(count: number): void {
    this.config.threads = clampThreads(count);
  }

  /**
   * Get current config
   */
  getConfig(): GeneratorConfig {
    return { ...this.config };
  }

  /**
   * Check if generator is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.reset();
  }
}
