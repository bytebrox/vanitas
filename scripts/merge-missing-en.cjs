/**
 * Copy missing leaf keys from en.json into all locales (no network).
 * New strings stay English until merge-translate / polish runs.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages', 'en.json'), 'utf8'));
const LOCALES = ['de', 'es', 'pt', 'fr', 'it', 'tr', 'id', 'vi', 'th', 'zh', 'ja', 'ko'];

function mergeMissing(enNode, locNode, stats) {
  if (typeof enNode === 'string') {
    if (typeof locNode === 'string' && locNode.length) return locNode;
    stats.added += 1;
    return enNode;
  }
  if (Array.isArray(enNode)) {
    const out = [];
    for (let i = 0; i < enNode.length; i++) {
      out.push(mergeMissing(enNode[i], Array.isArray(locNode) ? locNode[i] : undefined, stats));
    }
    return out;
  }
  if (enNode && typeof enNode === 'object') {
    const out = locNode && typeof locNode === 'object' && !Array.isArray(locNode) ? { ...locNode } : {};
    for (const key of Object.keys(enNode)) {
      out[key] = mergeMissing(enNode[key], out[key], stats);
    }
    return out;
  }
  return enNode;
}

for (const locale of LOCALES) {
  const fp = path.join(ROOT, 'messages', `${locale}.json`);
  const loc = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const stats = { added: 0 };
  const merged = mergeMissing(en, loc, stats);
  fs.writeFileSync(fp, JSON.stringify(merged, null, 2) + '\n');
  console.log(locale, 'added', stats.added);
}
