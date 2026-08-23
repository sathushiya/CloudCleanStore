import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      // This codebase fetches data with a one-time useEffect + async loader
      // function throughout (not React Query everywhere yet). That's a
      // deliberate, working pattern here, not the "derived state" mistake
      // this rule targets -- so it stays off rather than flagging ~20
      // legitimate call sites across every dashboard page.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // shadcn/ui vendored primitives -- generated, not hand-maintained here.
    // They routinely export a variants() helper alongside the component,
    // which is the standard shadcn convention, not a Fast Refresh bug.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/purity': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Context providers exporting their useX() hook alongside the provider
    // component is the standard React context pattern, not a Fast Refresh bug.
    files: ['src/context/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
