/**
 * Patch remaining *ResultDisplay.tsx files for i18n export + continueSearch.
 */
const fs = require('fs');
const path = require('path');
const dir = path.join('src', 'components');
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('ResultDisplay.tsx') && f !== 'ResultDisplay.tsx');

for (const file of files) {
  const fp = path.join(dir, file);
  let s = fs.readFileSync(fp, 'utf8');
  if (s.includes('continueSearch') && s.includes('useTranslations')) {
    console.log('skip', file);
    continue;
  }

  if (!s.includes("from 'next-intl'")) {
    s = s.replace(
      "import { useState } from 'react';",
      "import { useState } from 'react';\nimport { useTranslations } from 'next-intl';"
    );
  }
  if (!s.includes('buildVanityExportTxt')) {
    s = s.replace(
      /import \{ formatNumber, formatDuration \} from '@\/lib\/format';/,
      `import { formatNumber, formatDuration } from '@/lib/format';\nimport { buildVanityExportTxt } from '@/lib/export-txt';`
    );
  }

  // Add onContinueSearch to props interface - various shapes
  s = s.replace(
    /onReset: \(\) => void;\n\}/,
    `onReset: () => void;\n  onContinueSearch?: () => void;\n}`
  );

  // Destructure
  s = s.replace(
    /export function (\w+)\(\{ result, onReset \}: (\w+)\) \{/,
    `export function $1({ result, onReset, onContinueSearch }: $2) {\n  const t = useTranslations('common');`
  );
  // Avoid double const t
  s = s.replace(
    /const t = useTranslations\('common'\);\n  const t = useTranslations\('common'\);/,
    `const t = useTranslations('common');`
  );

  // Forge another button
  s = s.replace(
    />\s*Forge another\s*</g,
    `>{t('forgeAnother')}<`
  );

  // Insert continue button before forge another if missing
  if (!s.includes("t('continueSearch')")) {
    s = s.replace(
      /(<button\s+type="button"\s+onClick=\{onReset\}[^>]*>\s*\{t\('forgeAnother'\)\}\s*<\/button>)/,
      `{onContinueSearch && (
            <button type="button" onClick={onContinueSearch} className="text-ink hover:text-accent">
              {t('continueSearch')}
            </button>
          )}
          $1`
    );
  }

  // Copy/Hide/Reveal/Download if hardcoded - light touch
  s = s.replace(/>Copy</g, `>{t('copy')}<`);
  s = s.replace(/>Copied</g, `>{t('copied')}<`);
  s = s.replace(/>Hide</g, `>{t('hide')}<`);
  s = s.replace(/>Reveal</g, `>{t('reveal')}<`);
  s = s.replace(/>Download txt</gi, `>{t('downloadTxt')}<`);
  s = s.replace(/>Download json</gi, `>{t('downloadJson')}<`);

  fs.writeFileSync(fp, s);
  console.log('patched', file);
}
