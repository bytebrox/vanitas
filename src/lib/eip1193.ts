/**
 * Minimal EIP-1193 access.
 *
 * The marketplace talks to injected wallets directly instead of pulling in a
 * connector framework: one provider interface, no extra bundle, and no
 * third-party relay in a project whose whole point is that nothing phones home.
 */

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

/** User rejected the request in their wallet. */
export const ERROR_USER_REJECTED = 4001;
/** The wallet does not know this chain yet. */
export const ERROR_UNRECOGNIZED_CHAIN = 4902;

export function getProvider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function providerErrorCode(error: unknown): number | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as ProviderRpcError).code;
    return typeof code === 'number' ? code : null;
  }
  return null;
}

export function isUserRejection(error: unknown): boolean {
  return providerErrorCode(error) === ERROR_USER_REJECTED;
}

export async function requestAccounts(provider: Eip1193Provider): Promise<string[]> {
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  return accounts.map((entry) => entry.toLowerCase());
}

export async function readAccounts(provider: Eip1193Provider): Promise<string[]> {
  const accounts = (await provider.request({ method: 'eth_accounts' })) as string[];
  return accounts.map((entry) => entry.toLowerCase());
}

export async function readChainId(provider: Eip1193Provider): Promise<number> {
  const hex = (await provider.request({ method: 'eth_chainId' })) as string;
  return Number.parseInt(hex, 16);
}

export async function personalSign(
  provider: Eip1193Provider,
  address: string,
  message: string
): Promise<string> {
  const hex =
    '0x' +
    Array.from(new TextEncoder().encode(message))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  return (await provider.request({
    method: 'personal_sign',
    params: [hex, address],
  })) as string;
}

export interface AddChainParams {
  chainIdHex: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

/** Switch to a chain, adding it first when the wallet has never seen it. */
export async function ensureChain(
  provider: Eip1193Provider,
  params: AddChainParams
): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: params.chainIdHex }],
    });
  } catch (error) {
    if (providerErrorCode(error) !== ERROR_UNRECOGNIZED_CHAIN) throw error;
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: params.chainIdHex,
          chainName: params.chainName,
          nativeCurrency: params.nativeCurrency,
          rpcUrls: params.rpcUrls,
          blockExplorerUrls: params.blockExplorerUrls,
        },
      ],
    });
  }
}

export async function sendTransaction(
  provider: Eip1193Provider,
  tx: { from: string; to: string; value: string }
): Promise<string> {
  return (await provider.request({
    method: 'eth_sendTransaction',
    params: [tx],
  })) as string;
}
