/**
 * Cooperative yield for the worker grind loops.
 *
 * `setTimeout(…, 0)` is the obvious choice but wrong here: a grind loop calls
 * it back-to-back forever, so it permanently sits past the browser's nesting
 * threshold and every call is clamped to ~4 ms. At batch sizes of 24–100
 * candidates that clamp eats a double-digit percentage of the wall clock.
 *
 * A MessageChannel task is not clamped and still drains the worker's inbound
 * message queue, so `stop` is picked up just as promptly.
 */

type Resolver = () => void;

const channel: MessageChannel | null =
  typeof MessageChannel !== 'undefined' ? new MessageChannel() : null;

const pending: Resolver[] = [];

if (channel) {
  channel.port1.onmessage = () => {
    pending.shift()?.();
  };
}

export function yieldToEventLoop(): Promise<void> {
  if (!channel) {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  return new Promise<void>((resolve) => {
    pending.push(resolve);
    channel.port2.postMessage(0);
  });
}
