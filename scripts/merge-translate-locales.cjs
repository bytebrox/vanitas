/**
 * Merge missing keys from en.json into other locales and translate new strings via Google gtx.
 * Reports how many leaf keys were added per locale.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages', 'en.json'), 'utf8'));
const LOCALES = {
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
const cache = new Map();

async function translateText(text, tl) {
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
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
    encodeURIComponent(tl) +
    '&dt=t&q=' +
    encodeURIComponent(protectedText.slice(0, 4500));
  let out = protectedText;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      out = (json[0] || []).map((x) => x[0]).join('');
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  out = out.replace(/__C(\d+)__/g, (_, i) => slots[Number(i)] ?? '');
  cache.set(key, out);
  return out;
}

/** Returns { value, added } where added is count of newly filled string leaves. */
async function merge(enNode, locNode, tl, stats) {
  if (typeof enNode === 'string') {
    if (typeof locNode === 'string' && locNode.length) return locNode;
    stats.added += 1;
    return translateText(enNode, tl);
  }
  if (Array.isArray(enNode)) {
    const out = [];
    for (let i = 0; i < enNode.length; i++) {
      out.push(await merge(enNode[i], Array.isArray(locNode) ? locNode[i] : undefined, tl, stats));
    }
    return out;
  }
  if (enNode && typeof enNode === 'object') {
    const out = {};
    const src = locNode && typeof locNode === 'object' && !Array.isArray(locNode) ? locNode : {};
    for (const k of Object.keys(enNode)) {
      out[k] = await merge(enNode[k], src[k], tl, stats);
    }
    return out;
  }
  return enNode;
}

/** Product section name stays "Brand" in DE (not "Marke"). */
function fixDeBrandTitles(merged) {
  const setIfMarke = (obj, key) => {
    if (obj && obj[key] === 'Marke') {
      obj[key] = 'Brand';
      return 1;
    }
    return 0;
  };
  let fixed = 0;
  fixed += setIfMarke(merged?.tools?.brand, 'title');
  fixed += setIfMarke(merged?.meta?.brand, 'title');
  fixed += setIfMarke(merged?.footer, 'brand');
  fixed += setIfMarke(merged?.nav, 'toolsBrand');
  // ogTitle often "Marke | Vanitas"
  if (merged?.meta?.brand?.ogTitle?.startsWith('Marke')) {
    merged.meta.brand.ogTitle = merged.meta.brand.ogTitle.replace(/^Marke/, 'Brand');
    fixed += 1;
  }
  if (merged?.tools?.brand?.caption === 'Abb. – Marke') {
    merged.tools.brand.caption = 'Abb. – Brand';
    fixed += 1;
  }
  return fixed;
}

async function main() {
  // Ensure en.json is valid (strip accidental trailing literal \n sequence)
  const enPath = path.join(ROOT, 'messages', 'en.json');
  let enRaw = fs.readFileSync(enPath, 'utf8');
  if (/\\n\s*$/.test(enRaw) && !/\n\s*$/.test(enRaw.replace(/\\n\s*$/, ''))) {
    // file ends with backslash-n characters rather than newline — rare corruption
  }
  // Fix trailing literal backslash-n if present after valid JSON close
  if (enRaw.includes('}\\n') && !enRaw.trimEnd().endsWith('}')) {
    enRaw = enRaw.replace(/\\n\s*$/, '') + '\n';
    JSON.parse(enRaw);
    fs.writeFileSync(enPath, enRaw.endsWith('\n') ? enRaw : enRaw + '\n');
    console.log('Fixed trailing literal \\n in en.json');
  } else {
    JSON.parse(enRaw);
    console.log('en.json valid JSON');
  }

  const results = {};
  for (const [file, tl] of Object.entries(LOCALES)) {
    const dest = path.join(ROOT, 'messages', `${file}.json`);
    const existing = JSON.parse(fs.readFileSync(dest, 'utf8'));
    const stats = { added: 0 };
    console.log('Merging', file, '…');
    const merged = await merge(en, existing, tl, stats);
    let brandFixed = 0;
    if (file === 'de') brandFixed = fixDeBrandTitles(merged);
    fs.writeFileSync(dest, JSON.stringify(merged, null, 2) + '\n');
    results[file] = { added: stats.added, brandFixed, title: merged.tools?.brand?.title };
    console.log(
      file,
      'added',
      stats.added,
      'brand.title',
      merged.tools?.brand?.title,
      brandFixed ? `(brand fixes: ${brandFixed})` : ''
    );
  }
  console.log('SUMMARY', JSON.stringify(results));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
