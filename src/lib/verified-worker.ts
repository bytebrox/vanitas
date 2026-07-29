/**
 * Worker integrity gate.
 *
 * Every forge loads its worker through here: the bundle is fetched, hashed and
 * compared against the hash compiled into the app at build time. Only on a
 * match is a blob URL handed out, so a tampered worker never executes rather
 * than merely showing up as a failed check on the audit page.
 */

import { WORKER_INTEGRITY } from './worker-integrity';

export class WorkerIntegrityError extends Error {
  constructor(
    readonly workerPath: string,
    readonly expected: string,
    readonly actual: string
  ) {
    super(`Integrity check failed for ${workerPath}`);
    this.name = 'WorkerIntegrityError';
  }
}

const verified = new Map<string, Promise<string>>();

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return (
    'sha256-' +
    Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Expected hash for a worker path, or undefined if none was published. */
export function expectedWorkerHash(workerPath: string): string | undefined {
  return WORKER_INTEGRITY[workerPath];
}

/**
 * Resolve to a blob URL for a verified worker bundle. Rejects with
 * `WorkerIntegrityError` when the served file does not match.
 */
export function verifiedWorkerUrl(workerPath: string): Promise<string> {
  const cached = verified.get(workerPath);
  if (cached) return cached;

  const pending = (async () => {
    const expected = expectedWorkerHash(workerPath);
    if (!expected) {
      throw new Error(`No published integrity hash for ${workerPath}`);
    }

    const response = await fetch(workerPath);
    if (!response.ok) {
      throw new Error(`Could not load ${workerPath} (${response.status})`);
    }

    const bytes = await response.arrayBuffer();
    const actual = await sha256(bytes);
    if (actual !== expected) {
      throw new WorkerIntegrityError(workerPath, expected, actual);
    }

    return URL.createObjectURL(new Blob([bytes], { type: 'text/javascript' }));
  })();

  verified.set(workerPath, pending);
  // A network hiccup should not poison the cache for the rest of the session.
  pending.catch(() => verified.delete(workerPath));
  return pending;
}
