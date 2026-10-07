import adapter from '@sveltejs/adapter-static';
import { readFileSync } from 'node:fs';

// Languages come from the generated list (scripts/languages.ts), so a new
// language pack is prerendered without touching this file.
/** @type {{ tag: string }[]} */
const languages = JSON.parse(readFileSync(new URL('./.generated/languages.json', import.meta.url), 'utf8'));

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build', precompress: true, strict: true }),
		files: { assets: '.generated/static' },
		// Absolute paths: /de and /de/ both load the same assets.
		paths: { relative: false },
		prerender: {
			entries: ['*', '/404', ...languages.filter((l) => l.tag !== 'en').map((l) => `/${l.tag}/`)],
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
	}
};
