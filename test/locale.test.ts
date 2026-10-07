import { describe, expect, it } from 'vitest';
import { basePath, language, languages, localHref, pathIn, urlIn } from '$lib/locale';
import { SECURITY_URL, SITE_URL, specUrl } from '$lib/site';
import { spec } from '$lib/generated/spec';

describe('locale helpers', () => {
	it('lists English first', () => {
		expect(languages[0]?.tag).toBe('en');
	});
	it('removes the language prefix', () => {
		expect(basePath('/de/imprint/')).toBe('/imprint/');
		expect(basePath('/imprint/')).toBe('/imprint/');
	});
	it('gives English no prefix and other languages a prefix', () => {
		expect(pathIn('/de/imprint/', 'en')).toBe('/imprint/');
		expect(pathIn('/imprint/', 'de')).toBe('/de/imprint/');
		expect(pathIn('/', 'de')).toBe('/de/');
	});
	it('builds absolute URLs on the site', () => {
		expect(urlIn('/privacy/', 'de')).toBe(`${SITE_URL}/de/privacy/`);
	});
	it('finds a language by tag', () => {
		expect(language('de')?.name).toBe('Deutsch');
		expect(language('xx')).toBeUndefined();
	});
});

describe('site links', () => {
	it('links into the specification at the imported tag', () => {
		expect(specUrl('SPEC-v0.md', '3-data-model')).toBe(
			`https://github.com/mandate-spec/mandate-spec/blob/${spec.latest.tag}/SPEC-v0.md#3-data-model`
		);
		expect(specUrl('SPEC-v0.md')).not.toContain('#');
	});
	it('points vulnerability reports to the specification repository', () => {
		expect(SECURITY_URL).toBe('https://github.com/mandate-spec/mandate-spec/security/advisories/new');
	});
});

describe('localHref', () => {
	it('prefixes site pages, keeps anchors', () => {
		expect(localHref('/spec/v0/#3-data-model', 'de')).toBe('/de/spec/v0/#3-data-model');
		expect(localHref('/why/', 'en')).toBe('/why/');
	});
	it('leaves files, anchors and external links alone', () => {
		expect(localHref('/mandate/v0/mandate.schema.json', 'de')).toBe('/mandate/v0/mandate.schema.json');
		expect(localHref('#faq', 'de')).toBe('#faq');
		expect(localHref('https://github.com/x', 'de')).toBe('https://github.com/x');
		expect(localHref('mailto:contact@mandate-spec.org', 'de')).toBe('mailto:contact@mandate-spec.org');
	});
});
