/**
 * Translate messages/en.json → other locales via Google gtx endpoint.
 * Dedupes unique strings first for speed.
 * Optional: node scripts/translate-locales.cjs tr vi id it th
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages', 'en.json'), 'utf8'));

const ALL_LOCALES = {
  de: 'de',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  it: 'it',
  tr: 'tr',
  id: 'id',
  vi: 'vi',
  th: 'th',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
};

const only = process.argv.slice(2).filter((a) => ALL_LOCALES[a]);
const LOCALES = only.length
  ? Object.fromEntries(only.map((k) => [k, ALL_LOCALES[k]]))
  : ALL_LOCALES;

function collect(node, set = new Set()) {
  if (typeof node === 'string') set.add(node);
  else if (Array.isArray(node)) node.forEach((v) => collect(v, set));
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => collect(v, set));
  return set;
}

async function translateText(text, tl, cache) {
  const key = `${tl}::${text}`;
  if (cache.has(key)) return cache.get(key);
  if (!text || !/[A-Za-zÀ-ÿ]/.test(text)) {
    cache.set(key, text);
    return text;
  }

  const slots = [];
  const protectedText = text
    .replace(/`[^`]+`/g, (m) => {
      slots.push(m);
      return `__C${slots.length - 1}__`;
    })
    .replace(/\{[^}]+\}/g, (m) => {
      slots.push(m);
      return `__C${slots.length - 1}__`;
    })
    .replace(/\[[^\]]+\]\([^)]+\)/g, (m) => {
      slots.push(m);
      return `__C${slots.length - 1}__`;
    });

  // Skip tiny pure-token strings
  if (/^[A-Z0-9 .·|&+/_-]{1,24}$/.test(text) && !/[a-z]{3,}/.test(text)) {
    cache.set(key, text);
    return text;
  }

  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
    encodeURIComponent(tl) +
    '&dt=t&q=' +
    encodeURIComponent(protectedText.slice(0, 4500));

  let out = protectedText;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      out = (json[0] || []).map((x) => x[0]).join('');
      break;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      if (attempt === 4) {
        console.warn('fail', tl, text.slice(0, 50), e.message);
        out = protectedText;
      }
    }
  }

  out = out.replace(/__C(\d+)__/g, (_, i) => slots[Number(i)] ?? '');
  cache.set(key, out);
  return out;
}

function apply(node, map) {
  if (typeof node === 'string') return map.get(node) ?? node;
  if (Array.isArray(node)) return node.map((v) => apply(v, map));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = apply(v, map);
    return out;
  }
  return node;
}

async function main() {
  const strings = [...collect(en)];
  console.log('unique strings', strings.length);
  const cache = new Map();
  const CONCURRENCY = 8;

  for (const [file, tl] of Object.entries(LOCALES)) {
    console.log('\n===', file, tl, '===');
    const map = new Map();
    let done = 0;
    for (let i = 0; i < strings.length; i += CONCURRENCY) {
      const batch = strings.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map((s) => translateText(s, tl, cache)));
      batch.forEach((s, idx) => map.set(s, results[idx]));
      done += batch.length;
      if (done % 80 === 0 || done === strings.length) {
        console.log(file, done, '/', strings.length);
      }
      await new Promise((r) => setTimeout(r, 20));
    }
    const translated = apply(structuredClone(en), map);
    const dest = path.join(ROOT, 'messages', `${file}.json`);
    fs.writeFileSync(dest, JSON.stringify(translated, null, 2) + '\n', 'utf8');
    console.log('Wrote', dest, fs.statSync(dest).size);
    console.log('sample:', map.get('Pick a chain. Keys stay in this browser.'));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
