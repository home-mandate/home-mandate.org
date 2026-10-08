import { describe, expect, it } from 'vitest';
import { headingId, legalText } from '../src/lib/content/legal/index.ts';

describe('legalText', () => {
	it('German is shown in German, every other language gets English', () => {
		expect(legalText('privacy', 'de').lang).toBe('de');
		expect(legalText('privacy', 'en').lang).toBe('en');
		expect(legalText('imprint', 'fr').lang).toBe('en');
	});

	it('the privacy policy matches what the site really does', () => {
		for (const locale of ['de', 'en']) {
			const text = JSON.stringify(legalText('privacy', locale).text);
			expect(text).not.toMatch(/Browsertyp und Browserversion|Browser type and browser version/);
			expect(text).not.toMatch(/gewählte Sprache|chosen language|Sprache Ihres Browsers|browser’s language/);
			expect(text).toMatch(/14 (Tagen|days)/);
		}
	});

	it('the imprint names both ways to get in touch', () => {
		for (const locale of ['de', 'en']) {
			const text = JSON.stringify(legalText('imprint', locale).text);
			expect(text).toContain('mailto:contact@home-mandate.org');
			expect(text).toContain('(/contact/)');
		}
	});
});

it('headingId builds stable anchors', () => {
	expect(headingId('1. Datenschutz auf einen Blick')).toBe('1-datenschutz-auf-einen-blick');
	expect(headingId('Größe & Maß')).toBe('grosse-mass');
});
