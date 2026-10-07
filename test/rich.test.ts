import { describe, expect, it } from 'vitest';
import { plain, segments } from '../src/lib/rich.ts';

describe('segments', () => {
	it('splits text and links', () => {
		expect(segments('Read [the spec](/spec/v0/) or [GitHub](https://github.com/x).')).toEqual([
			{ text: 'Read ' },
			{ text: 'the spec', href: '/spec/v0/', external: false },
			{ text: ' or ' },
			{ text: 'GitHub', href: 'https://github.com/x', external: true },
			{ text: '.' }
		]);
	});

	it('keeps plain text without links', () => {
		expect(segments('no links')).toEqual([{ text: 'no links' }]);
	});

	it('never turns unsafe targets into links', () => {
		for (const href of ['javascript:alert', '//evil.example', 'http://x.org', 'data:text/html,x']) {
			expect(segments(`[x](${href})`)).toEqual([{ text: `[x](${href})` }]);
		}
	});

	it('accepts anchors and mailto', () => {
		expect(segments('[a](#faq)')[0]).toMatchObject({ href: '#faq' });
		expect(segments('[mail](mailto:contact@mandate-spec.org)')[0]).toMatchObject({ external: false });
	});
});

it('plain drops the link markup', () => {
	expect(plain('Read [the spec](/spec/v0/).')).toBe('Read the spec.');
});
