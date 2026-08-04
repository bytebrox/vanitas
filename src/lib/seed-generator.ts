/**
 * Seed Forge controller.
 *
 * Mirrors the other generators, with one difference that matters: the PBKDF2
 * seed stretch happens once on the main thread and the resulting 64 bytes are
 * handed to the workers, which then only walk derivation indices. Each worker
 * gets its own offset in a shared stride so the threads tile the index range
 * without ever testing the same path twice.
 */

import { mnemonicToSeed, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { verifiedWorkerUrl } from './verified-worker';
import { clampThreads, optimalThreadCount } from './threads';
import type {
  SeedConfig,
  SeedState,
  SeedStats,
  SeedResult,
  SeedWorkerInbound,
  SeedWorkerOutbound,
} from '@/types/seed';

const WORKER_PATH = '/seed-worker.js';

export type SeedCallback = (state: SeedState) => void;

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic.trim().replace(/\s+/g, ' '), wordlist);
}

export class SeedGenerator {
  private workers: Worker[] = [];
  private config: SeedConfig;
  private callback: SeedCallback;
  private startTime = 0;
  private workerAttempts = new Map<number, number>();
  private workerRates = new Map<number, number>();
  private exhausted = new Set<number>();
  private result: SeedResult | null = null;
  private isRunning = false;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private runToken = 0;

  constructor(callback: SeedCallback) {
    this.callback = callback;
    this.config = {
      mnemonic: '',
      passphrase: '',
      styleId: 'sol-account',
      prefix: '',
      suffix: '',
      caseSensitive: false,
      startIndex: 0,
      threads: optimalThreadCount(),
    };
  }

  private createWorker(workerId: number, workerUrl: string): Worker {
    const worker = new Worker(workerUrl);

    worker.onmessage = (event: MessageEvent<SeedWorkerOutbound>) => {
      this.handleMessage(event.data);
    };

    worker.onerror = (error) => {
      this.emitState('error', `Worker error: ${error.message}`);
    };

    return worker;
  }

  private handleMessage(message: SeedWorkerOutbound): void {
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

      case 'exhausted':
        if (attempts !== undefined) this.workerAttempts.set(workerId, attempts);
        this.exhausted.add(workerId);
        // Only give up once every thread has run out of indices.
        if (this.exhausted.size >= this.workers.length && this.workers.length > 0) {
          this.stop();
          this.emitState('exhausted');
        }
        break;

      case 'error':
        this.stop();
        this.emitState('error', message.error ?? 'Seed worker failed');
        break;

      case 'ready':
        break;
    }
  }

  private getStats(): SeedStats {
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

  private emitState(status: SeedState['status'], error: string | null = null): void {
    this.callback({
      status,
      config: this.config,
      stats: this.getStats(),
      result: this.result,
      error,
    });
  }

  start(config: Partial<SeedConfig>): void {
    if (this.isRunning) this.stop();

    this.config = { ...this.config, ...config };
    this.result = null;
    this.workerAttempts.clear();
    this.workerRates.clear();
    this.exhausted.clear();
    this.startTime = Date.now();
    this.isRunning = true;

    this.emitState('running');

    const token = ++this.runToken;
    const threads = clampThreads(this.config.threads);

    void Promise.all([
      verifiedWorkerUrl(WORKER_PATH),
      mnemonicToSeed(this.config.mnemonic.trim().replace(/\s+/g, ' '), this.config.passphrase),
    ])
      .then(([workerUrl, seed]) => {
        if (!this.isRunning || token !== this.runToken) return;

        for (let i = 0; i < threads; i++) {
          const worker = this.createWorker(i, workerUrl);
          this.workers.push(worker);
          worker.postMessage({
            type: 'start',
            workerId: i,
            config: {
              // Every worker needs its own copy; the buffer is not transferred.
              seed: new Uint8Array(seed),
              styleId: this.config.styleId,
              prefix: this.config.prefix,
              suffix: this.config.suffix,
              patterns: this.config.patterns,
              caseSensitive: this.config.caseSensitive,
              startIndex: this.config.startIndex + i,
              stride: threads,
            },
          } satisfies SeedWorkerInbound);
        }

        this.statsInterval = setInterval(() => {
          if (this.isRunning) this.emitState('running');
        }, 250);
      })
      .catch((err: unknown) => {
        this.isRunning = false;
        this.emitState(
          'error',
          err instanceof Error ? err.message : 'Could not start the seed forge'
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
      worker.postMessage({ type: 'stop', workerId: index } satisfies SeedWorkerInbound);
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
    this.exhausted.clear();
    this.emitState('idle');
  }

  patchConfig(updates: Partial<SeedConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setThreadCount(count: number): void {
    this.config.threads = clampThreads(count);
  }

  destroy(): void {
    this.reset();
  }
}
