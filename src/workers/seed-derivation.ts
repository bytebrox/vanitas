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
import { getPublicKey as secp256k1PublicKey } from '@noble/secp256k1';
import { HDKey } from '@scure/bip32';

ed25519.hashes.sha512 = sha512;

export type SeedChain = 'sol' | 'evm';

/** Stands in for the level being ground wherever a path is shown unfilled. */
export const INDEX_MARKER = '{i}';

export interface SeedPathStyle {
  id: string;
  chain: SeedChain;
  /** Shown to the user, with INDEX_MARKER at the level that is ground. */
  template: string;
  /** Wallets known to use this layout. */
  wallets: string[];
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

/* -------------------------------------------------------------- derivation */

export interface SeedSecret {
  /** Import format for the chain: base58 keypair (Solana) or 0x hex (EVM). */
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

export function createWalker(seed: Uint8Array, style: SeedPathStyle): SeedWalker {
  return style.chain === 'sol'
    ? createSolWalker(seed, style)
    : createEvmWalker(seed, style);
}

/** Prefix/suffix match, case-insensitive for EVM hex, exact for base58. */
export function matchesAddress(
  chain: SeedChain,
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): boolean {
  if (!prefix && !suffix) return true;

  const body = chain === 'evm' ? address.slice(2) : address;
  const insensitive = chain === 'evm' || !caseSensitive;

  const hay = insensitive ? body.toLowerCase() : body;
  const p = insensitive ? prefix.toLowerCase() : prefix;
  const s = insensitive ? suffix.toLowerCase() : suffix;

  return (!p || hay.startsWith(p)) && (!s || hay.endsWith(s));
}
