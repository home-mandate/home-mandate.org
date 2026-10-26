import { describe, expect, it } from 'vitest';
import { breadcrumbLd, definedTermSetLd, faqPageLd, jsonLdScript, ogImage, ogLocale, specLd, websiteLd } from '../src/lib/seo.ts';

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
			publisher: { '@type': 'Organization', '@id': 'https://home-mandate.org/#organization', name: 'Home-Mandate', url: 'https://home-mandate.org/' }
		});
	});

	it('describes the project as one organisation with logo and repositories', () => {
		const { publisher } = websiteLd({ name: 'n', description: 'd', url: 'https://home-mandate.org/', locale: 'en' }) as { publisher: Record<string, unknown> };
		expect(publisher.logo).toBe('https://home-mandate.org/icons/icon-512.png');
		expect(publisher.sameAs).toEqual([
			'https://github.com/home-mandate',
			'https://github.com/home-mandate/spec',
			'https://github.com/home-mandate/home-mandate.org'
		]);
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

	it('names description, source file, the site it belongs to and the release date as last change', () => {
		const ld = specLd({
			title: 't',
			url: 'https://home-mandate.org/de/spec/v0/',
			version: 'v0.1.0',
			date: '2026-10-21',
			description: 'd',
			source: 'https://github.com/home-mandate/spec/blob/v0.1.0/SPEC-v0.md'
		});
		expect(ld).toMatchObject({
			url: 'https://home-mandate.org/de/spec/v0/',
			description: 'd',
			dateModified: '2026-10-21',
			isBasedOn: 'https://github.com/home-mandate/spec/blob/v0.1.0/SPEC-v0.md',
			isPartOf: { '@type': 'WebSite', url: 'https://home-mandate.org/' },
			author: { '@id': 'https://home-mandate.org/#organization' }
		});
	});

	it('leaves out the date when the release has none', () => {
		const ld = specLd({ title: 't', url: 'u', version: 'v0' });
		expect(ld).not.toHaveProperty('datePublished');
		expect(ld).not.toHaveProperty('dateModified');
	});
});

describe('breadcrumbLd', () => {
	it('numbers the trail from the home page to the current page', () => {
		expect(
			breadcrumbLd([
				{ name: 'Home-Mandate', url: 'https://home-mandate.org/' },
				{ name: 'Specification', url: 'https://home-mandate.org/spec/v0/' }
			])
		).toEqual({
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home-Mandate', item: 'https://home-mandate.org/' },
				{ '@type': 'ListItem', position: 2, name: 'Specification', item: 'https://home-mandate.org/spec/v0/' }
			]
		});
	});
});

describe('definedTermSetLd', () => {
	it('lists every term with its code and definition', () => {
		const ld = definedTermSetLd({
			name: 'Glossary',
			url: 'https://home-mandate.org/glossary/',
			locale: 'en',
			terms: [{ term: 'Agent', code: 'agent', def: 'A program that acts.' }]
		});
		expect(ld).toEqual({
			'@type': 'DefinedTermSet',
			name: 'Glossary',
			url: 'https://home-mandate.org/glossary/',
			inLanguage: 'en',
			hasDefinedTerm: [{ '@type': 'DefinedTerm', name: 'Agent', termCode: 'agent', description: 'A program that acts.' }]
		});
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
