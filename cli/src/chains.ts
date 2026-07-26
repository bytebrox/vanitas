/**
 * One-shot key → address attempts for each forge (Node CLI)
 */

import { getPublicKey as getEd25519Pub, utils as edUtils, etc as edEtc, hashes } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { sha3_256, keccak_256 } from '@noble/hashes/sha3.js';
import { blake2b } from '@noble/hashes/blake2.js';
import { getPublicKey as getSecpPub, utils as secpUtils, etc as secpEtc, schnorr } from '@noble/secp256k1';
import { WalletContractV4 } from '@ton/ton';
import { Buffer } from 'buffer';
import {
  base58Encode,
  btcLegacyAddress,
  btcSegwitAddress,
  btcTaprootAddress,
  btcWifCompressed,
  cardanoEnterpriseAddress,
  tronAddressFromEth20,
} from './encoding';

hashes.sha512 = sha512;

export type CliChain =
  | 'sol'
  | 'evm'
  | 'btc'
  | 'tron'
  | 'aptos'
  | 'sui'
  | 'ton'
  | 'cardano';

export type CliMode = string;

export interface MineConfig {
  chain: CliChain;
  mode: CliMode;
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
}

export interface MineHit {
  chain: CliChain;
  mode: CliMode;
  address: string;
  privateKey: string;
  extra?: Record<string, string>;
  attempts: number;
  durationMs: number;
}

function solAddress(pub: Uint8Array): string {
  return base58Encode(pub);
}

function ethAddress(pubUncompressed: Uint8Array): string {
  const hash = keccak_256(pubUncompressed.slice(1));
  return '0x' + secpEtc.bytesToHex(hash.slice(-20));
}

function strip0x(h: string): string {
  return (h || '').replace(/^0x/i, '').toLowerCase();
}

function stripCardano(v: string): string {
  const x = (v || '').trim().toLowerCase();
  return x.startsWith('addr1') ? x.slice(5) : x;
}

function matchHex(address: string, prefix: string, suffix: string): boolean {
  if (!prefix && !suffix) return true;
  const body = strip0x(address);
  const p = strip0x(prefix);
  const s = strip0x(suffix);
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}

function matchExact(address: string, prefix: string, suffix: string, caseSensitive: boolean): boolean {
  if (!prefix && !suffix) return true;
  if (caseSensitive) {
    return (!prefix || address.startsWith(prefix)) && (!suffix || address.endsWith(suffix));
  }
  const a = address.toLowerCase();
  return (
    (!prefix || a.startsWith(prefix.toLowerCase())) &&
    (!suffix || a.endsWith(suffix.toLowerCase()))
  );
}

function matchBtc(address: string, prefix: string, suffix: string, mode: string, caseSensitive: boolean): boolean {
  if (!prefix && !suffix) return true;
  if (mode === 'legacy') {
    let p = prefix;
    if (p && !p.startsWith('1') && address.startsWith('1')) p = `1${p}`;
    return matchExact(address, p, suffix, caseSensitive);
  }
  const lower = address.toLowerCase();
  const hrp = mode === 'taproot' ? 'bc1p' : 'bc1q';
  let p = (prefix || '').toLowerCase();
  if (p && !p.startsWith('bc1')) p = p.startsWith(hrp.slice(3)) ? `bc1${p}` : `${hrp}${p}`;
  // simplify: match on full address lower
  const bodyPref = p.startsWith(hrp) ? p : `${hrp}${p}`;
  const s = (suffix || '').toLowerCase();
  return (!prefix || lower.startsWith(bodyPref)) && (!suffix || lower.endsWith(s));
}

function matchTron(address: string, prefix: string, suffix: string, caseSensitive: boolean): boolean {
  let p = prefix;
  if (p && !p.startsWith('T')) p = `T${p}`;
  return matchExact(address, p, suffix, caseSensitive);
}

function matchCardano(address: string, prefix: string, suffix: string): boolean {
  if (!prefix && !suffix) return true;
  const body = stripCardano(address);
  const p = stripCardano(prefix);
  const s = stripCardano(suffix);
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}

function aptosAddress(pub: Uint8Array): string {
  const preimage = new Uint8Array(33);
  preimage.set(pub, 0);
  preimage[32] = 0x00;
  return '0x' + edEtc.bytesToHex(sha3_256(preimage));
}

function suiAddress(pub: Uint8Array): string {
  const preimage = new Uint8Array(33);
  preimage[0] = 0x00;
  preimage.set(pub, 1);
  return '0x' + edEtc.bytesToHex(blake2b(preimage, { dkLen: 32 }));
}

/** Run one attempt; return hit fields without attempts/duration if match */
export function tryOnce(cfg: MineConfig): Omit<MineHit, 'attempts' | 'durationMs'> | null {
  const { chain, mode, prefix, suffix, caseSensitive } = cfg;

  if (chain === 'sol') {
    const secret = edUtils.randomSecretKey();
    const pub = getEd25519Pub(secret);
    const address = solAddress(pub);
    if (!matchExact(address, prefix, suffix, caseSensitive)) return null;
    const sk = new Uint8Array(64);
    sk.set(secret, 0);
    sk.set(pub, 32);
    return {
      chain,
      mode: 'wallet',
      address,
      privateKey: `[${Array.from(sk).join(',')}]`,
      extra: { format: 'solana-cli-json-byte-array', publicKey: address },
    };
  }

  if (chain === 'evm') {
    const secret = secpUtils.randomSecretKey();
    const pub = getSecpPub(secret, false);
    const address = ethAddress(pub);
    if (!matchHex(address, prefix, suffix)) return null;
    return {
      chain,
      mode: 'wallet',
      address,
      privateKey: '0x' + secpEtc.bytesToHex(secret),
    };
  }

  if (chain === 'btc') {
    const secret = secpUtils.randomSecretKey();
    let address = '';
    if (mode === 'taproot') {
      address = btcTaprootAddress(schnorr.getPublicKey(secret));
    } else if (mode === 'segwit') {
      address = btcSegwitAddress(getSecpPub(secret, true));
    } else {
      address = btcLegacyAddress(getSecpPub(secret, true));
    }
    if (!matchBtc(address, prefix, suffix, mode, caseSensitive)) return null;
    return {
      chain,
      mode,
      address,
      privateKey: '0x' + secpEtc.bytesToHex(secret),
      extra: { wif: btcWifCompressed(secret) },
    };
  }

  if (chain === 'tron') {
    const secret = secpUtils.randomSecretKey();
    const pub = getSecpPub(secret, false);
    const hash = keccak_256(pub.slice(1));
    const address = tronAddressFromEth20(hash.slice(-20));
    if (!matchTron(address, prefix, suffix, caseSensitive)) return null;
    return {
      chain,
      mode: 'wallet',
      address,
      privateKey: secpEtc.bytesToHex(secret),
    };
  }

  if (chain === 'aptos') {
    const secret = edUtils.randomSecretKey();
    const pub = getEd25519Pub(secret);
    const address = aptosAddress(pub);
    if (!matchHex(address, prefix, suffix)) return null;
    return {
      chain,
      mode: 'wallet',
      address,
      privateKey: '0x' + edEtc.bytesToHex(secret),
      extra: { publicKey: '0x' + edEtc.bytesToHex(pub) },
    };
  }

  if (chain === 'sui') {
    const secret = edUtils.randomSecretKey();
    const pub = getEd25519Pub(secret);
    const address = suiAddress(pub);
    if (!matchHex(address, prefix, suffix)) return null;
    return {
      chain,
      mode: 'wallet',
      address,
      privateKey: '0x' + edEtc.bytesToHex(secret),
      extra: { publicKey: '0x' + edEtc.bytesToHex(pub) },
    };
  }

  if (chain === 'ton') {
    const secret = edUtils.randomSecretKey();
    const pub = getEd25519Pub(secret);
    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: Buffer.from(pub),
    });
    const bounceable = mode === 'bounceable';
    const uq = wallet.address.toString({ urlSafe: true, bounceable: false });
    const eq = wallet.address.toString({ urlSafe: true, bounceable: true });
    const address = bounceable ? eq : uq;
    if (!matchExact(address, prefix, suffix, true)) return null;
    return {
      chain,
      mode,
      address,
      privateKey: '0x' + edEtc.bytesToHex(secret),
      extra: { bounceableAddress: eq, publicKey: '0x' + edEtc.bytesToHex(pub) },
    };
  }

  if (chain === 'cardano') {
    const secret = edUtils.randomSecretKey();
    const pub = getEd25519Pub(secret);
    const address = cardanoEnterpriseAddress(pub);
    if (!matchCardano(address, prefix, suffix)) return null;
    return {
      chain,
      mode: 'enterprise',
      address,
      privateKey: '0x' + edEtc.bytesToHex(secret),
      extra: { publicKey: '0x' + edEtc.bytesToHex(pub) },
    };
  }

  return null;
}

export const CHAIN_META: {
  id: CliChain;
  label: string;
  modes: { id: string; label: string }[];
  hint: string;
}[] = [
  { id: 'sol', label: 'Solana', modes: [{ id: 'wallet', label: 'Wallet' }], hint: 'Base58 · case matters if you want' },
  { id: 'evm', label: 'EVM', modes: [{ id: 'wallet', label: 'Wallet' }], hint: 'Hex after 0x' },
  {
    id: 'btc',
    label: 'Bitcoin',
    modes: [
      { id: 'legacy', label: 'Legacy 1…' },
      { id: 'segwit', label: 'SegWit bc1q…' },
      { id: 'taproot', label: 'Taproot bc1p…' },
    ],
    hint: 'Fixed HRP is auto-handled',
  },
  { id: 'tron', label: 'Tron', modes: [{ id: 'wallet', label: 'Wallet' }], hint: 'Leading T optional' },
  { id: 'aptos', label: 'Aptos', modes: [{ id: 'wallet', label: 'Wallet' }], hint: 'Hex after 0x' },
  { id: 'sui', label: 'Sui', modes: [{ id: 'wallet', label: 'Wallet' }], hint: 'Hex after 0x' },
  {
    id: 'ton',
    label: 'TON',
    modes: [
      { id: 'non-bounceable', label: 'UQ wallet' },
      { id: 'bounceable', label: 'EQ' },
    ],
    hint: 'Base64url · case-sensitive',
  },
  { id: 'cardano', label: 'Cardano', modes: [{ id: 'enterprise', label: 'Enterprise addr1' }], hint: 'Body after addr1' },
];
