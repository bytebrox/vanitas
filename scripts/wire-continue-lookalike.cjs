/**
 * Wire all *Content.tsx forges: lookalike block + continue search.
 * Also convert ResultDisplay downloadTxt to buildVanityExportTxt where still hardcoded.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const FORGES = [
  {
    file: 'src/app/[locale]/btc/BtcContent.tsx',
    chainExpr: `mode === 'legacy' ? 'btc-legacy' : 'btc-bech32'`,
    result: 'BtcResultDisplay',
    resultExtra: true, // has RecentFinds wrapper
  },
  {
    file: 'src/app/[locale]/tron/TronContent.tsx',
    chainExpr: `'tron'`,
    result: 'TronResultDisplay',
    resultExtra: true,
  },
  {
    file: 'src/app/[locale]/aptos/AptosContent.tsx',
    chainExpr: `'aptos'`,
    result: 'AptosResultDisplay',
    resultExtra: false,
  },
  {
    file: 'src/app/[locale]/sui/SuiContent.tsx',
    chainExpr: `'sui'`,
    result: 'SuiResultDisplay',
    resultExtra: false,
  },
  {
    file: 'src/app/[locale]/ton/TonContent.tsx',
    chainExpr: `'ton'`,
    result: 'TonResultDisplay',
    resultExtra: true,
  },
  {
    file: 'src/app/[locale]/cardano/CardanoContent.tsx',
    chainExpr: `'cardano'`,
    result: 'CardanoResultDisplay',
    resultExtra: false,
  },
  {
    file: 'src/app/[locale]/xrp/XrpContent.tsx',
    chainExpr: `'xrp'`,
    result: 'XrpResultDisplay',
    resultExtra: false,
  },
  {
    file: 'src/app/[locale]/evm/EvmContent.tsx',
    chainExpr: `'evm'`,
    result: 'EthResultDisplay',
    resultExtra: false,
    isEvm: true,
  },
];

function wireContent(f) {
  const fp = path.join(root, f.file);
  let s = fs.readFileSync(fp, 'utf8');

  if (!s.includes("from '@/lib/lookalike'")) {
    // Insert after validation import block — find first `@/lib/` validation-ish import end
    if (s.includes("from '@/lib/find-history'")) {
      s = s.replace(
        /from '@\/lib\/find-history';/,
        `from '@/lib/find-history';\nimport { hasBlockingLookalikeErrors } from '@/lib/lookalike';`
      );
    } else if (s.includes("from '@/lib/rich-text'")) {
      s = s.replace(
        /from '@\/lib\/rich-text';/,
        `from '@/lib/rich-text';\nimport { hasBlockingLookalikeErrors } from '@/lib/lookalike';`
      );
    } else {
      // after eth-validation
      s = s.replace(
        /(from '@\/lib\/[^']+';\n)/,
        `$1import { hasBlockingLookalikeErrors } from '@/lib/lookalike';\n`
      );
    }
  }

  if (f.isEvm) {
    if (!s.includes('patternBlocked')) {
      s = s.replace(
        `const canStart = prefixValid && suffixValid && hasPattern && create2Ok;`,
        `const patternBlocked = hasBlockingLookalikeErrors(${f.chainExpr}, prefix, suffix);\n  const canStart = prefixValid && suffixValid && hasPattern && create2Ok && !patternBlocked;`
      );
    }
    if (!s.includes('handleContinueSearch')) {
      s = s.replace(
        `const handleForgeAnother = useCallback(() => {
    reset();
  }, [reset]);`,
        `const handleForgeAnother = useCallback(() => {
    reset();
  }, [reset]);

  const handleContinueSearch = useCallback(() => {
    reset();
    requestForgeNotifyPermission();
    start(config);
  }, [reset, start, config]);`
      );
    }
    s = s.replace(
      /<EthResultDisplay result=\{result\} onReset=\{handleForgeAnother\} \/>/,
      `<EthResultDisplay result={result} onReset={handleForgeAnother} onContinueSearch={handleContinueSearch} />`
    );
  } else {
    if (!s.includes('patternBlocked')) {
      s = s.replace(
        `const canStart = prefixValid && suffixValid && hasPattern;`,
        `const patternBlocked = hasBlockingLookalikeErrors(${f.chainExpr}, prefix, suffix);\n  const canStart = prefixValid && suffixValid && hasPattern && !patternBlocked;`
      );
    }
    if (!s.includes('handleContinueSearch')) {
      // Insert before return (
      s = s.replace(
        /\n  return \(\n    <div className="min-h-screen/,
        `\n  const handleContinueSearch = useCallback(() => {
    reset();
    requestForgeNotifyPermission();
    start(config);
  }, [reset, start, config]);

  return (
    <div className="min-h-screen`
      );
    }
    const re = new RegExp(
      `<${f.result} result=\\{result\\} onReset=\\{reset\\} />`
    );
    s = s.replace(
      re,
      `<${f.result} result={result} onReset={reset} onContinueSearch={handleContinueSearch} />`
    );
  }

  fs.writeFileSync(fp, s);
  console.log('wired', f.file);
}

for (const f of FORGES) wireContent(f);

// --- ResultDisplays: replace hardcoded EN export with buildVanityExportTxt ---
const displays = [
  {
    file: 'src/components/AptosResultDisplay.tsx',
    title: 'APTOS',
    address: 'result.address',
    privateKey: 'result.privateKey',
  },
  {
    file: 'src/components/SuiResultDisplay.tsx',
    title: 'SUI',
    address: 'result.address',
    privateKey: 'result.privateKey',
  },
  {
    file: 'src/components/CardanoResultDisplay.tsx',
    title: 'CARDANO',
    address: 'result.address',
    privateKey: 'result.privateKey',
  },
  {
    file: 'src/components/XrpResultDisplay.tsx',
    title: 'XRP',
    address: 'result.address',
    privateKey: 'result.privateKey',
  },
  {
    file: 'src/components/TonResultDisplay.tsx',
    title: 'TON',
    address: 'result.address',
    privateKey: 'result.privateKey',
  },
];

function replaceSimpleDownload(d) {
  const fp = path.join(root, d.file);
  let s = fs.readFileSync(fp, 'utf8');
  // Replace downloadTxt function body content assignment
  const re =
    /const downloadTxt = \(\) => \{\n    const content = `VANITAS[\s\S]*?`;\n\n    const blob/;
  if (!re.test(s)) {
    console.log('skip download (no match)', d.file);
    return;
  }
  s = s.replace(
    re,
    `const downloadTxt = () => {
    const content = buildVanityExportTxt(t, {
      title: \`\${t('exportTxtTitle')} — ${d.title}\`,
      address: ${d.address},
      privateKey: ${d.privateKey},
    });

    const blob`
  );
  fs.writeFileSync(fp, s);
  console.log('export i18n', d.file);
}

for (const d of displays) replaceSimpleDownload(d);

console.log('done');
