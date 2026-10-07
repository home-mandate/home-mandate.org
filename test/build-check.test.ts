import { describe, expect, it } from 'vitest';
import { checkHtml, checkProvenance } from '../scripts/lib/build-check.ts';

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
	it('allows canonical and hreflang links to our own domain', () => {
		expect(checkHtml(page('<link rel="canonical" href="https://mandate-spec.org/"><link rel="alternate" hreflang="de" href="https://mandate-spec.org/de/">'))).toEqual([]);
	});
	it('rejects canonical links to other domains', () => {
		expect(checkHtml(page('<link rel="canonical" href="https://evil.example/">')).join()).toMatch(/external/);
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
