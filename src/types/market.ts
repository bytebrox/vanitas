/**
 * Shared marketplace types. Everything here crosses the API boundary, so wei
 * amounts travel as decimal strings and timestamps as ISO strings.
 */

import type { PatternTarget } from '@/lib/patterns';

export type ListingStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'withdrawn';
export type ListingOrigin = 'user' | 'platform';
export type OrderStatus = 'pending' | 'paid' | 'released' | 'expired' | 'cancelled';

export interface MarketChainInfo {
  chainId: number;
  chainIdHex: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testnet: boolean;
}

export interface MarketConfigResponse {
  chain: MarketChainInfo;
  minPriceWei: string;
  maxPriceWei: string;
  orderTtlMs: number;
  /**
   * Wei withheld from a payout to cover the transfer that delivers it. Null
   * when the chain could not be reached for a quote.
   */
  payoutReserveWei: string | null;
}

export interface MarketSession {
  address: string;
  payoutAddress: string | null;
  isAdmin: boolean;
}

export interface ListingSummary {
  id: string;
  address: string;
  pattern: string;
  matchedPattern: string;
  difficultyBits: number | null;
  priceWei: string | null;
  status: ListingStatus;
  origin: ListingOrigin;
  sellerAddress: string;
  isOwn: boolean;
  listedAt: string | null;
  createdAt: string;
}

export interface ListingPage {
  items: ListingSummary[];
  total: number;
  offset: number;
  limit: number;
}

export interface ForgeSessionResponse {
  sessionId: string;
  /** Compressed secp256k1 point S = s*G, 33 bytes hex. */
  serverPoint: string;
  expiresAt: string;
}

export interface ForgeSubmitRequest {
  sessionId: string;
  /** The browser half b, 32 bytes hex. */
  clientHalf: string;
  address: string;
  matchedPattern: string;
  attempts: number;
  difficultyBits?: number;
}

export interface OrderView {
  id: string;
  listingId: string;
  address: string;
  depositAddress: string;
  amountWei: string;
  status: OrderStatus;
  expiresAt: string;
  paidTxHash: string | null;
  createdAt: string;
}

export interface OrderKeyResponse {
  address: string;
  privateKey: string;
}

/** Worker protocol for the split-key grinder. */
export interface MarketForgeConfig {
  serverPoint: string;
  prefix: string;
  suffix: string;
  patterns?: PatternTarget[];
  threads: number;
}

export interface MarketForgeResult {
  address: string;
  /** Client half b; never the full key, which needs the server half. */
  clientHalf: string;
  attempts: number;
  duration: number;
  matchedPattern: string;
}

export interface MarketWorkerInbound {
  type: 'start' | 'stop';
  config?: Omit<MarketForgeConfig, 'threads'>;
  workerId?: number;
}

export interface MarketWorkerOutbound {
  type: 'found' | 'progress' | 'error' | 'stopped' | 'ready';
  workerId: number;
  result?: MarketForgeResult;
  attempts?: number;
  rate?: number;
  error?: string;
}

export type MarketForgeStatus = 'idle' | 'running' | 'found' | 'stopped' | 'error';

export interface MarketForgeStats {
  totalAttempts: number;
  attemptsPerSecond: number;
  elapsedTime: number;
  activeWorkers: number;
}

export interface MarketForgeState {
  status: MarketForgeStatus;
  config: MarketForgeConfig;
  stats: MarketForgeStats;
  result: MarketForgeResult | null;
  error: string | null;
}
