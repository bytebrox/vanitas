/**
 * CREATE2 helpers — hash init code, preview address (client-side).
 */

import { keccak_256 } from '@noble/hashes/sha3.js';

function strip0x(hex: string): string {
  return hex.trim().replace(/^0x/i, '');
}

function hexToBytes(hex: string): Uint8Array {
  const h = strip0x(hex);
  if (h.length % 2 !== 0) throw new Error('Hex length must be even');
  if (!/^[0-9a-fA-F]*$/.test(h)) throw new Error('Invalid hex');
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeHex(input: string, opts?: { exactBytes?: number }): {
  ok: boolean;
  hex: string;
  error?: string;
  bytes?: Uint8Array;
} {
  try {
    const bare = strip0x(input);
    if (!bare) return { ok: false, hex: '', error: 'Enter hex' };
    if (!/^[0-9a-fA-F]+$/.test(bare)) return { ok: false, hex: '', error: 'Invalid hex characters' };
    if (bare.length % 2 !== 0) return { ok: false, hex: '', error: 'Odd hex length' };
    const bytes = hexToBytes(bare);
    if (opts?.exactBytes != null && bytes.length !== opts.exactBytes) {
      return {
        ok: false,
        hex: `0x${bare.toLowerCase()}`,
        error: `Expected ${opts.exactBytes} bytes, got ${bytes.length}`,
      };
    }
    return { ok: true, hex: `0x${bare.toLowerCase()}`, bytes };
  } catch (e) {
    return { ok: false, hex: '', error: e instanceof Error ? e.message : 'Invalid hex' };
  }
}

/** keccak256(initCode) → 32-byte init code hash */
export function hashInitCode(bytecodeHex: string): {
  ok: boolean;
  initCodeHash?: string;
  byteLength?: number;
  error?: string;
} {
  const n = normalizeHex(bytecodeHex);
  if (!n.ok || !n.bytes) return { ok: false, error: n.error };
  if (n.bytes.length === 0) return { ok: false, error: 'Bytecode is empty' };
  const hash = keccak_256(n.bytes);
  return {
    ok: true,
    initCodeHash: `0x${bytesToHex(hash)}`,
    byteLength: n.bytes.length,
  };
}

/**
 * CREATE2: keccak256(0xff ‖ deployer(20) ‖ salt(32) ‖ initCodeHash(32))[12:]
 */
export function computeCreate2Address(
  deployer: string,
  salt: string,
  initCodeHash: string
): { ok: boolean; address?: string; error?: string } {
  const d = normalizeHex(deployer, { exactBytes: 20 });
  if (!d.ok || !d.bytes) return { ok: false, error: `Deployer: ${d.error}` };

  let saltBytes: Uint8Array;
  const sBare = strip0x(salt);
  if (!sBare) {
    saltBytes = new Uint8Array(32);
  } else {
    const s = normalizeHex(salt);
    if (!s.ok || !s.bytes) return { ok: false, error: `Salt: ${s.error}` };
    if (s.bytes.length > 32) return { ok: false, error: 'Salt longer than 32 bytes' };
    saltBytes = new Uint8Array(32);
    saltBytes.set(s.bytes, 32 - s.bytes.length);
  }

  const h = normalizeHex(initCodeHash, { exactBytes: 32 });
  if (!h.ok || !h.bytes) return { ok: false, error: `Init code hash: ${h.error}` };

  const buf = new Uint8Array(1 + 20 + 32 + 32);
  buf[0] = 0xff;
  buf.set(d.bytes, 1);
  buf.set(saltBytes, 21);
  buf.set(h.bytes, 53);
  const addr = keccak_256(buf).slice(-20);
  return { ok: true, address: `0x${bytesToHex(addr)}` };
}

export function matchesCreate2Pattern(
  address: string,
  prefix: string,
  suffix: string
): boolean {
  const body = strip0x(address).toLowerCase();
  const p = strip0x(prefix).toLowerCase();
  const s = strip0x(suffix).toLowerCase();
  return (!p || body.startsWith(p)) && (!s || body.endsWith(s));
}

export function buildCreate2ForgeHref(opts: {
  mode: 'create2-salt' | 'create2-deployer';
  prefix?: string;
  suffix?: string;
  initCodeHash?: string;
  salt?: string;
}): string {
  const qs = new URLSearchParams();
  qs.set('mode', opts.mode);
  if (opts.prefix) qs.set('prefix', strip0x(opts.prefix));
  if (opts.suffix) qs.set('suffix', strip0x(opts.suffix));
  if (opts.initCodeHash) qs.set('initCodeHash', strip0x(opts.initCodeHash));
  if (opts.salt && opts.mode === 'create2-deployer') qs.set('salt', strip0x(opts.salt));
  return `/evm?${qs.toString()}`;
}
