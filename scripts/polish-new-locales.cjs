/**
 * Fix critical machine-translation mistakes in it/tr/id/vi/th.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function set(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') return false;
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (!(last in cur)) return false;
  cur[last] = value;
  return true;
}

function walkReplace(node, from, to) {
  if (typeof node === 'string') return node.split(from).join(to);
  if (Array.isArray(node)) return node.map((v) => walkReplace(v, from, to));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walkReplace(v, from, to);
    return out;
  }
  return node;
}

const sharedChain = {
  'nav.evmSubline': 'Ethereum · BNB · Base · Arbitrum · Optimism · + EVM',
  'nav.toolsBrand': 'Brand',
  'nav.brand': 'Vanitas',
  'common.brand': 'Vanitas',
  'footer.brand': 'Brand',
  'meta.siteName': 'Vanitas',
  'nav.chainItems.sol.label': 'Solana',
  'nav.chainItems.btc.label': 'Bitcoin',
  'nav.chainItems.tron.label': 'Tron',
  'nav.chainItems.aptos.label': 'Aptos',
  'nav.chainItems.sui.label': 'Sui',
  'nav.chainItems.cardano.label': 'Cardano',
};

const locales = {
  it: {
    replaces: [],
    fixes: {
      ...sharedChain,
      'common.copy': 'Copia',
      'common.hide': 'Nascondi',
      'common.forge': 'Forge',
      'common.stop': 'Stop',
      'common.found': 'Trovato',
      'common.publicAddress': 'Indirizzo pubblico',
      'common.privateKey': 'Chiave privata',
      'common.pattern': 'Pattern',
      'common.workers': 'Worker',
      'common.match': 'Corrispondenza',
      'common.openForge': 'Apri forge',
      'nav.home': 'Home',
      'nav.close': 'Chiudi',
      'nav.themeLight': 'Chiaro',
      'nav.themeDark': 'Scuro',
      'footer.home': 'Home',
      'notFound.home': 'Home',
      'notFound.heading': 'Questo indirizzo non è mai stato forgiato',
      'notFound.homeForge': 'O torna alla [forge home](/).',
    },
  },
  tr: {
    replaces: [],
    fixes: {
      ...sharedChain,
      'common.copy': 'Kopyala',
      'common.hide': 'Gizle',
      'common.forge': 'Forge',
      'common.stop': 'Durdur',
      'common.found': 'Bulundu',
      'common.publicAddress': 'Açık adres',
      'common.privateKey': 'Özel anahtar',
      'common.pattern': 'Desen',
      'common.workers': 'Worker',
      'common.match': 'Eşleşme',
      'common.openForge': 'Forge’u aç',
      'nav.home': 'Ana sayfa',
      'nav.close': 'Kapat',
      'nav.themeLight': 'Açık',
      'nav.themeDark': 'Koyu',
      'footer.home': 'Ana sayfa',
      'notFound.home': 'Ana sayfa',
      'notFound.heading': 'Bu adres hiç forge edilmedi',
      'notFound.homeForge': 'Veya [ana forge](/) sayfasına dönün.',
    },
  },
  id: {
    replaces: [],
    fixes: {
      ...sharedChain,
      'common.copy': 'Salin',
      'common.hide': 'Sembunyikan',
      'common.forge': 'Forge',
      'common.stop': 'Stop',
      'common.found': 'Ditemukan',
      'common.publicAddress': 'Alamat publik',
      'common.privateKey': 'Kunci pribadi',
      'common.pattern': 'Pola',
      'common.workers': 'Worker',
      'common.match': 'Cocok',
      'common.openForge': 'Buka forge',
      'nav.home': 'Beranda',
      'nav.close': 'Tutup',
      'nav.themeLight': 'Terang',
      'nav.themeDark': 'Gelap',
      'footer.home': 'Beranda',
      'notFound.home': 'Beranda',
      'notFound.heading': 'Alamat ini tidak pernah di-forge',
      'notFound.homeForge': 'Atau kembali ke [forge beranda](/).',
    },
  },
  vi: {
    replaces: [],
    fixes: {
      ...sharedChain,
      'common.copy': 'Sao chép',
      'common.hide': 'Ẩn',
      'common.forge': 'Forge',
      'common.stop': 'Dừng',
      'common.found': 'Đã tìm thấy',
      'common.publicAddress': 'Địa chỉ công khai',
      'common.privateKey': 'Khóa riêng',
      'common.pattern': 'Mẫu',
      'common.workers': 'Worker',
      'common.match': 'Khớp',
      'common.openForge': 'Mở forge',
      'nav.home': 'Trang chủ',
      'nav.close': 'Đóng',
      'nav.themeLight': 'Sáng',
      'nav.themeDark': 'Tối',
      'footer.home': 'Trang chủ',
      'notFound.home': 'Trang chủ',
      'notFound.heading': 'Địa chỉ này chưa từng được forge',
      'notFound.homeForge': 'Hoặc quay lại [forge trang chủ](/).',
    },
  },
  th: {
    replaces: [],
    fixes: {
      ...sharedChain,
      'common.copy': 'คัดลอก',
      'common.hide': 'ซ่อน',
      'common.forge': 'Forge',
      'common.stop': 'หยุด',
      'common.found': 'พบแล้ว',
      'common.publicAddress': 'ที่อยู่สาธารณะ',
      'common.privateKey': 'คีย์ส่วนตัว',
      'common.pattern': 'รูปแบบ',
      'common.workers': 'Worker',
      'common.match': 'ตรงกัน',
      'common.openForge': 'เปิด Forge',
      'nav.home': 'หน้าแรก',
      'nav.close': 'ปิด',
      'nav.themeLight': 'สว่าง',
      'nav.themeDark': 'มืด',
      'footer.home': 'หน้าแรก',
      'notFound.home': 'หน้าแรก',
      'notFound.heading': 'ที่อยู่นี้ไม่เคยถูก Forge',
      'notFound.homeForge': 'หรือกลับไปที่ [หน้าแรก Forge](/)',
    },
  },
};

for (const [file, { fixes, replaces }] of Object.entries(locales)) {
  const dest = path.join(ROOT, 'messages', `${file}.json`);
  let data = JSON.parse(fs.readFileSync(dest, 'utf8'));
  for (const [from, to] of replaces) data = walkReplace(data, from, to);
  // Always keep product name Latin
  data = walkReplace(data, 'Vanitas', 'Vanitas');
  let ok = 0;
  let miss = 0;
  for (const [k, v] of Object.entries(fixes)) {
    if (set(data, k, v)) ok++;
    else {
      miss++;
      console.warn('missing', file, k);
    }
  }
  fs.writeFileSync(dest, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(file, 'fixed', ok, 'missing', miss);
}
