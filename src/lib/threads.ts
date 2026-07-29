/**
 * Worker thread budget — shared by every forge so the UI never offers a core
 * count the generator would silently clamp away.
 */

/** Hard ceiling. Beyond this, workers contend more than they contribute. */
export const MAX_THREADS = 32;

/** Fallback when the browser does not report a core count. */
const FALLBACK_CORES = 8;

export function detectCores(): number {
  if (typeof navigator === 'undefined') return FALLBACK_CORES;
  return navigator.hardwareConcurrency || FALLBACK_CORES;
}

/** Upper bound offered by the controls. */
export function maxThreadCount(): number {
  return Math.min(MAX_THREADS, detectCores());
}

/** Default: leave one core for the UI thread. */
export function optimalThreadCount(): number {
  return clampThreads(detectCores() - 1);
}

export function clampThreads(count: number): number {
  if (!Number.isFinite(count)) return 1;
  return Math.max(1, Math.min(Math.floor(count), maxThreadCount()));
}
