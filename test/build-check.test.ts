import { describe, expect, it } from 'vitest';
import { checkHtml, checkProvenance, checkSeo, isFormPage } from '../scripts/lib/build-check.ts';

const csp = '<meta http-equiv="content-security-policy" content="default-src \'none\'; script-src \'self\'">';
const page = (head: string, body = '') => `<!doctype html><html lang="en"><head>${csp}${head}</head><body>${body}</body></html>`;

describe('checkHtml', () => {
	it('accepts a clean page', () => {
		expect(checkHtml(page('<link rel="stylesheet" href="/_app/a.css">', '<a href="https://github.com/x">x</a>'))).toEqual([]);
	});
	it('requires a CSP meta tag', () => {
		expect(checkHtml('<html lang="en"><head></head><body></body></html>').join()).toMatch(/Content-Security-Policy/);
	});
	it('requires a lang attribute', () => {
		expect(checkHtml(`<html><head>${csp}</head></html>`).join()).toMatch(/lang/);
	});
	it.each([
		['<script src="https://cdn.example/x.js"></script>', 'external'],
		['<link rel="stylesheet" href="https://fonts.example/x.css">', 'external'],
		['<img src="http://example.org/a.png">', 'external'],
		['<link rel="preload" href="//cdn.example/x.js">', 'external'],
		['<div style="color:red"></div>', 'style attribute'],
		['<button onclick="x()"></button>', 'event handler'],
		['<iframe src="/x"></iframe>', 'iframe'],
		['<form action="/x"></form>', 'form'],
		['<style>body{color:red}</style>', 'style element'],
		['<script>alert(1)</script>', 'inline script'],
		['<base href="https://evil.example/">', 'base'],
		['<meta http-equiv="refresh" content="0;url=https://evil.example/">', 'refresh'],
		["<script src='https://cdn.example/x.js'></script>", 'external'],
		['<img src=https://cdn.example/x.png>', 'external']
	])('rejects %s', (snippet, needle) => {
		expect(checkHtml(page('', snippet)).join()).toMatch(new RegExp(needle, 'i'));
	});
	describe('forms', () => {
		const form = '<form class="form s-x" action="/contact" method="post" novalidate data-contact-form></form>';
		it.each(['contact/index.html', 'de/contact/index.html', 'pt-BR/contact/index.html'])('allow the contact form on %s', (path) => {
			expect(checkHtml(page('', form), path)).toEqual([]);
		});
		it.each(['index.html', 'contact/sent/index.html', 'de/contact/failed/index.html', 'privacy/index.html', 'xcontact/index.html', ''])(
			'reject a form on %s',
			(path) => {
				expect(checkHtml(page('', form), path).join()).toMatch(/only the contact page has a form/);
			}
		);
		it.each([
			'<form action="https://evil.example/contact" method="post">',
			'<form action="/contact" method="get">',
			'<form action="/contact/x" method="post">',
			'<form method="post">'
		])('reject a contact page form that does not post to /contact: %s', (tag) => {
			expect(checkHtml(page('', `${tag}</form>`), 'contact/index.html').join()).toMatch(/not posting to \/contact/);
		});
		it('knows the form pages', () => {
			expect(isFormPage('contact/index.html')).toBe(true);
			expect(isFormPage('contact/sent/index.html')).toBe(false);
		});
	});
	it('allows canonical and hreflang links to our own domain', () => {
		expect(checkHtml(page('<link rel="canonical" href="https://home-mandate.org/"><link rel="alternate" hreflang="de" href="https://home-mandate.org/de/">'))).toEqual([]);
	});
	it('rejects canonical links to other domains', () => {
		expect(checkHtml(page('<link rel="canonical" href="https://evil.example/">')).join()).toMatch(/external/);
	});
	describe('structured data', () => {
		it('allows JSON-LD with valid JSON', () => {
			expect(checkHtml(page('<script type="application/ld+json">{"@type":"WebSite"}</script>'))).toEqual([]);
		});
		it('rejects JSON-LD that is not valid JSON', () => {
			expect(checkHtml(page('<script type="application/ld+json">{"@type":</script>')).join()).toMatch(/JSON-LD/);
		});
		it('still rejects other inline scripts', () => {
			expect(checkHtml(page('<script type="module">alert(1)</script>')).join()).toMatch(/inline script/);
			expect(checkHtml(page('<script type="application/ld+json">{}</script><script>alert(1)</script>')).join()).toMatch(/inline script/);
		});
	});
});

describe('checkSeo', () => {
	const seo =
		'<title>Imprint – Home-Mandate</title>' +
		'<meta name="description" content="Who runs the site."/>' +
		'<link rel="canonical" href="https://home-mandate.org/imprint/"/>' +
		'<meta property="og:title" content="Imprint"/>' +
		'<meta property="og:description" content="Who runs the site."/>' +
		'<meta property="og:url" content="https://home-mandate.org/imprint/"/>' +
		'<meta property="og:image" content="https://home-mandate.org/og/en.png"/>';

	it('accepts an indexable page with title, one description, canonical and Open Graph', () => {
		expect(checkSeo(page(seo))).toEqual([]);
	});
	it('rejects two descriptions', () => {
		expect(checkSeo(page(`${seo}<meta name="description" content="again"/>`)).join()).toMatch(/2 meta descriptions/);
	});
	it.each([
		['<title>', /<title>/],
		['name="description"', /meta description/],
		['rel="canonical"', /canonical/],
		['og:title', /og:title/],
		['og:image', /og:image/]
	])('requires %s on an indexable page', (needle, message) => {
		const without = seo
			.split(/(?=<)/)
			.filter((tag) => !tag.includes(needle))
			.join('');
		expect(checkSeo(page(without)).join()).toMatch(message);
	});
	it('requires og:url to equal the canonical address', () => {
		const moved = seo.replace('og:url" content="https://home-mandate.org/imprint/', 'og:url" content="https://home-mandate.org/x/');
		expect(checkSeo(page(moved)).join()).toMatch(/og:url/);
	});
	it('asks nothing of noindex pages except at most one description', () => {
		expect(checkSeo(page('<meta name="robots" content="noindex"/>'))).toEqual([]);
		const twice = '<meta name="robots" content="noindex"/><meta name="description" content="a"/><meta name="description" content="b"/>';
		expect(checkSeo(page(twice)).join()).toMatch(/2 meta descriptions/);
	});
});

describe('checkSecurityTxt', () => {
	it('accepts an expiry far enough ahead', async () => {
		const { checkSecurityTxt } = await import('../scripts/lib/build-check.ts');
		expect(checkSecurityTxt('Expires: 2027-10-01T00:00:00Z\n', new Date('2026-10-01T00:00:00Z'))).toEqual([]);
	});
	it('fails 60 days before expiry and without Expires', async () => {
		const { checkSecurityTxt } = await import('../scripts/lib/build-check.ts');
		expect(checkSecurityTxt('Expires: 2026-11-01T00:00:00Z\n', new Date('2026-10-01T00:00:00Z')).join()).toMatch(/expires/i);
		expect(checkSecurityTxt('Contact: x\n', new Date()).join()).toMatch(/Expires/);
	});
});

describe('checkProvenance', () => {
	it('flags C2PA records in SVG metadata and PNG chunks', () => {
		expect(checkProvenance(Buffer.from('<svg><metadata><c2pa:manifest>x</c2pa:manifest></metadata></svg>'))).toHaveLength(1);
		expect(checkProvenance(Buffer.from('\x89PNG....caBX....'))).toHaveLength(1);
	});
	it('accepts clean files', () => {
		expect(checkProvenance(Buffer.from('<svg viewBox="0 0 16 16"><path d="M1 1"/></svg>'))).toEqual([]);
	});
});
