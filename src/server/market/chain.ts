/**
 * Robinhood Chain definition and shared viem clients.
 *
 * Robinhood Chain is an Arbitrum Orbit L2 with ETH as the native gas token,
 * so stock EVM tooling applies without modification.
 */

import { createPublicClient, defineChain, http, type PublicClient } from 'viem';
import type { MarketChainInfo } from '@/types/market';

const PUBLIC_MAINNET_RPC = 'https://rpc.mainnet.chain.robinhood.com';
const PUBLIC_TESTNET_RPC = 'https://rpc.testnet.chain.robinhood.com';

export const robinhoodMainnet = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [PUBLIC_MAINNET_RPC] } },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' },
  },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [PUBLIC_TESTNET_RPC] } },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://explorer.testnet.chain.robinhood.com' },
  },
  testnet: true,
});

export function isTestnet(): boolean {
  return (process.env.MARKET_CHAIN || 'testnet').toLowerCase() === 'testnet';
}

export function activeChain() {
  return isTestnet() ? robinhoodTestnet : robinhoodMainnet;
}

/**
 * The public endpoints are rate limited and carry no archive guarantee, so a
 * provider URL is expected in production. Falling back keeps local development
 * and preview deployments working without extra setup.
 */
export function rpcUrl(): string {
  const configured = process.env.ROBINHOOD_RPC_URL;
  if (configured) return configured;
  return isTestnet() ? PUBLIC_TESTNET_RPC : PUBLIC_MAINNET_RPC;
}

let cachedClient: PublicClient | null = null;

export function publicClient(): PublicClient {
  if (!cachedClient) {
    cachedClient = createPublicClient({
      chain: activeChain(),
      transport: http(rpcUrl(), { batch: true, retryCount: 2 }),
    }) as PublicClient;
  }
  return cachedClient;
}

export function explorerTxUrl(hash: string): string {
  return `${activeChain().blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${activeChain().blockExplorers.default.url}/address/${address}`;
}

/**
 * Chain metadata for wallet_addEthereumChain. Deliberately advertises the
 * public endpoint rather than `rpcUrl()`, which may carry a provider API key.
 */
export function publicChainInfo(): MarketChainInfo {
  const chain = activeChain();
  return {
    chainId: chain.id,
    chainIdHex: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: { ...chain.nativeCurrency },
    rpcUrls: [...chain.rpcUrls.default.http],
    blockExplorerUrls: [chain.blockExplorers.default.url],
    testnet: Boolean(chain.testnet),
  };
}
