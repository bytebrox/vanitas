import nextVitals from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'cli/dist/**',
      'public/workers/**',
      'public/**/*-worker.js',
      'public/**/*-worker-*.js',
      'scripts/**',
      'eslint-report.json',
    ],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      // Pattern inputs derive validation UI from props; localStorage hydrate is intentional.
      'react-hooks/set-state-in-effect': 'off',
      // next-intl Link + intentional raw anchors (share/footer); not App Router pages dir.
      '@next/next/no-html-link-for-pages': 'off',
      // Decorative ASCII / hero assets — next/image not a fit.
      '@next/next/no-img-element': 'off',
      // IntersectionObserver fade hooks expose refs + visibility for style; React 19 lint is over-eager.
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
    },
  },
];

export default eslintConfig;
