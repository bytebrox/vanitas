/**
 * Deterministic vanity search over BIP32 derivation indices.
 *
 * A normal vanity generator hands you a bare private key you must never lose.
 * Here the mnemonic is fixed up front and only the derivation index varies, so
 * a hit is reproducible from twelve words in any standard wallet.
 *
 * That ordering is also what makes it fast: the expensive PBKDF2 seed stretch
 * runs once, and each candidate costs one or two HMAC-SHA512 rounds plus a
 * public key derivation.
 *
 * Shared by the seed worker and the UI, so it must stay free of DOM and Node
 * built-ins.
 */

import { hmac } from '@noble/hashes/hmac.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import * as ed25519 from '@noble/ed25519';
import { getPublicKey as secp256k1PublicKey, schnorr } from '@noble/secp256k1';
import { HDKey } from '@scure/bip32';
import {
  btcLegacyAddress,
  btcSegwitAddress,
  btcTaprootAddress,
  btcWifCompressed,
  tronAddressFromEth20,
} from '../lib/address-encoding';

ed25519.hashes.sha512 = sha512;

export type SeedChain = 'sol' | 'evm' | 'btc' | 'tron';

/** Stands in for the level being ground wherever a path is shown unfilled. */
export const INDEX_MARKER = '{i}';

export interface SeedPathStyle {
  id: string;
  chain: SeedChain;
  /** Shown to the user, with INDEX_MARKER at the level that is ground. */
  template: string;
  /** Wallets known to use this layout. */
  wallets: string[];
  /**
   * Bitcoin address encoding when chain === 'btc'.
   * legacy → BIP44 P2PKH · segwit → BIP84 P2WPKH · taproot → BIP86 P2TR
   */
  btcMode?: 'legacy' | 'segwit' | 'taproot';
}

export const SEED_PATH_STYLES: SeedPathStyle[] = [
  {
    id: 'sol-account',
    chain: 'sol',
    template: "m/44'/501'/{i}'/0'",
    wallets: ['Phantom', 'Backpack', 'Ledger Live'],
  },
  {
    id: 'sol-short',
    chain: 'sol',
    template: "m/44'/501'/{i}'",
    wallets: ['Solflare', 'Sollet'],
  },
  {
    id: 'evm-address',
    chain: 'evm',
    template: "m/44'/60'/0'/0/{i}",
    wallets: ['MetaMask', 'Rabby', 'Rainbow'],
  },
  {
    id: 'evm-account',
    chain: 'evm',
    template: "m/44'/60'/{i}'/0/0",
    wallets: ['Ledger Live', 'Trezor'],
  },
  {
    id: 'btc-legacy',
    chain: 'btc',
    btcMode: 'legacy',
    template: "m/44'/0'/0'/0/{i}",
    wallets: ['Electrum', 'Sparrow', 'Ledger Live'],
  },
  {
    id: 'btc-segwit',
    chain: 'btc',
    btcMode: 'segwit',
    template: "m/84'/0'/0'/0/{i}",
    wallets: ['Electrum', 'Sparrow', 'BlueWallet'],
  },
  {
    id: 'btc-taproot',
    chain: 'btc',
    btcMode: 'taproot',
    template: "m/86'/0'/0'/0/{i}",
    wallets: ['Sparrow', 'Electrum', 'BitBox'],
  },
  {
    id: 'btc-legacy-account',
    chain: 'btc',
    btcMode: 'legacy',
    template: "m/44'/0'/{i}'/0/0",
    wallets: ['Ledger Live (account)'],
  },
  {
    id: 'tron-address',
    chain: 'tron',
    template: "m/44'/195'/0'/0/{i}",
    wallets: ['TronLink', 'Ledger'],
  },
  {
    id: 'tron-account',
    chain: 'tron',
    template: "m/44'/195'/{i}'/0/0",
    wallets: ['Ledger Live'],
  },
];

export function pathStyleById(id: string): SeedPathStyle | undefined {
  return SEED_PATH_STYLES.find((s) => s.id === id);
}

export function renderPath(style: SeedPathStyle, index: number): string {
  return style.template.replace(INDEX_MARKER, String(index));
}

/** Highest index a hardened level can hold. */
export const MAX_INDEX = 0x7fffffff;

/* ------------------------------------------------- SLIP-0010 for ed25519 */

const ED25519_DOMAIN = new TextEncoder().encode('ed25519 seed');
const HARDENED = 0x80000000;

interface Slip10Node {
  key: Uint8Array;
  chainCode: Uint8Array;
}

function slip10Master(seed: Uint8Array): Slip10Node {
  const i = hmac(sha512, ED25519_DOMAIN, seed);
  return { key: i.slice(0, 32), chainCode: i.slice(32) };
}

/** SLIP-0010 over ed25519 supports hardened derivation only. */
function slip10Child(parent: Slip10Node, index: number): Slip10Node {
  const data = new Uint8Array(37);
  data[0] = 0;
  data.set(parent.key, 1);
  new DataView(data.buffer).setUint32(33, index >>> 0, false);
  const i = hmac(sha512, parent.chainCode, data);
  return { key: i.slice(0, 32), chainCode: i.slice(32) };
}

/* ----------------------------------------------------------------- base58 */

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';

  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;

  const size = Math.ceil((bytes.length * 138) / 100) + 1;
  const buf = new Uint8Array(size);

  let length = 0;
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    let j = 0;
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 256 * buf[k];
      buf[k] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    length = j;
  }

  let i = size - length;
  while (i < size && buf[i] === 0) i++;

  let out = '1'.repeat(zeros);
  for (; i < size; i++) out += BASE58[buf[i]];
  return out;
}

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

function evmAddressFor(privateKey: Uint8Array): string {
  const uncompressed = secp256k1PublicKey(privateKey, false);
  return '0x' + toHex(keccak_256(uncompressed.slice(1)).slice(-20));
}

function eth20For(privateKey: Uint8Array): Uint8Array {
  const uncompressed = secp256k1PublicKey(privateKey, false);
  return keccak_256(uncompressed.slice(1)).slice(-20);
}

function tronAddressFor(privateKey: Uint8Array): string {
  return tronAddressFromEth20(eth20For(privateKey));
}

function btcAddressFor(privateKey: Uint8Array, mode: 'legacy' | 'segwit' | 'taproot'): string {
  if (mode === 'taproot') {
    return btcTaprootAddress(schnorr.getPublicKey(privateKey));
  }
  const pub = secp256k1PublicKey(privateKey, true);
  return mode === 'segwit' ? btcSegwitAddress(pub) : btcLegacyAddress(pub);
}

/* -------------------------------------------------------------- derivation */

export interface SeedSecret {
  /** Import format for the chain: base58 keypair (Solana), 0x hex (EVM/Tron), or WIF (BTC). */
  privateKey: string;
  address: string;
}

/**
 * Derivation walker with the constant part of the path precomputed, so the
 * grind loop only pays for the level that actually changes.
 */
export interface SeedWalker {
  addressAt(index: number): string;
  /** Full secret material — only called once a match is found. */
  secretAt(index: number): SeedSecret;
}

function createSolWalker(seed: Uint8Array, style: SeedPathStyle): SeedWalker {
  // m/44'/501' is fixed; the trailing level differs per wallet convention.
  const base = slip10Child(slip10Child(slip10Master(seed), 44 + HARDENED), 501 + HARDENED);
  const hasTrailingChange = style.id === 'sol-account';

  const nodeAt = (index: number): Slip10Node => {
    const account = slip10Child(base, index + HARDENED);
    return hasTrailingChange ? slip10Child(account, HARDENED) : account;
  };

  return {
    addressAt(index) {
      return base58Encode(ed25519.getPublicKey(nodeAt(index).key));
    },
    secretAt(index) {
      const node = nodeAt(index);
      const publicKey = ed25519.getPublicKey(node.key);
      // Solana's 64-byte keypair layout is seed ‖ public key.
      const secretKey = new Uint8Array(64);
      secretKey.set(node.key, 0);
      secretKey.set(publicKey, 32);
      return {
        privateKey: base58Encode(secretKey),
        address: base58Encode(publicKey),
      };
    },
  };
}

function createEvmWalker(seed: Uint8Array, style: SeedPathStyle): SeedWalker {
  const master = HDKey.fromMasterSeed(seed);
  const perAddress = style.id === 'evm-address';
  const base = perAddress ? master.derive("m/44'/60'/0'/0") : master.derive("m/44'/60'");

  const privateAt = (index: number): Uint8Array => {
    const node = perAddress
      ? base.deriveChild(index)
      : base.deriveChild(index + HARDENED).derive('m/0/0');
    if (!node.privateKey) throw new Error('derivation produced no private key');
    return node.privateKey;
  };

  return {
    addressAt(index) {
      return evmAddressFor(privateAt(index));
    },
    secretAt(index) {
      const key = privateAt(index);
      return {
        privateKey: '0x' + toHex(key),
        address: evmAddressFor(key),
      };
    },
  };
}

function createBtcWalker(seed: Uint8Array, style: SeedPathStyle): SeedWalker {
  const mode = style.btcMode || 'legacy';
  const purpose = mode === 'segwit' ? 84 : mode === 'taproot' ? 86 : 44;
  const master = HDKey.fromMasterSeed(seed);
  const perAddress = !style.id.endsWith('-account');
  const base = perAddress
    ? master.derive(`m/${purpose}'/0'/0'/0`)
    : master.derive(`m/${purpose}'/0'`);

  const privateAt = (index: number): Uint8Array => {
    const node = perAddress
      ? base.deriveChild(index)
      : base.deriveChild(index + HARDENED).derive('m/0/0');
    if (!node.privateKey) throw new Error('derivation produced no private key');
    return node.privateKey;
  };

  return {
    addressAt(index) {
      return btcAddressFor(privateAt(index), mode);
    },
    secretAt(index) {
      const key = privateAt(index);
      return {
        privateKey: btcWifCompressed(key),
        address: btcAddressFor(key, mode),
      };
    },
  };
}

function createTronWalker(seed: Uint8Array, style: SeedPathStyle): SeedWalker {
  const master = HDKey.fromMasterSeed(seed);
  const perAddress = style.id === 'tron-address';
  const base = perAddress ? master.derive("m/44'/195'/0'/0") : master.derive("m/44'/195'");

  const privateAt = (index: number): Uint8Array => {
    const node = perAddress
      ? base.deriveChild(index)
      : base.deriveChild(index + HARDENED).derive('m/0/0');
    if (!node.privateKey) throw new Error('derivation produced no private key');
    return node.privateKey;
  };

  return {
    addressAt(index) {
      return tronAddressFor(privateAt(index));
    },
    secretAt(index) {
      const key = privateAt(index);
      return {
        privateKey: '0x' + toHex(key),
        address: tronAddressFor(key),
      };
    },
  };
}

export function createWalker(seed: Uint8Array, style: SeedPathStyle): SeedWalker {
  switch (style.chain) {
    case 'sol':
      return createSolWalker(seed, style);
    case 'evm':
      return createEvmWalker(seed, style);
    case 'btc':
      return createBtcWalker(seed, style);
    case 'tron':
      return createTronWalker(seed, style);
    default: {
      const _exhaustive: never = style.chain;
      throw new Error(`Unsupported seed chain: ${_exhaustive}`);
    }
  }
}

/** Normalize user prefix so it matches how forge patterns work per chain. */
function normalizeMatchPrefix(chain: SeedChain, address: string, prefix: string): string {
  if (!prefix) return '';
  if (chain === 'btc') {
    if (address.startsWith('bc1p')) {
      const p = prefix.toLowerCase();
      if (p.startsWith('bc1p') || p.startsWith('bc1')) return p;
      return `bc1p${p}`;
    }
    if (address.startsWith('bc1')) {
      const p = prefix.toLowerCase();
      if (p.startsWith('bc1q') || p.startsWith('bc1')) return p;
      return `bc1q${p}`;
    }
    return prefix.startsWith('1') ? prefix : `1${prefix}`;
  }
  if (chain === 'tron') {
    return prefix.startsWith('T') ? prefix : `T${prefix}`;
  }
  return prefix;
}

/**
 * Prefix/suffix match.
 * EVM hex is always case-insensitive; bech32 BTC too; Base58 honours the flag.
 */
export function matchesAddress(
  chain: SeedChain,
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): boolean {
  if (!prefix && !suffix) return true;

  if (chain === 'evm') {
    const hay = address.slice(2).toLowerCase();
    const p = prefix.toLowerCase();
    const s = suffix.toLowerCase();
    return (!p || hay.startsWith(p)) && (!s || hay.endsWith(s));
  }

  const normPrefix = normalizeMatchPrefix(chain, address, prefix);
  const bech = chain === 'btc' && address.startsWith('bc1');
  const insensitive = bech || !caseSensitive;

  const hay = insensitive ? address.toLowerCase() : address;
  const p = insensitive ? normPrefix.toLowerCase() : normPrefix;
  const s = insensitive ? suffix.toLowerCase() : suffix;

  return (!p || hay.startsWith(p)) && (!s || hay.endsWith(s));
}
