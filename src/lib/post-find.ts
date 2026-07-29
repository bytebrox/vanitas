/**
 * Post-find catalog — playbook / import / launch keys by chain+mode.
 * Copy lives in messages under `postFind.*`.
 */

import type { ProofChain } from '@/lib/proof-of-find';

export type LaunchKitVariant = 'full' | 'compact';

export type PostFindProfile = {
  playbookId: string;
  importId: string;
  launch: LaunchKitVariant;
};

export type PostFindContext = {
  chain: ProofChain;
  mode?: string;
  address: string;
  matchedPattern: string;
  attempts?: number;
  duration?: number;
};

function normalizeMode(chain: ProofChain, mode?: string): string {
  const m = (mode || 'wallet').toLowerCase();
  if (chain === 'sol' && (m === 'mint' || m === 'token')) return 'mint';
  if (chain === 'evm') {
    if (m === 'create2-salt' || m === 'create2-deployer' || m === 'create2') return m === 'create2' ? 'create2-salt' : m;
    if (m === 'contract' || m === 'create') return 'contract';
    return 'wallet';
  }
  if (chain === 'tron') {
    if (m === 'contract' || m === 'create') return 'contract';
    return 'wallet';
  }
  if (chain === 'btc') {
    if (m === 'taproot' || m === 'segwit' || m === 'legacy') return m;
    return 'legacy';
  }
  return 'wallet';
}

const PROFILES: Record<string, PostFindProfile> = {
  'sol:wallet': { playbookId: 'solWallet', importId: 'solWallet', launch: 'compact' },
  'sol:mint': { playbookId: 'solMint', importId: 'solMint', launch: 'full' },
  'evm:wallet': { playbookId: 'evmWallet', importId: 'evmWallet', launch: 'compact' },
  'evm:contract': { playbookId: 'evmContract', importId: 'evmDeploy', launch: 'full' },
  'evm:create2-salt': { playbookId: 'evmCreate2', importId: 'evmDeploy', launch: 'full' },
  'evm:create2-deployer': { playbookId: 'evmCreate2', importId: 'evmDeploy', launch: 'full' },
  'btc:legacy': { playbookId: 'btcWallet', importId: 'btcWif', launch: 'compact' },
  'btc:segwit': { playbookId: 'btcWallet', importId: 'btcWif', launch: 'compact' },
  'btc:taproot': { playbookId: 'btcWallet', importId: 'btcWif', launch: 'compact' },
  'tron:wallet': { playbookId: 'tronWallet', importId: 'tronHex', launch: 'compact' },
  'tron:contract': { playbookId: 'tronContract', importId: 'tronHex', launch: 'full' },
  'aptos:wallet': { playbookId: 'aptosWallet', importId: 'aptosHex', launch: 'compact' },
  'sui:wallet': { playbookId: 'suiWallet', importId: 'suiHex', launch: 'compact' },
  'ton:wallet': { playbookId: 'tonWallet', importId: 'tonHex', launch: 'compact' },
  'cardano:wallet': { playbookId: 'cardanoWallet', importId: 'cardanoHex', launch: 'compact' },
  'xrp:wallet': { playbookId: 'xrpWallet', importId: 'xrpSeed', launch: 'compact' },
};

export function resolvePostFindProfile(chain: ProofChain, mode?: string): PostFindProfile {
  const key = `${chain}:${normalizeMode(chain, mode)}`;
  return PROFILES[key] ?? {
    playbookId: 'genericWallet',
    importId: 'genericHex',
    launch: 'compact',
  };
}

export function shortAddress(address: string, head = 8, tail = 4): string {
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}
