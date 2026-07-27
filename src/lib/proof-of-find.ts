/**
 * Shareable proof of find — address + pattern only, never private keys
 */

export type ProofChain =
  | 'sol'
  | 'evm'
  | 'btc'
  | 'tron'
  | 'aptos'
  | 'sui'
  | 'ton'
  | 'cardano'
  | 'xrp';

export interface ProofPayload {
  chain: ProofChain;
  address: string;
  prefix?: string;
  suffix?: string;
  mode?: string;
  attempts?: number;
  duration?: number;
}

export function buildProofUrl(origin: string, payload: ProofPayload): string {
  const params = new URLSearchParams();
  params.set('chain', payload.chain);
  params.set('address', payload.address);
  if (payload.prefix) params.set('prefix', payload.prefix);
  if (payload.suffix) params.set('suffix', payload.suffix);
  if (payload.mode) params.set('mode', payload.mode);
  if (payload.attempts != null) params.set('attempts', String(Math.round(payload.attempts)));
  if (payload.duration != null) params.set('duration', String(Math.round(payload.duration)));
  return `${origin.replace(/\/$/, '')}/proof?${params.toString()}`;
}

/** Compact embeddable proof card (iframe) — same query params as /proof */
export function buildEmbedProofUrl(origin: string, payload: ProofPayload): string {
  return buildProofUrl(origin, payload).replace(/\/proof\?/, '/embed/proof?');
}

export function parseProofSearchParams(
  sp: URLSearchParams | { get(name: string): string | null }
): ProofPayload | null {
  const chain = sp.get('chain') as ProofChain | null;
  const address = sp.get('address');
  if (!chain || !address) return null;
  const attemptsRaw = sp.get('attempts');
  const durationRaw = sp.get('duration');
  return {
    chain,
    address,
    prefix: sp.get('prefix') || undefined,
    suffix: sp.get('suffix') || undefined,
    mode: sp.get('mode') || undefined,
    attempts: attemptsRaw ? Number(attemptsRaw) : undefined,
    duration: durationRaw ? Number(durationRaw) : undefined,
  };
}

/** Split matchedPattern like "cafe...dead" or "prefix...suffix" */
export function splitMatchedPattern(pattern: string): { prefix: string; suffix: string } {
  const idx = pattern.indexOf('...');
  if (idx === -1) return { prefix: pattern, suffix: '' };
  return { prefix: pattern.slice(0, idx), suffix: pattern.slice(idx + 3) };
}

function strip0x(hex: string): string {
  return (hex || '').replace(/^0x/i, '').toLowerCase();
}

function stripCardano(value: string): string {
  const v = (value || '').trim().toLowerCase();
  return v.startsWith('addr1') ? v.slice(5) : v;
}

/**
 * Client-side verify that address matches claimed pattern for the chain.
 * Conservative: unknown chains fail closed.
 */
export function verifyProofMatch(payload: ProofPayload): { ok: boolean; reason: string } {
  const { chain, address, prefix = '', suffix = '' } = payload;
  if (!address) return { ok: false, reason: 'Missing address' };
  if (!prefix && !suffix) return { ok: false, reason: 'Missing pattern' };

  switch (chain) {
    case 'evm':
    case 'aptos':
    case 'sui': {
      if (!/^0x[0-9a-fA-F]+$/.test(address)) {
        return { ok: false, reason: 'Address is not hex 0x…' };
      }
      const body = strip0x(address);
      const p = strip0x(prefix);
      const s = strip0x(suffix);
      const ok = (!p || body.startsWith(p)) && (!s || body.endsWith(s));
      return ok
        ? { ok: true, reason: 'Address matches pattern' }
        : { ok: false, reason: 'Address does not match pattern' };
    }
    case 'cardano': {
      if (!address.toLowerCase().startsWith('addr1')) {
        return { ok: false, reason: 'Not a mainnet addr1… address' };
      }
      const body = stripCardano(address);
      let p = stripCardano(prefix);
      const s = stripCardano(suffix);
      // Enterprise body always starts with `v`; UI often omits it
      if (p && !p.startsWith('v')) p = `v${p}`;
      const ok = (!p || body.startsWith(p)) && (!s || body.endsWith(s));
      return ok
        ? { ok: true, reason: 'Address matches pattern' }
        : { ok: false, reason: 'Address does not match pattern' };
    }
    case 'ton': {
      let p = prefix;
      if (p && !p.startsWith('UQ') && !p.startsWith('EQ')) {
        const tag = payload.mode === 'bounceable' ? 'EQ' : 'UQ';
        p = tag + p;
      }
      const ok =
        (!p || address.startsWith(p)) && (!suffix || address.endsWith(suffix));
      return ok
        ? { ok: true, reason: 'Address matches pattern' }
        : { ok: false, reason: 'Address does not match pattern' };
    }
    case 'btc': {
      const addr = address.toLowerCase();
      let p = prefix;
      let s = suffix;
      // soft: if pattern lacks fixed HRP, still allow body match heuristics
      if (addr.startsWith('bc1p')) {
        const body = addr.slice(4);
        p = p.toLowerCase().replace(/^bc1p/, '');
        s = s.toLowerCase();
        const ok = (!p || body.startsWith(p)) && (!s || body.endsWith(s));
        return ok
          ? { ok: true, reason: 'Address matches pattern' }
          : { ok: false, reason: 'Address does not match pattern' };
      }
      if (addr.startsWith('bc1q')) {
        const body = addr.slice(4);
        p = p.toLowerCase().replace(/^bc1q/, '');
        s = s.toLowerCase();
        const ok = (!p || body.startsWith(p)) && (!s || body.endsWith(s));
        return ok
          ? { ok: true, reason: 'Address matches pattern' }
          : { ok: false, reason: 'Address does not match pattern' };
      }
      // legacy: case-insensitive
      const a = address;
      let pref = prefix;
      if (pref && !pref.startsWith('1') && a.startsWith('1')) pref = `1${pref}`;
      const ok =
        (!pref || a.toLowerCase().startsWith(pref.toLowerCase())) &&
        (!suffix || a.toLowerCase().endsWith(suffix.toLowerCase()));
      return ok
        ? { ok: true, reason: 'Address matches pattern' }
        : { ok: false, reason: 'Address does not match pattern' };
    }
    case 'tron': {
      let p = prefix;
      if (p && !p.startsWith('T') && address.startsWith('T')) p = `T${p}`;
      const ok =
        (!p || address.toLowerCase().startsWith(p.toLowerCase())) &&
        (!suffix || address.toLowerCase().endsWith(suffix.toLowerCase()));
      return ok
        ? { ok: true, reason: 'Address matches pattern' }
        : { ok: false, reason: 'Address does not match pattern' };
    }
    case 'xrp': {
      if (!address.startsWith('r')) {
        return { ok: false, reason: 'Not a classic r… address' };
      }
      let p = prefix;
      if (p && !p.startsWith('r')) p = `r${p}`;
      const ok =
        (!p || address.toLowerCase().startsWith(p.toLowerCase())) &&
        (!suffix || address.toLowerCase().endsWith(suffix.toLowerCase()));
      return ok
        ? { ok: true, reason: 'Address matches pattern' }
        : { ok: false, reason: 'Address does not match pattern' };
    }
    case 'sol': {
      const ok =
        (!prefix || address.startsWith(prefix) || address.toLowerCase().startsWith(prefix.toLowerCase())) &&
        (!suffix || address.endsWith(suffix) || address.toLowerCase().endsWith(suffix.toLowerCase()));
      return ok
        ? { ok: true, reason: 'Address matches pattern' }
        : { ok: false, reason: 'Address does not match pattern' };
    }
    default:
      return { ok: false, reason: 'Unknown chain' };
  }
}
