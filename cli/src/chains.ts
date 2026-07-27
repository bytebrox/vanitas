/**
 * One-shot key → address attempts for each forge (Node CLI)
 *
 * Modes mirror the web forges:
 * - sol: wallet | mint (same keypair math; mint is UI framing)
 * - evm: wallet | contract | create2-salt | create2-deployer
 * - tron: wallet | contract
 * - btc / ton / etc.: unchanged
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
  xrpClassicAddress,
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
  | 'cardano'
  | 'xrp';

export type CliMode = string;

export interface MineConfig {
  chain: CliChain;
  mode: CliMode;
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  /** CREATE2: 32-byte hex salt — required for create2-deployer */
  create2Salt?: string;
  /** CREATE2: 32-byte keccak of init code */
  create2InitCodeHash?: string;
  /** CREATE2 salt mode: fixed deployer private key hex */
  create2DeployerKey?: string;
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

function parseHex32(hex: string, label: string): Uint8Array {
  const clean = strip0x(hex);
  if (!/^[0-9a-f]{64}$/.test(clean)) {
    throw new Error(`${label} must be 32 bytes hex`);
  }
  return secpEtc.hexToBytes(clean);
}

/** EVM CREATE(deployer, nonce=0) → last 20 bytes of keccak(RLP([from, 0])) */
function contractAddressAtNonce0(from20: Uint8Array): string {
  const rlp = new Uint8Array(23);
  rlp[0] = 0xd6;
  rlp[1] = 0x94;
  rlp.set(from20, 2);
  rlp[22] = 0x80;
  return '0x' + secpEtc.bytesToHex(keccak_256(rlp).slice(-20));
}

function contractEth20AtNonce0(from20: Uint8Array): Uint8Array {
  const rlp = new Uint8Array(23);
  rlp[0] = 0xd6;
  rlp[1] = 0x94;
  rlp.set(from20, 2);
  rlp[22] = 0x80;
  return keccak_256(rlp).slice(-20);
}

/** CREATE2: keccak256(0xff ‖ deployer ‖ salt ‖ initCodeHash)[12:] */
function create2Address(
  deployer20: Uint8Array,
  salt32: Uint8Array,
  initCodeHash32: Uint8Array
): string {
  const buf = new Uint8Array(1 + 20 + 32 + 32);
  buf[0] = 0xff;
  buf.set(deployer20, 1);
  buf.set(salt32, 21);
  buf.set(initCodeHash32, 53);
  return '0x' + secpEtc.bytesToHex(keccak_256(buf).slice(-20));
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
  let p = stripCardano(prefix);
  const s = stripCardano(suffix);
  if (p && !p.startsWith('v')) p = `v${p}`;
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

/** Pre-parsed CREATE2 constants — prepared once per worker */
export interface EvmCreate2Prepared {
  mode: 'create2-salt' | 'create2-deployer';
  initHash: Uint8Array;
  initHashHex: string;
  /** create2-salt: fixed deployer */
  deployerKeyHex?: string;
  deployerAddress?: string;
  deployer20?: Uint8Array;
  /** create2-deployer: fixed salt */
  salt?: Uint8Array;
  saltHex?: string;
}

export function prepareEvmCreate2(cfg: MineConfig): EvmCreate2Prepared | null {
  if (cfg.chain !== 'evm') return null;
  if (cfg.mode === 'create2-salt') {
    const initHash = parseHex32(cfg.create2InitCodeHash || '', 'initCodeHash');
    const keyHex = strip0x(cfg.create2DeployerKey || '');
    if (!/^[0-9a-f]{64}$/.test(keyHex)) {
      throw new Error('create2DeployerKey must be 32 bytes hex');
    }
    const deployerSecret = secpEtc.hexToBytes(keyHex);
    const deployerPub = getSecpPub(deployerSecret, false);
    const deployerAddress = ethAddress(deployerPub);
    return {
      mode: 'create2-salt',
      initHash,
      initHashHex: '0x' + secpEtc.bytesToHex(initHash),
      deployerKeyHex: '0x' + keyHex,
      deployerAddress,
      deployer20: secpEtc.hexToBytes(deployerAddress.slice(2)),
    };
  }
  if (cfg.mode === 'create2-deployer') {
    const initHash = parseHex32(cfg.create2InitCodeHash || '', 'initCodeHash');
    const salt = parseHex32(cfg.create2Salt || '', 'salt');
    return {
      mode: 'create2-deployer',
      initHash,
      initHashHex: '0x' + secpEtc.bytesToHex(initHash),
      salt,
      saltHex: '0x' + secpEtc.bytesToHex(salt),
    };
  }
  return null;
}

function tryEvm(
  cfg: MineConfig,
  prepared?: EvmCreate2Prepared | null
): Omit<MineHit, 'attempts' | 'durationMs'> | null {
  const { mode, prefix, suffix } = cfg;
  const c2 = prepared ?? prepareEvmCreate2(cfg);

  if (c2?.mode === 'create2-salt' && c2.deployer20 && c2.deployerKeyHex && c2.deployerAddress) {
    const salt = secpUtils.randomSecretKey();
    const address = create2Address(c2.deployer20, salt, c2.initHash);
    if (!matchHex(address, prefix, suffix)) return null;
    return {
      chain: 'evm',
      mode,
      address,
      privateKey: c2.deployerKeyHex,
      extra: {
        deployerAddress: c2.deployerAddress,
        create2Salt: '0x' + secpEtc.bytesToHex(salt),
        create2InitCodeHash: c2.initHashHex,
      },
    };
  }

  if (c2?.mode === 'create2-deployer' && c2.salt && c2.saltHex) {
    const secret = secpUtils.randomSecretKey();
    const pub = getSecpPub(secret, false);
    const walletAddress = ethAddress(pub);
    const from20 = secpEtc.hexToBytes(walletAddress.slice(2));
    const address = create2Address(from20, c2.salt, c2.initHash);
    if (!matchHex(address, prefix, suffix)) return null;
    return {
      chain: 'evm',
      mode,
      address,
      privateKey: '0x' + secpEtc.bytesToHex(secret),
      extra: {
        deployerAddress: walletAddress,
        create2Salt: c2.saltHex,
        create2InitCodeHash: c2.initHashHex,
      },
    };
  }

  const secret = secpUtils.randomSecretKey();
  const pub = getSecpPub(secret, false);
  const walletAddress = ethAddress(pub);
  let address = walletAddress;
  const extra: Record<string, string> = {};
  if (mode === 'contract') {
    const from20 = secpEtc.hexToBytes(walletAddress.slice(2));
    address = contractAddressAtNonce0(from20);
    extra.deployerAddress = walletAddress;
  }
  if (!matchHex(address, prefix, suffix)) return null;
  return {
    chain: 'evm',
    mode: mode === 'contract' ? 'contract' : 'wallet',
    address,
    privateKey: '0x' + secpEtc.bytesToHex(secret),
    extra: Object.keys(extra).length ? extra : undefined,
  };
}

/** Run one attempt; return hit fields without attempts/duration if match */
export function tryOnce(
  cfg: MineConfig,
  preparedCreate2?: EvmCreate2Prepared | null
): Omit<MineHit, 'attempts' | 'durationMs'> | null {
  const { chain, mode, prefix, suffix, caseSensitive } = cfg;

  if (chain === 'sol') {
    const secret = edUtils.randomSecretKey();
    const pub = getEd25519Pub(secret);
    const address = solAddress(pub);
    if (!matchExact(address, prefix, suffix, caseSensitive)) return null;
    const sk = new Uint8Array(64);
    sk.set(secret, 0);
    sk.set(pub, 32);
    const solMode = mode === 'mint' ? 'mint' : 'wallet';
    return {
      chain,
      mode: solMode,
      address,
      privateKey: `[${Array.from(sk).join(',')}]`,
      extra: {
        format: 'solana-cli-json-byte-array',
        publicKey: address,
        ...(solMode === 'mint' ? { note: 'Same keypair math as wallet; use as mint authority / mint keypair' } : {}),
      },
    };
  }

  if (chain === 'evm') {
    return tryEvm(cfg, preparedCreate2);
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
    const wallet20 = hash.slice(-20);
    const walletAddress = tronAddressFromEth20(wallet20);
    let address = walletAddress;
    const extra: Record<string, string> = {};
    if (mode === 'contract') {
      address = tronAddressFromEth20(contractEth20AtNonce0(wallet20));
      extra.deployerAddress = walletAddress;
    }
    if (!matchTron(address, prefix, suffix, caseSensitive)) return null;
    return {
      chain,
      mode: mode === 'contract' ? 'contract' : 'wallet',
      address,
      privateKey: secpEtc.bytesToHex(secret),
      extra: Object.keys(extra).length ? extra : undefined,
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
    let p = prefix;
    if (p && !p.startsWith('UQ') && !p.startsWith('EQ')) {
      p = (bounceable ? 'EQ' : 'UQ') + p;
    }
    if (!matchExact(address, p, suffix, true)) return null;
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

  if (chain === 'xrp') {
    const secret = secpUtils.randomSecretKey();
    const pub = getSecpPub(secret, true);
    const address = xrpClassicAddress(pub);
    let p = prefix;
    if (p && !p.startsWith('r')) p = `r${p}`;
    if (!matchExact(address, p, suffix, caseSensitive)) return null;
    return {
      chain,
      mode: 'classic',
      address,
      privateKey: '0x' + secpEtc.bytesToHex(secret),
      extra: { publicKey: '0x' + secpEtc.bytesToHex(pub) },
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
  {
    id: 'sol',
    label: 'Solana',
    modes: [
      { id: 'wallet', label: 'Wallet' },
      { id: 'mint', label: 'Token mint' },
    ],
    hint: 'Base58 · case matters if you want',
  },
  {
    id: 'evm',
    label: 'EVM',
    modes: [
      { id: 'wallet', label: 'Wallet' },
      { id: 'contract', label: 'CREATE (nonce 0)' },
      { id: 'create2-salt', label: 'CREATE2 grind salt' },
      { id: 'create2-deployer', label: 'CREATE2 grind deployer' },
    ],
    hint: 'Hex after 0x · CREATE2 needs --init-code-hash',
  },
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
  {
    id: 'tron',
    label: 'Tron',
    modes: [
      { id: 'wallet', label: 'Wallet' },
      { id: 'contract', label: 'CREATE (nonce 0)' },
    ],
    hint: 'Leading T optional',
  },
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
  { id: 'cardano', label: 'Cardano', modes: [{ id: 'enterprise', label: 'Enterprise addr1' }], hint: 'After addr1v · first char y/9/x/8' },
  { id: 'xrp', label: 'XRP', modes: [{ id: 'classic', label: 'Classic r…' }], hint: 'After fixed r · XRPL Base58' },
];
