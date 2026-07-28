/**
 * Fix critical machine-translation mistakes in fr.json / ko.json.
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

const frFixes = {
  'common.copy': 'Copier',
  'common.hide': 'Masquer',
  'common.forge': 'Forge',
  'common.stop': 'Arrêter',
  'common.cores': 'Cœurs',
  'common.found': 'Trouvé',
  'common.publicAddress': 'Adresse publique',
  'common.keepSafe': 'À conserver',
  'common.estTime': 'Temps est.',
  'common.workers': 'Workers',
  'common.pattern': 'Motif',
  'common.tryPattern': 'Essayer un motif',
  'common.brand': 'Vanitas',
  'common.match': 'Correspondance',
  'common.openForge': 'Ouvrir la forge',
  'common.stepMode': '01 — Mode',
  'common.stepMintPattern': '02 — Motif mint',
  'common.stepType': '01 — Type',
  'common.statsDisclaimer':
    'Le nombre de tentatives est déclaré par le forgeur et n’est pas prouvé cryptographiquement.',
  'nav.home': 'Accueil',
  'nav.themeToLight': 'Passer en mode clair',
  'nav.themeLight': 'Clair',
  'nav.toolsBrand': 'Brand',
  'nav.brand': 'Vanitas',
  'nav.evmSubline': 'Ethereum · BNB · Base · Arbitrum · Optimism · + EVM',
  'footer.home': 'Accueil',
  'footer.brand': 'Brand',
  'footer.donateSol': 'Donner du SOL',
  'meta.siteName': 'Vanitas',
  'notFound.home': 'Accueil',
  'notFound.heading': 'Cette adresse n’a jamais été forgée',
  'notFound.homeForge': 'Ou retournez à la [forge d’accueil](/).',
};

const koFixes = {
  'common.copy': '복사',
  'common.hide': '숨기기',
  'common.reveal': '표시',
  'common.forge': '포지',
  'common.stop': '중지',
  'common.reset': '초기화',
  'common.found': '발견',
  'common.publicAddress': '공개 주소',
  'common.privateKey': '개인 키',
  'common.keepSafe': '안전하게 보관',
  'common.pattern': '패턴',
  'common.keys': '키',
  'common.workers': '워커',
  'common.tryPattern': '패턴 시도',
  'common.keySecurity': '키 보안',
  'common.source': '소스',
  'common.optional': '선택',
  'common.brand': 'Vanitas',
  'common.forgeAnother': '다시 포지',
  'common.scrollToForge': '포지로 스크롤',
  'common.waiting': '대기 중 — 패턴을 입력하고 포지하세요',
  'common.running': '● 실행 중',
  'common.match': '일치',
  'common.openForge': '포지 열기',
  'common.statsDisclaimer':
    '시도 횟수는 포저가 자체 보고한 값이며 암호학적으로 증명되지 않습니다.',
  'nav.home': '홈',
  'nav.close': '닫기',
  'nav.themeToLight': '라이트 모드로 전환',
  'nav.themeToDark': '다크 모드로 전환',
  'nav.themeLight': '라이트',
  'nav.themeDark': '다크',
  'nav.docsHow': '방법',
  'nav.toolsAudit': '감사',
  'nav.toolsProof': '증명',
  'nav.toolsLookalike': '유사 문자',
  'nav.toolsBrand': 'Brand',
  'nav.brand': 'Vanitas',
  'nav.evmSubline': 'Ethereum · BNB · Base · Arbitrum · Optimism · + EVM',
  'nav.chainItems.sol.label': 'Solana',
  'nav.chainItems.btc.label': 'Bitcoin',
  'nav.chainItems.tron.label': 'Tron',
  'nav.chainItems.aptos.label': 'Aptos',
  'nav.chainItems.sui.label': 'Sui',
  'nav.chainItems.cardano.label': 'Cardano',
  'footer.blurb':
    'Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano & XRP용 클라이언트 사이드 바니티 도구. 프로젝트 토큰 없음. 키가 이 기기를 떠나지 않습니다. [Bytebrox](https://x.com/bytebrox) 제작.',
  'footer.home': '홈',
  'footer.how': '방법',
  'footer.proof': '증명',
  'footer.lookalike': '유사 문자',
  'footer.brand': 'Brand',
  'footer.audit': '감사',
  'meta.siteName': 'Vanitas',
  'notFound.home': '홈',
  'notFound.heading': '이 주소는 포지된 적이 없습니다',
  'notFound.homeForge': '또는 [홈 포지](/)로 돌아가세요.',
};

function polish(file, fixes, globalReplaces) {
  const dest = path.join(ROOT, 'messages', `${file}.json`);
  let data = JSON.parse(fs.readFileSync(dest, 'utf8'));
  for (const [from, to] of globalReplaces) {
    data = walkReplace(data, from, to);
  }
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

polish('fr', frFixes, [
  ['Vanités', 'Vanitas'],
  ['vanités', 'Vanitas'],
]);
polish('ko', koFixes, [
  ['바니타스', 'Vanitas'],
]);
