import { describe, expect, it } from 'vitest';
import { faqPageLd, jsonLdScript, ogImage, ogLocale, specLd, websiteLd } from '../src/lib/seo.ts';

const parse = (script: string): unknown => JSON.parse(script.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, ''));

describe('jsonLdScript', () => {
	it('wraps the data in a JSON-LD script element', () => {
		const script = jsonLdScript({ '@type': 'Thing', name: 'x' });
		expect(script).toMatch(/^<script type="application\/ld\+json">.*<\/script>$/);
		expect(parse(script)).toEqual({ '@context': 'https://schema.org', '@type': 'Thing', name: 'x' });
	});

	it('cannot be closed early by text that contains </script>', () => {
		const script = jsonLdScript({ '@type': 'Thing', name: '</script><script>alert(1)</script> & <!--' });
		expect(script.match(/<\/script>/g)).toHaveLength(1);
		expect(script).not.toContain('<!--');
		expect(parse(script)).toMatchObject({ name: '</script><script>alert(1)</script> & <!--' });
	});
});

describe('websiteLd', () => {
	it('names the site, its language and the publishing project', () => {
		const ld = websiteLd({ name: 'Home-Mandate', description: 'd', url: 'https://home-mandate.org/de/', locale: 'de' });
		expect(ld).toMatchObject({
			'@type': 'WebSite',
			name: 'Home-Mandate',
			description: 'd',
			url: 'https://home-mandate.org/de/',
			inLanguage: 'de',
			publisher: { '@type': 'Organization', name: 'Home-Mandate', url: 'https://home-mandate.org/', sameAs: ['https://github.com/home-mandate'] }
		});
	});
});

describe('faqPageLd', () => {
	it('lists every question with its answer as plain text', () => {
		const ld = faqPageLd([
			{ q: 'Who owns it?', a: 'Nobody.' },
			{ q: 'Is it free?', a: 'Yes.' }
		]);
		expect(ld).toEqual({
			'@type': 'FAQPage',
			mainEntity: [
				{ '@type': 'Question', name: 'Who owns it?', acceptedAnswer: { '@type': 'Answer', text: 'Nobody.' } },
				{ '@type': 'Question', name: 'Is it free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes.' } }
			]
		});
	});
});

describe('specLd', () => {
	it('describes a release of the specification as a technical article', () => {
		const ld = specLd({ title: 'Home-Mandate Specification v0.1.0', url: 'https://home-mandate.org/spec/v0/', version: 'v0.1.0', date: '2026-10-01' });
		expect(ld).toMatchObject({
			'@type': 'TechArticle',
			headline: 'Home-Mandate Specification v0.1.0',
			url: 'https://home-mandate.org/spec/v0/',
			version: 'v0.1.0',
			datePublished: '2026-10-01',
			inLanguage: 'en',
			license: 'https://creativecommons.org/licenses/by/4.0/'
		});
	});

	it('leaves out the date when the release has none', () => {
		expect(specLd({ title: 't', url: 'u', version: 'v0' })).not.toHaveProperty('datePublished');
	});
});

describe('ogLocale', () => {
	it.each([
		['en', 'en_US'],
		['de', 'de_DE'],
		['pt-BR', 'pt_BR'],
		['fr', 'fr_FR']
	])('%s -> %s', (tag, expected) => {
		expect(ogLocale(tag)).toBe(expected);
	});
});

describe('ogImage', () => {
	it('has one share image per language, English for languages without their own', () => {
		expect(ogImage('de')).toBe('https://home-mandate.org/og/de.png');
		expect(ogImage('en')).toBe('https://home-mandate.org/og/en.png');
		expect(ogImage('fr')).toBe('https://home-mandate.org/og/en.png');
	});
});
