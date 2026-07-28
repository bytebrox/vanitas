import type { useTranslations } from 'next-intl';

type TCommon = ReturnType<typeof useTranslations<'common'>>;

/** Localized plain-text export body for vanity finds (never includes secrets beyond the key itself). */
export function buildVanityExportTxt(
  t: TCommon,
  opts: {
    title: string;
    address: string;
    privateKey: string;
    extraLines?: string[];
  }
): string {
  const extra = opts.extraLines?.length ? `\n${opts.extraLines.join('\n')}\n` : '\n';
  return `${opts.title}
============================
${t('exportTxtGenerated')}: ${new Date().toISOString()}
${extra}
${t('exportTxtPublic')}:
${opts.address}

${t('exportTxtPrivate')}:
${opts.privateKey}

============================
${t('exportTxtImportant')}:
- ${t('exportTxtNeverShare')}
- ${t('exportTxtStoreSecure')}
- ${t('exportTxtLocal')}
`;
}
