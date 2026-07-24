/**
 * Local recent finds — addresses only, never private keys
 */

export type FindChain = 'sol' | 'evm' | 'btc' | 'tron' | 'aptos' | 'sui';

export interface RecentFind {
  chain: FindChain;
  mode?: string;
  address: string;
  pattern: string;
  at: string; // ISO
}

const STORAGE_KEY = 'vanitas.recentFinds';
const MAX_FINDS = 20;

export function loadRecentFinds(): RecentFind[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentFind[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f) => f && typeof f.address === 'string' && typeof f.chain === 'string'
    );
  } catch {
    return [];
  }
}

export function saveRecentFind(entry: Omit<RecentFind, 'at'> & { at?: string }): RecentFind[] {
  if (typeof window === 'undefined') return [];
  const next: RecentFind = {
    chain: entry.chain,
    mode: entry.mode,
    address: entry.address,
    pattern: entry.pattern,
    at: entry.at || new Date().toISOString(),
  };
  const prev = loadRecentFinds().filter((f) => f.address !== next.address);
  const list = [next, ...prev].slice(0, MAX_FINDS);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota / private mode */
  }
  return list;
}

export function clearRecentFinds(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function findsForChain(chain: FindChain): RecentFind[] {
  return loadRecentFinds().filter((f) => f.chain === chain);
}
