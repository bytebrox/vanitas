/**
 * Human polish for DE / TR / ZH meta, nav, legal critical strings after MT.
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

const patches = {
  de: {
    'meta.home.title': 'Solana-, EVM-, Bitcoin- & Tron-Vanity-Forge',
    'meta.home.description':
      'Clientseitige Vanity-Adress-Forge für Solana, EVM, Bitcoin und Tron. Wallets, Mints und Contracts — Schlüssel verlassen diesen Browser nie.',
    'meta.home.ogAlt': 'Vanitas Multi-Chain-Vanity-Forge',
    'meta.sol.description':
      'Forge Vanity-Solana-Wallet- und Token-Mint-Adressen vollständig im Browser. Open Source, clientseitig — keine Schlüssel verlassen dieses Gerät.',
    'meta.sol.ogAlt': 'Vanitas — Solana-Vanity-Forge',
    'meta.sol.ogDescription':
      'Forge Vanity-Solana-Wallet- und Mint-Adressen clientseitig. Keine Schlüssel verlassen dieses Gerät.',
    'meta.sol.twitterDescription':
      'Forge Vanity-Solana-Wallet- und Mint-Adressen clientseitig.',
    'meta.evm.description':
      'Forge Vanity-EVM-Wallet- und Contract-Adressen clientseitig. Ein Schlüssel für Ethereum, Base, Arbitrum, Optimism, BSC und mehr.',
    'meta.evm.ogDescription':
      'Forge Vanity-0x-Wallet- und Contract-Adressen clientseitig. Gleicher Schlüssel auf Ethereum, BNB, Base, Arbitrum und jeder EVM-Chain.',
    'meta.tron.description':
      'Forge Vanity-Tron-Base58-Adressen clientseitig für TronLink und andere Wallets.',
    'meta.security.description':
      'Vanitas-Vertrauensmodell — Schlüssel bleiben in Ihrem Browser. Bedrohungsgrenzen und Verifizierung.',
    'meta.how-it-works.description':
      'Wie Vanitas Vanity-Adressen auf Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano und XRP erzeugt: Worker, Modi (Mint, CREATE, CREATE2), Fundnachweis, CLI und clientseitige Sicherheitsprüfung.',
    'nav.home': 'Start',
    'footer.home': 'Start',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.privacy': 'Datenschutz',
  },
  tr: {
    'meta.home.description':
      'Solana, EVM, Bitcoin ve Tron için istemci tarafı vanity adres forge. Cüzdanlar, mintler ve kontratlar — anahtarlar bu tarayıcıdan asla ayrılmaz.',
    'meta.sol.description':
      'Vanity Solana cüzdan ve token mint adreslerini tamamen tarayıcınızda oluşturun. Açık kaynak, istemci tarafı — bu cihazdan hiçbir anahtar çıkmaz.',
    'meta.sol.ogDescription':
      'Vanity Solana cüzdan ve mint adreslerini istemci tarafında oluşturun. Bu cihazdan hiçbir anahtar çıkmaz.',
    'meta.sol.twitterDescription':
      'Vanity Solana cüzdan ve mint adreslerini istemci tarafında oluşturun.',
    'meta.evm.description':
      'Vanity EVM cüzdan ve kontrat adreslerini istemci tarafında oluşturun. Ethereum, Base, Arbitrum, Optimism, BSC ve daha fazlası için tek anahtar.',
    'meta.evm.ogDescription':
      'Vanity 0x cüzdan ve kontrat adreslerini istemci tarafında oluşturun. Ethereum, BNB, Base, Arbitrum ve her EVM zincirinde aynı anahtar.',
    'meta.btc.description':
      'Vanity Bitcoin adreslerini (legacy, SegWit, Taproot) tamamen tarayıcınızda oluşturun.',
  },
  zh: {
    'meta.home.title': 'Solana、EVM、Bitcoin 与 Tron Vanity Forge',
    'meta.home.description':
      '面向 Solana、EVM、Bitcoin 与 Tron 的客户端 vanity 地址锻造工具。钱包、铸造与合约——密钥永不离开本浏览器。',
    'meta.home.ogAlt': 'Vanitas 多链 vanity 锻造',
    'meta.sol.title': 'Solana Vanity 地址生成器',
    'meta.sol.description':
      '完全在浏览器中生成 Solana 钱包与代币铸造 vanity 地址。开源、客户端，密钥不离开本设备。',
    'meta.sol.ogTitle': 'Solana Vanity 地址生成器 | Vanitas',
    'meta.sol.ogDescription': '在客户端生成 Solana 钱包与铸造 vanity 地址。密钥不离开本设备。',
    'meta.sol.twitterDescription': '在客户端生成 Solana 钱包与铸造 vanity 地址。',
    'meta.sol.ogAlt': 'Vanitas — Solana vanity 锻造',
    'meta.evm.title': 'EVM Vanity 地址生成器',
    'meta.evm.description':
      '在客户端生成 EVM 钱包与合约 vanity 地址。同一密钥适用于 Ethereum、Base、Arbitrum、Optimism、BSC 等。',
    'meta.evm.ogTitle': 'EVM Vanity 地址生成器 | Vanitas',
    'meta.evm.ogDescription':
      '在客户端生成 0x 钱包与合约 vanity 地址。同一密钥适用于 Ethereum、BNB、Base、Arbitrum 及所有 EVM 链。',
    'meta.evm.twitterDescription':
      '在客户端生成 0x 钱包与合约 vanity 地址。同一密钥适用于所有 EVM 链。',
    'meta.btc.title': 'Bitcoin Vanity 地址生成器',
    'meta.btc.description':
      '完全在浏览器中生成 Bitcoin vanity 地址（Legacy、SegWit、Taproot）。',
    'footer.home': '首页',
    'nav.home': '首页',
  },
};

for (const [locale, fixes] of Object.entries(patches)) {
  const fp = path.join(ROOT, 'messages', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let n = 0;
  for (const [k, v] of Object.entries(fixes)) {
    if (set(data, k, v)) n += 1;
    else console.warn('missing', locale, k);
  }
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
  console.log(locale, 'patched', n);
}
