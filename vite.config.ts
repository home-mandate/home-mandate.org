import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Languages come from the generated list (scripts/languages.ts), so a new
// language pack is prerendered without touching this file.
const languages: { tag: string }[] = JSON.parse(readFileSync(new URL('./.generated/languages.json', import.meta.url), 'utf8'));

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ pages: 'build', assets: 'build', precompress: true, strict: true }),
			files: { assets: '.generated/static' },
			// Absolute paths: /de and /de/ both load the same assets.
			paths: { relative: false },
			prerender: {
				entries: ['*', '/404', ...languages.filter((l) => l.tag !== 'en').map((l): `/${string}` => `/${l.tag}/`)],
				handleHttpError: 'fail',
				handleMissingId: 'fail'
			},
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['none'],
					'script-src': ['self'],
					'style-src': ['self'],
					'img-src': ['self'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'manifest-src': ['self'],
					'base-uri': ['none'],
					'form-action': ['self'],
					'worker-src': ['self'],
					'object-src': ['none']
				}
			},
			version: { name: process.env.SITE_COMMIT ?? 'dev' }
		})
	],
	test: {
		include: ['test/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['scripts/lib/**/*.ts', 'src/lib/**/*.ts', 'src/client/lib/theme.ts', 'src/client/playground/*.ts'],
			exclude: ['src/lib/paraglide/**', 'src/lib/generated/**'],
			thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 }
		}
	}
});
