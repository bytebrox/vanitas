import { getPublicKey, utils, etc } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';
import {
  btcLegacyAddress,
  btcSegwitAddress,
  btcWifCompressed,
  tronAddressFromEth20,
} from '../src/lib/address-encoding';
import {
  normalizeBtcPrefix,
  estimateBtcDifficulty,
  btcVariablePatternLength,
} from '../src/lib/btc-validation';
import {
  normalizeTronPrefix,
  estimateTronDifficulty,
  tronVariablePatternLength,
} from '../src/lib/tron-validation';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  console.log(`  ok  ${msg}`);
}

/** Mirror worker match logic (must stay in sync with btc.worker / tron.worker). */
function matchesBtc(
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean,
  mode: 'legacy' | 'segwit'
): boolean {
  if (!prefix && !suffix) return true;
  if (mode === 'segwit') {
    const addr = address.toLowerCase();
    let p = (prefix || '').toLowerCase();
    const s = (suffix || '').toLowerCase();
    if (p && !p.startsWith('bc1')) p = `bc1q${p}`;
    return (!p || addr.startsWith(p)) && (!s || addr.endsWith(s));
  }
  let p = prefix || '';
  if (p && !p.startsWith('1')) p = `1${p}`;
  const s = suffix || '';
  if (caseSensitive) {
    return (!p || address.startsWith(p)) && (!s || address.endsWith(s));
  }
  const addr = address.toLowerCase();
  return (
    (!p || addr.startsWith(p.toLowerCase())) &&
    (!s || addr.endsWith(s.toLowerCase()))
  );
}

function matchesTron(
  address: string,
  prefix: string,
  suffix: string,
  caseSensitive: boolean
): boolean {
  if (!prefix && !suffix) return true;
  let p = prefix || '';
  if (p && !p.startsWith('T')) p = `T${p}`;
  const s = suffix || '';
  if (caseSensitive) {
    return (!p || address.startsWith(p)) && (!s || address.endsWith(s));
  }
  const addr = address.toLowerCase();
  return (
    (!p || addr.startsWith(p.toLowerCase())) &&
    (!s || addr.endsWith(s.toLowerCase()))
  );
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function mineBtc(
  prefix: string,
  mode: 'legacy' | 'segwit',
  caseSensitive: boolean,
  maxAttempts: number
): Promise<{ address: string; attempts: number; wif: string; hex: string }> {
  for (let i = 1; i <= maxAttempts; i++) {
    const secret = utils.randomSecretKey();
    const pub = getPublicKey(secret, true);
    const address = mode === 'segwit' ? btcSegwitAddress(pub) : btcLegacyAddress(pub);
    if (matchesBtc(address, prefix, '', caseSensitive, mode)) {
      return {
        address,
        attempts: i,
        wif: btcWifCompressed(secret),
        hex: etc.bytesToHex(secret),
      };
    }
  }
  throw new Error(`BTC ${mode} prefix="${prefix}" not found in ${maxAttempts} attempts`);
}

async function mineTron(
  prefix: string,
  caseSensitive: boolean,
  maxAttempts: number
): Promise<{ address: string; attempts: number; hex: string }> {
  for (let i = 1; i <= maxAttempts; i++) {
    const secret = utils.randomSecretKey();
    const pub = getPublicKey(secret, false);
    const hash = keccak_256(pub.slice(1));
    const address = tronAddressFromEth20(hash.slice(-20));
    if (matchesTron(address, prefix, '', caseSensitive)) {
      return { address, attempts: i, hex: etc.bytesToHex(secret) };
    }
  }
  throw new Error(`Tron prefix="${prefix}" not found in ${maxAttempts} attempts`);
}

export async function run() {
  console.log('\n=== Known vectors ===');

  // secp256k1 secret = 1 (compressed) — widely published P2PKH
  const secret1 = hexToBytes(
    '0000000000000000000000000000000000000000000000000000000000000001'
  );
  const pub1 = getPublicKey(secret1, true);
  const legacy1 = btcLegacyAddress(pub1);
  const segwit1 = btcSegwitAddress(pub1);
  const wif1 = btcWifCompressed(secret1);
  assert(
    legacy1 === '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH',
    `legacy secret=1 → ${legacy1}`
  );
  assert(
    segwit1 === 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    `segwit secret=1 → ${segwit1}`
  );
  assert(wif1.startsWith('K') || wif1.startsWith('L'), `WIF compressed starts K/L: ${wif1}`);
  assert(
    wif1 === 'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
    `WIF secret=1 exact → ${wif1}`
  );
  // Round-trip: same secret → same address again
  assert(btcLegacyAddress(pub1) === legacy1, 'legacy deterministic');
  assert(btcSegwitAddress(pub1) === segwit1, 'segwit deterministic');

  // Tron: same keccak-20 as Ethereum, version byte 0x41, Base58Check
  const pub1u = getPublicKey(secret1, false);
  const eth20 = keccak_256(pub1u.slice(1)).slice(-20);
  assert(
    etc.bytesToHex(eth20) === '7e5f4552091a69125d5dfcb7b8c2659029395bdf',
    'eth20 of secret=1 (shared with Tron path)'
  );
  const tron1 = tronAddressFromEth20(eth20);
  assert(
    tron1 === 'TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC',
    `tron secret=1 → ${tron1}`
  );

  console.log('\n=== Prefix normalization ===');
  assert(normalizeBtcPrefix('BTC', 'legacy') === '1BTC', 'legacy BTC → 1BTC');
  assert(normalizeBtcPrefix('1Love', 'legacy') === '1Love', 'legacy 1Love stays');
  assert(normalizeBtcPrefix('cafe', 'segwit') === 'bc1qcafe', 'segwit cafe → bc1qcafe');
  assert(normalizeBtcPrefix('bc1qzz', 'segwit') === 'bc1qzz', 'segwit full stays');
  assert(normalizeTronPrefix('RON') === 'TRON', 'tron RON → TRON');
  assert(normalizeTronPrefix('TAbc') === 'TAbc', 'tron TAbc stays');

  console.log('\n=== Difficulty (variable length, leading fixed char free) ===');
  assert(btcVariablePatternLength('BTC', '', 'legacy') === 3, 'BTC variable len 3');
  assert(btcVariablePatternLength('1BTC', '', 'legacy') === 3, '1BTC variable len 3');
  assert(estimateBtcDifficulty('BTC', '', 'legacy', false) === 33 ** 3, 'legacy BTC difficulty');
  assert(btcVariablePatternLength('cafe', '', 'segwit') === 4, 'segwit cafe var len 4');
  assert(tronVariablePatternLength('A', '') === 1, 'tron A var len 1');
  assert(estimateTronDifficulty('A', '', true) === 58, 'tron A difficulty 58');

  console.log('\n=== Match logic (unit) ===');
  assert(matchesBtc('1BTCxxxx', 'BTC', '', true, 'legacy'), 'legacy auto-1 caseSens');
  assert(matchesBtc('1btcXXXX', 'BTC', '', false, 'legacy'), 'legacy auto-1 caseInsens');
  assert(!matchesBtc('9BTCxxxx', 'BTC', '', true, 'legacy'), 'legacy no match without 1');
  // Old bug: raw startsWith BTC would never match
  assert(!'1BTCxxxx'.startsWith('BTC'), 'old bug still would fail without normalize');
  assert(matchesBtc('bc1qdeadbeef', 'dead', '', false, 'segwit'), 'segwit auto-bc1q');
  assert(matchesBtc('bc1qdeadbeef', 'bc1qdead', '', false, 'segwit'), 'segwit full prefix');
  assert(matchesTron('TRON123', 'RON', '', true), 'tron auto-T');
  assert(matchesTron('TRON123', 'TRON', '', true), 'tron full T');

  console.log('\n=== Live mine (short prefixes) ===');
  const legacy = await mineBtc('A', 'legacy', false, 200_000);
  assert(
    matchesBtc(legacy.address, 'A', '', false, 'legacy') && legacy.address[0] === '1',
    `mined legacy ${legacy.address} in ${legacy.attempts} (WIF ${legacy.wif.slice(0, 8)}…)`
  );

  const segwit = await mineBtc('q', 'segwit', false, 50_000);
  // bc1q… always; prefix "q" → bc1qq… so address must start with bc1qq
  assert(
    segwit.address.startsWith('bc1qq'),
    `mined segwit ${segwit.address} in ${segwit.attempts}`
  );

  const tron = await mineTron('A', false, 200_000);
  assert(
    matchesTron(tron.address, 'A', '', false) && tron.address[0] === 'T',
    `mined tron ${tron.address} in ${tron.attempts}`
  );

  // Slightly harder but still quick: 2-char case-insensitive legacy
  const legacy2 = await mineBtc('Ab', 'legacy', false, 500_000);
  assert(
    legacy2.address.toLowerCase().startsWith('1ab'),
    `mined legacy Ab → ${legacy2.address} in ${legacy2.attempts}`
  );

  console.log('\nALL CHECKS PASSED\n');
}
