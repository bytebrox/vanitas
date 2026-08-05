/**
 * Build-time switch for the marketplace.
 *
 * The market is the one surface that talks to a server and holds keys, so it
 * stays off unless a deployment opts in. Written as a direct comparison
 * against `process.env.NEXT_PUBLIC_*` so Next can inline it and tree-shake the
 * navigation entries away entirely.
 */
export const MARKET_ENABLED = process.env.NEXT_PUBLIC_MARKET_ENABLED === 'true';
