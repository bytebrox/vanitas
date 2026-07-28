/**
 * Wire useForgeRunUi + ForgePatternHints into remaining forge Content files.
 */
const fs = require('fs');

const specs = [
  {
    file: 'src/app/[locale]/tron/TronContent.tsx',
    resultImport: 'TronResultDisplay',
    chain: '"tron"',
    destructure: 'const { prefix, suffix, threads, caseSensitive, mode } = config;',
  },
  {
    file: 'src/app/[locale]/aptos/AptosContent.tsx',
    resultImport: 'AptosResultDisplay',
    chain: '"aptos"',
    destructure: 'const { prefix, suffix, threads } = config;',
  },
  {
    file: 'src/app/[locale]/sui/SuiContent.tsx',
    resultImport: 'SuiResultDisplay',
    chain: '"sui"',
    destructure: 'const { prefix, suffix, threads } = config;',
  },
  {
    file: 'src/app/[locale]/ton/TonContent.tsx',
    resultImport: 'TonResultDisplay',
    chain: '"ton"',
    destructure: 'const { prefix, suffix, threads, mode } = config;',
  },
  {
    file: 'src/app/[locale]/cardano/CardanoContent.tsx',
    resultImport: 'CardanoResultDisplay',
    chain: '"cardano"',
    destructure: 'const { prefix, suffix, threads } = config;',
  },
  {
    file: 'src/app/[locale]/xrp/XrpContent.tsx',
    resultImport: 'XrpResultDisplay',
    chain: '"xrp"',
    destructure: 'const { prefix, suffix, threads, caseSensitive } = config;',
  },
];

for (const spec of specs) {
  let s = fs.readFileSync(spec.file, 'utf8');
  if (s.includes('useForgeRunUi')) {
    console.log('already', spec.file);
    continue;
  }

  if (!s.includes('ForgePatternHints')) {
    s = s.replace(
      new RegExp(`(  ${spec.resultImport},)\\n(} from '@/components';)`),
      `$1\n  ForgePatternHints,\n$2`
    );
  }

  s = s.replace(
    "import { useSound } from '@/hooks/useSound';",
    "import { useSound } from '@/hooks/useSound';\nimport { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';"
  );

  if (!s.includes(spec.destructure)) {
    console.warn('destructure missing', spec.file);
    continue;
  }

  s = s.replace(
    spec.destructure + '\n\n  useEffect(() => {',
    `${spec.destructure}

  useForgeRunUi({
    status,
    forgingLabel: tCommon('tabForging'),
    foundLabel: tCommon('tabFound'),
    notifyTitle: tCommon('notifyTitle'),
    notifyBody: tCommon('notifyBody'),
  });

  useEffect(() => {`
  );

  // onStart inline
  s = s.replace(
    /onStart=\{\(\) => \{\s*if \(canStart\) start\(config\);\s*\}\}/g,
    `onStart={() => {
                      if (!canStart) return;
                      requestForgeNotifyPermission();
                      start(config);
                    }}`
  );

  // Insert hints before forge controls block if missing
  if (!s.includes('<ForgePatternHints')) {
    s = s.replace(
      /(<div>\s*<p className="text-micro uppercase tracking-\[0\.2em\] text-muted mb-4">\{tSteps\('forge'\)\}<\/p>\s*<GeneratorControls)/,
      `<ForgePatternHints chain={${spec.chain}} prefix={prefix} suffix={suffix} />\n\n                $1`
    );
  }

  fs.writeFileSync(spec.file, s);
  console.log('patched', spec.file);
}
