import { describe, expect, it } from 'vitest';
import { convertInline, decodeEntities, plainText, rewriteHref, splitKeywords } from '../src/lib/spec/inline';
import { parseSpec, splitNumber } from '../src/lib/spec/markdown';
import { createSlugger, slugify } from '../src/lib/spec/slug';
import type { Block, Inline } from '../src/lib/spec/types';

const ctx = { repository: 'https://github.com/mandate-spec/mandate-spec', tag: 'v0.2.0-alpha.4', file: 'SPEC-v0.md' };
const blob = `${ctx.repository}/blob/${ctx.tag}`;

function paragraph(markdown: string): Inline[] {
	const block = parseSpec(markdown, ctx).blocks[0];
	if (block?.type !== 'paragraph') throw new Error(`expected a paragraph, got ${block?.type}`);
	return block.inline;
}

describe('slugify', () => {
	it.each([
		['3. Data model', '3-data-model'],
		['3.1 Validity of a mandate', '31-validity-of-a-mandate'],
		['Changelog', 'changelog'],
		['v0.1.0-alpha.1', 'v010-alpha1'],
		['7.2 OAuth flow (informative)', '72-oauth-flow-informative'],
		['Use `allow_critical` – carefully!', 'use-allow_critical--carefully'],
		['Größe & Ümlaute', 'größe--ümlaute'],
		['  two  spaces ', '--two--spaces-']
	])('%s -> %s', (text, slug) => {
		expect(slugify(text)).toBe(slug);
	});
});

describe('createSlugger', () => {
	it('numbers repeated headings like GitHub', () => {
		const slug = createSlugger();
		expect([slug('Notes'), slug('Notes'), slug('Notes')]).toEqual(['notes', 'notes-1', 'notes-2']);
	});
	it('does not collide with a heading that already looks numbered', () => {
		const slug = createSlugger();
		expect([slug('a-1'), slug('a'), slug('a')]).toEqual(['a-1', 'a', 'a-2']);
	});
	it('keeps separate documents independent', () => {
		expect(createSlugger()('x')).toBe('x');
		expect(createSlugger()('x')).toBe('x');
	});
});

describe('splitKeywords', () => {
	it('marks every RFC 2119 key word, longest first', () => {
		const parts = splitKeywords('It MUST NOT fail, SHOULD NOT wait, MAY retry; REQUIRED, RECOMMENDED, OPTIONAL, MUST, SHOULD.');
		expect(parts.filter((p) => p.type === 'keyword').map((p) => (p as { text: string }).text)).toEqual([
			'MUST NOT',
			'SHOULD NOT',
			'MAY',
			'REQUIRED',
			'RECOMMENDED',
			'OPTIONAL',
			'MUST',
			'SHOULD'
		]);
		expect(plainText(parts)).toBe('It MUST NOT fail, SHOULD NOT wait, MAY retry; REQUIRED, RECOMMENDED, OPTIONAL, MUST, SHOULD.');
	});
	it('ignores lower case and words that only contain a key word', () => {
		expect(splitKeywords('you must, MAYBE, MUSTARD')).toEqual([{ type: 'text', text: 'you must, MAYBE, MUSTARD' }]);
	});
	it('finds key words in quotes (the BCP 14 paragraph)', () => {
		expect(splitKeywords('"MUST", "MAY"').filter((p) => p.type === 'keyword')).toHaveLength(2);
	});
});

describe('inline conversion', () => {
	it('never marks key words inside code', () => {
		expect(paragraph('The value `MUST` MUST be set.')).toEqual([
			{ type: 'text', text: 'The value ' },
			{ type: 'code', text: 'MUST' },
			{ type: 'text', text: ' ' },
			{ type: 'keyword', text: 'MUST' },
			{ type: 'text', text: ' be set.' }
		]);
	});
	it('keeps strong, emphasis, strike-through and line breaks', () => {
		const nodes = paragraph('**bold** _em_ ~~old~~ a  \nb');
		expect(nodes.map((n) => n.type)).toEqual(['strong', 'text', 'em', 'text', 'del', 'text', 'br', 'text']);
	});
	it('decodes character references and escapes', () => {
		expect(plainText(paragraph('Tom &amp; Jerry &#x2014; \\*not em\\* &copy2'))).toBe('Tom & Jerry — *not em* &copy2');
	});
	it('shows inline raw HTML as text, never as markup', () => {
		const nodes = paragraph('a <script>alert(1)</script> <b onclick="x">b</b>');
		expect(nodes.every((n) => n.type === 'text')).toBe(true);
		expect(plainText(nodes)).toBe('a <script>alert(1)</script> <b onclick="x">b</b>');
	});
	it('replaces images by their alternative text', () => {
		expect(paragraph('![logo](https://evil.example/x.png)')).toEqual([{ type: 'text', text: 'logo' }]);
	});
	it('handles a missing token list', () => {
		expect(convertInline(undefined, ctx)).toEqual([]);
	});
});

describe('decodeEntities', () => {
	it('decodes named and numeric references and leaves unknown or invalid ones', () => {
		expect(decodeEntities('&lt;&gt;&quot;&apos;&nbsp;&#65;&#x42;&unknown;&#xD800;&#0;')).toBe('<>"\' AB&unknown;&#xD800;&#0;');
	});
});

describe('rewriteHref', () => {
	it.each([
		['#3-data-model', '#3-data-model', false],
		['https://www.rfc-editor.org/rfc/rfc2119', 'https://www.rfc-editor.org/rfc/rfc2119', true],
		['http://example.org/', 'http://example.org/', true],
		['mailto:security@example.org', 'mailto:security@example.org', false],
		['schema/mandate-v0.schema.json', `${blob}/schema/mandate-v0.schema.json`, true],
		['./conformance/README.md#cases', `${blob}/conformance/README.md#cases`, true],
		['/LICENSE', `${blob}/LICENSE`, true],
		['SPEC-v0.md#4-evaluation-rule', '#4-evaluation-rule', false],
		['docs/../vocabulary/v0.json', `${blob}/vocabulary/v0.json`, true]
	])('%s -> %s', (href, target, external) => {
		expect(rewriteHref(href, ctx)).toEqual({ href: target, external });
	});
	it.each(['javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'data:text/html,x', '//evil.example/', '../outside.md', 'a\\b'])(
		'refuses %s',
		(href) => {
			expect(rewriteHref(href, ctx)).toBeUndefined();
		}
	);
	it('resolves paths relative to a file in a folder', () => {
		expect(rewriteHref('../SPEC-v0.md', { ...ctx, file: 'docs/guide.md' })).toEqual({ href: `${blob}/SPEC-v0.md`, external: true });
	});
	it('turns refused links into their text', () => {
		expect(paragraph('[click](javascript:alert(1)) [ok](#1-goal)')).toEqual([
			{ type: 'text', text: 'click ' },
			{ type: 'link', href: '#1-goal', external: false, children: [{ type: 'text', text: 'ok' }] }
		]);
	});
});

describe('parseSpec', () => {
	const markdown = [
		'<!-- SPDX-License-Identifier: CC-BY-4.0 -->',
		'',
		'# mandate-spec v0 (Draft)',
		'',
		'Status: **Working draft**.',
		'',
		'<div class="x">raw block</div>',
		'',
		'## 1. Goal',
		'',
		'| Purpose | Standard |',
		'|:---|---:|',
		'| Decision | `AuthZEN` |',
		'',
		'### 1.1 Notes',
		'',
		'0. zero',
		'1. one',
		'   - nested **b**',
		'',
		'> quoted MUST',
		'',
		'---',
		'',
		'```json',
		'{ "a": "<b>" }',
		'```',
		'',
		'## Changelog',
		'',
		'### Notes',
		'',
		'#### Deep'
	].join('\n');
	const doc = parseSpec(markdown, ctx);

	it('takes the title from the level-1 heading and removes it from the body', () => {
		expect(doc.title).toBe('mandate-spec v0 (Draft)');
		expect(doc.blocks.some((b) => b.type === 'heading' && b.depth === 1)).toBe(false);
	});
	it('drops raw HTML blocks (comments and elements)', () => {
		expect(JSON.stringify(doc.blocks)).not.toContain('SPDX');
		expect(JSON.stringify(doc.blocks)).not.toContain('raw block');
	});
	it('lists level-2 and level-3 headings with GitHub anchors, de-duplicated', () => {
		expect(doc.toc).toEqual([
			{ id: '1-goal', depth: 2, number: '1', text: 'Goal' },
			{ id: '11-notes', depth: 3, number: '1.1', text: 'Notes' },
			{ id: 'changelog', depth: 2, number: '', text: 'Changelog' },
			{ id: 'notes', depth: 3, number: '', text: 'Notes' }
		]);
	});
	it('separates the section number from the title', () => {
		const h = doc.blocks.find((b) => b.type === 'heading' && b.id === '1-goal') as Extract<Block, { type: 'heading' }>;
		expect(h.number).toBe('1');
		expect(h.title).toEqual([{ type: 'text', text: 'Goal' }]);
	});
	it('converts tables with alignment', () => {
		const table = doc.blocks.find((b) => b.type === 'table') as Extract<Block, { type: 'table' }>;
		expect(table.align).toEqual(['left', 'right']);
		expect(table.header.map(plainText)).toEqual(['Purpose', 'Standard']);
		expect(table.rows[0]?.[1]).toEqual([{ type: 'code', text: 'AuthZEN' }]);
	});
	it('keeps the start number of ordered lists and nests lists', () => {
		const list = doc.blocks.find((b) => b.type === 'list') as Extract<Block, { type: 'list' }>;
		expect(list.ordered).toBe(true);
		expect(list.start).toBe(0);
		expect(list.items).toHaveLength(2);
		const second = list.items[1]?.blocks ?? [];
		expect(second[0]).toEqual({ type: 'paragraph', inline: [{ type: 'text', text: 'one' }], tight: true });
		const nested = second[1] as Extract<Block, { type: 'list' }>;
		expect(nested.ordered).toBe(false);
		expect(nested.start).toBe(1);
	});
	it('converts block quotes, rules and code blocks (code stays literal)', () => {
		const types = doc.blocks.map((b) => b.type);
		expect(types).toContain('blockquote');
		expect(types).toContain('hr');
		expect(doc.blocks.find((b) => b.type === 'code')).toEqual({ type: 'code', lang: 'json', text: '{ "a": "<b>" }' });
	});
	it('works without a title', () => {
		expect(parseSpec('text', ctx).title).toBe('');
	});
});

describe('splitNumber', () => {
	it.each([
		['3. Data model', '3', 'Data model'],
		['10.4 Test tool', '10.4', 'Test tool'],
		['Changelog', '', 'Changelog'],
		['v0.1.0-alpha.1', '', 'v0.1.0-alpha.1']
	])('%s', (text, number, title) => {
		expect(splitNumber(text)).toEqual({ number, title });
	});
	it('keeps inline formatting of a numbered heading', () => {
		const h = parseSpec('## 4. The `ask` decision', ctx).blocks[0] as Extract<Block, { type: 'heading' }>;
		expect(h.title).toEqual([
			{ type: 'text', text: 'The ' },
			{ type: 'code', text: 'ask' },
			{ type: 'text', text: ' decision' }
		]);
		expect(h.id).toBe('4-the-ask-decision');
	});
});
