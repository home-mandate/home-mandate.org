import { describe, expect, it } from 'vitest';
import { externalLinksInNewTab } from '../src/lib/links.ts';

describe('externalLinksInNewTab', () => {
	it('opens links to other websites in a new tab', () => {
		expect(externalLinksInNewTab('<a href="https://github.com/home-mandate" class="x">GitHub</a>')).toBe(
			'<a href="https://github.com/home-mandate" class="x" target="_blank" rel="noopener">GitHub</a>'
		);
	});

	it('keeps links within the site in the same tab', () => {
		for (const html of [
			'<a href="/de/faq/">FAQ</a>',
			'<a href="#install">Install</a>',
			'<a href="https://home-mandate.org/spec/v0/">Spec</a>',
			'<a href="mailto:contact@home-mandate.org">Mail</a>'
		]) {
			expect(externalLinksInNewTab(html)).toBe(html);
		}
	});

	it('does not touch a link that already names a target', () => {
		const html = '<a target="_self" href="https://github.com/x">x</a>';
		expect(externalLinksInNewTab(html)).toBe(html);
	});

	it('changes every external link of a page and nothing else', () => {
		const html = '<link rel="alternate" href="https://home-mandate.org/de/"><p><a href="https://a.example">a</a> <a href="/b/">b</a></p>';
		expect(externalLinksInNewTab(html)).toBe(
			'<link rel="alternate" href="https://home-mandate.org/de/"><p><a href="https://a.example" target="_blank" rel="noopener">a</a> <a href="/b/">b</a></p>'
		);
	});
});
