import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default defineConfig(
	{
		ignores: ['build/', '.svelte-kit/', '.generated/', '.spec-cache/', 'coverage/', 'src/lib/paraglide/', 'src/lib/generated/', 'playwright-report/', 'test-results/']
	},
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	{ files: ['src/**'], languageOptions: { globals: globals.browser } },
	{ files: ['scripts/**', 'test/**', 'e2e/**', '*.config.*'], languageOptions: { globals: globals.node } },
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { parser: ts.parser } }
	},
	{
		rules: {
			// Svelte escapes output; raw HTML would bypass that and the CSP review.
			'svelte/no-at-html-tags': 'error',
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-new-func': 'error',
			// Internal links come from Paraglide's localizeHref (absolute, language prefix);
			// the others point to GitHub. resolve() from $app/paths does not know locales.
			'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true }],
			'@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }]
		}
	}
);
