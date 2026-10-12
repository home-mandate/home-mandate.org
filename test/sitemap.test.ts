import { describe, expect, it } from 'vitest';
import { checkIndexNowKey, checkRobots, llmsTxt, pageInfo, sitemapXml, type PageInfo } from '../scripts/lib/sitemap.ts';

const head = (inner: string) => `<!doctype html><html lang="en"><head>${inner}</head><body></body></html>`;
const imprint = head(
	'<title>Imprint – Home-Mandate</title>' +
		'<meta name="description" content="Who runs the site &amp; how to reach us."/>' +
		'<link rel="canonical" href="https://home-mandate.org/imprint/"/>' +
		'<link rel="alternate" hreflang="en" href="https://home-mandate.org/imprint/"/>' +
		'<link rel="alternate" hreflang="de" href="https://home-mandate.org/de/imprint/"/>' +
		'<link rel="alternate" hreflang="x-default" href="https://home-mandate.org/imprint/"/>'
);

const page = (canonical: string | undefined, extra: Partial<PageInfo> = {}): PageInfo => ({
	canonical,
	alternates: [],
	title: 'T',
	description: 'D',
	noindex: false,
	...extra
});

describe('pageInfo', () => {
	it('reads canonical, alternates, title and description of a built page', () => {
		expect(pageInfo(imprint)).toEqual({
			canonical: 'https://home-mandate.org/imprint/',
			alternates: [
				{ hreflang: 'en', href: 'https://home-mandate.org/imprint/' },
				{ hreflang: 'de', href: 'https://home-mandate.org/de/imprint/' },
				{ hreflang: 'x-default', href: 'https://home-mandate.org/imprint/' }
			],
			title: 'Imprint – Home-Mandate',
			description: 'Who runs the site & how to reach us.',
			noindex: false
		});
	});

	it('notices pages that ask not to be indexed', () => {
		expect(pageInfo(head('<meta name="robots" content="noindex" />')).noindex).toBe(true);
	});

	it('returns no canonical and empty texts when the page has none', () => {
		expect(pageInfo(head(''))).toEqual({ canonical: undefined, alternates: [], title: '', description: '', noindex: false });
	});
});

describe('sitemapXml', () => {
	it('lists every indexable page once with its language versions', () => {
		const xml = sitemapXml([pageInfo(imprint)]);
		expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
		expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
		expect(xml).toContain('<loc>https://home-mandate.org/imprint/</loc>');
		expect(xml).toContain('<xhtml:link rel="alternate" hreflang="de" href="https://home-mandate.org/de/imprint/"/>');
		expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://home-mandate.org/imprint/"/>');
	});

	it('leaves out noindex pages and pages without canonical, and lists duplicates once', () => {
		const xml = sitemapXml([
			page('https://home-mandate.org/b/'),
			page('https://home-mandate.org/a/'),
			page('https://home-mandate.org/a/'),
			page('https://home-mandate.org/hidden/', { noindex: true }),
			page(undefined)
		]);
		expect(xml.match(/<url>/g)).toHaveLength(2);
		expect(xml).not.toContain('hidden');
		expect(xml.indexOf('/a/')).toBeLessThan(xml.indexOf('/b/'));
	});

	it('escapes XML special characters', () => {
		expect(sitemapXml([page('https://home-mandate.org/?a=1&b=2')])).toContain('<loc>https://home-mandate.org/?a=1&amp;b=2</loc>');
	});

	it('refuses addresses outside the site', () => {
		expect(() => sitemapXml([page('https://evil.example/')])).toThrow(/outside/);
	});
});

describe('llmsTxt', () => {
	const pages = [
		page('https://home-mandate.org/', { title: 'Home-Mandate – AI is coming home.', description: 'Open standard.' }),
		page('https://home-mandate.org/faq/', { title: 'Frequently asked questions – Home-Mandate', description: 'Short answers.' }),
		page('https://home-mandate.org/de/faq/', { title: 'Häufige Fragen – Home-Mandate', description: 'Kurze Antworten.' }),
		page('https://home-mandate.org/contact/sent/', { noindex: true })
	];
	const site = { name: 'Home-Mandate', summary: 'Open standard for AI agents at home.', languages: ['en', 'de'] };

	it('starts with the site name and its summary', () => {
		expect(llmsTxt(pages, site).startsWith('# Home-Mandate\n\n> Open standard for AI agents at home.\n')).toBe(true);
	});

	it('lists the English indexable pages with title and description', () => {
		const text = llmsTxt(pages, site);
		expect(text).toContain('- [Frequently asked questions](https://home-mandate.org/faq/): Short answers.');
		expect(text).not.toContain('/de/');
		expect(text).not.toContain('contact/sent');
	});
});

describe('checkRobots', () => {
	it('requires the sitemap address', () => {
		expect(checkRobots('User-agent: *\nAllow: /\nSitemap: https://home-mandate.org/sitemap.xml\n')).toEqual([]);
		expect(checkRobots('User-agent: *\nAllow: /\n').join()).toMatch(/Sitemap/);
	});

	it('must not shut out any crawler from the whole site', () => {
		expect(checkRobots('User-agent: *\nDisallow: /\nSitemap: https://home-mandate.org/sitemap.xml\n').join()).toMatch(/Disallow: \//);
	});
});

describe('checkIndexNowKey', () => {
	it('accepts a key of 8 to 128 letters, digits and dashes', () => {
		expect(checkIndexNowKey('0123456789abcdef0123456789abcdef\n')).toEqual([]);
	});
	it.each(['', 'short', 'with space inside', 'ü'.repeat(10), 'a'.repeat(129)])('rejects %j', (key) => {
		expect(checkIndexNowKey(key).join()).toMatch(/indexnow\.txt/);
	});
});
