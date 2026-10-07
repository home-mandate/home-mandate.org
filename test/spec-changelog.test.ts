import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { changelogSection, kindOf, parseChangelog, withoutKindWord } from '../src/lib/spec/changelog';
import { atomDate, formatDate } from '../src/lib/spec/date';
import { atomFeed, blocksHtml, escapeXml, inlineHtml } from '../src/lib/spec/feed';
import { plainText } from '../src/lib/spec/inline';
import { parseSpec } from '../src/lib/spec/markdown';
import { loadReleaseNotes } from '../src/lib/spec/release-notes.server';
import { loadSpec, specVersions, tagDate } from '../src/lib/spec/source.server';
import { spec } from '../src/lib/generated/spec';

const ctx = { repository: 'https://github.com/mandate-spec/mandate-spec', tag: 'v0.2.0-alpha.4', file: 'SPEC-v0.md' };

const SAMPLE = [
	'# Title',
	'',
	'## 1. Goal',
	'',
	'New: not a changelog.',
	'',
	'## Changelog',
	'',
	'Intro before any version is ignored.',
	'',
	'### Unreleased',
	'',
	'Incompatible; implementations SHOULD check:',
	'- `a` changed',
	'- b',
	'',
	'Clarified, each with cases:',
	'- c',
	'',
	'New:',
	'- d',
	'  - d.1',
	'',
	'Conformance cases: new fields.',
	'',
	'#### Ignored deeper heading',
	'',
	'### v0.1.0-alpha.1',
	'',
	'- list without paragraph',
	'',
	'Fixed:',
	'- e',
	'',
	'## 15. After the changelog',
	'',
	'- not part of it'
].join('\n');

describe('kindOf', () => {
	it.each([
		['New:', 'added'],
		['Added:', 'added'],
		['Incompatible; mandates ...', 'incompatible'],
		['Breaking changes:', 'incompatible'],
		['Clarified (Section 4), each with new conformance cases:', 'clarified'],
		['Changed:', 'changed'],
		['Fixed:', 'fixed'],
		['Removed:', 'removed'],
		['Conformance cases: new fields', undefined],
		['Newly permitted:', undefined]
	])('%s -> %s', (text, kind) => {
		expect(kindOf(text)).toBe(kind);
	});
});

describe('withoutKindWord', () => {
	it('removes the word that the badge shows, with its separator', () => {
		expect(withoutKindWord([{ type: 'text', text: 'Incompatible; mandates ' }, { type: 'keyword', text: 'MUST' }])).toEqual([
			{ type: 'text', text: 'mandates ' },
			{ type: 'keyword', text: 'MUST' }
		]);
		expect(withoutKindWord([{ type: 'text', text: 'New:' }])).toEqual([]);
	});
	it('leaves a paragraph that does not start with text', () => {
		const intro = [{ type: 'code' as const, text: 'x' }];
		expect(withoutKindWord(intro)).toBe(intro);
	});
});

describe('parseChangelog', () => {
	const entries = parseChangelog(parseSpec(SAMPLE, ctx).blocks);

	it('finds one entry per level-3 heading of the Changelog section', () => {
		expect(entries.map((e) => [e.version, e.id, e.unreleased])).toEqual([
			['Unreleased', 'unreleased', true],
			['v0.1.0-alpha.1', 'v010-alpha1', false]
		]);
	});
	it('groups paragraphs with the list after them and takes the kind from the text', () => {
		const groups = entries[0]?.groups ?? [];
		expect(groups.map((g) => [g.kind, g.intro ? plainText(g.intro) : undefined, g.items.length])).toEqual([
			['incompatible', 'implementations SHOULD check:', 2],
			['clarified', 'each with cases:', 1],
			['added', undefined, 1],
			[undefined, 'Conformance cases: new fields.', 0]
		]);
	});
	it('keeps inline formatting and nested lists of the items', () => {
		const first = entries[0]?.groups[0]?.items[0]?.blocks[0];
		expect(first).toEqual({ type: 'paragraph', tight: true, inline: [{ type: 'code', text: 'a' }, { type: 'text', text: ' changed' }] });
		expect(entries[0]?.groups[2]?.items[0]?.blocks.map((b) => b.type)).toEqual(['paragraph', 'list']);
	});
	it('stops at the next level-2 heading', () => {
		expect(entries[1]?.groups.map((g) => [g.kind, g.items.length])).toEqual([
			[undefined, 1],
			['fixed', 1]
		]);
	});
	it('is empty without a Changelog section', () => {
		expect(parseChangelog(parseSpec('# T\n\n## 1. Goal\n\ntext', ctx).blocks)).toEqual([]);
		expect(changelogSection([])).toEqual([]);
	});
	it('reads a changelog that is the last section', () => {
		expect(parseChangelog(parseSpec('## Changelog\n\n### v1\n\nNew:\n- x', ctx).blocks)[0]?.groups[0]?.kind).toBe('added');
	});
});

describe('feed', () => {
	const entries = parseChangelog(parseSpec(SAMPLE, ctx).blocks);
	const xml = atomFeed(entries, {
		page: 'https://mandate-spec.org/changelog/',
		spec: 'https://mandate-spec.org/spec/v0/',
		self: 'https://mandate-spec.org/changelog/feed.xml',
		title: 'mandate-spec changelog',
		kinds: { added: 'added', incompatible: 'incompatible' },
		updated: atomDate('2026-10-05'),
		entryTitle: (e) => (e.unreleased ? 'Unreleased (as of v0.2.0-alpha.4)' : e.version)
	});

	it('is an Atom feed with one entry per version', () => {
		expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"')).toBe(true);
		expect(xml.match(/<entry>/g)).toHaveLength(2);
		expect(xml).toContain('<id>https://mandate-spec.org/changelog/#unreleased</id>');
		expect(xml).toContain('<title>Unreleased (as of v0.2.0-alpha.4)</title>');
		expect(xml).toContain('<updated>2026-10-05T00:00:00Z</updated>');
		expect(xml).toContain('<link rel="self" type="application/atom+xml" href="https://mandate-spec.org/changelog/feed.xml"/>');
	});
	it('escapes the HTML content once more for XML', () => {
		expect(xml).toContain('&lt;strong&gt;incompatible&lt;/strong&gt;');
		expect(xml).toContain('&lt;code&gt;a&lt;/code&gt;');
		expect(xml).not.toMatch(/<(strong|code|ul|li)>/);
	});
	it('falls back to the kind name without a label', () => {
		expect(xml).toContain('&lt;strong&gt;clarified&lt;/strong&gt;');
	});
});

describe('HTML serialisation', () => {
	it('escapes every text and attribute', () => {
		expect(escapeXml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;');
		const doc = parseSpec('Text <script>x</script> [l](https://e.example/?a="b"&c) [in](#1-goal) **MUST** _e_ ~~d~~ a  \nb', ctx);
		const html = blocksHtml(doc.blocks, 'https://mandate-spec.org/spec/v0/');
		expect(html).toContain('Text &lt;script&gt;x&lt;/script&gt;');
		expect(html).toContain('<a href="https://e.example/?a=&quot;b&quot;&amp;c">l</a>');
		expect(html).toContain('<a href="https://mandate-spec.org/spec/v0/#1-goal">in</a>');
		expect(html).toContain('<strong><strong>MUST</strong></strong> <em>e</em> <del>d</del> a<br>b');
	});
	it('serialises every block type', () => {
		const md = '## H\n\n2. two\n3. three\n\n| a |\n|---|\n| `b` |\n\n```\n<x>\n```\n\n> q\n\n---\n\n- loose\n\n- list';
		const html = blocksHtml(parseSpec(md, ctx).blocks);
		expect(html).toBe(
			'<h2>H</h2><ol start="2"><li>two</li><li>three</li></ol><table><tr><th>a</th></tr><tr><td><code>b</code></td></tr></table>' +
				'<pre><code>&lt;x&gt;</code></pre><blockquote><p>q</p></blockquote><hr><ul><li><p>loose</p></li><li><p>list</p></li></ul>'
		);
		expect(inlineHtml([{ type: 'link', href: '#x', external: false, children: [{ type: 'text', text: 't' }] }])).toBe('<a href="#x">t</a>');
	});
});

describe('dates', () => {
	it('formats a release date per language', () => {
		expect(formatDate('2026-10-05', 'en')).toBe('5 October 2026');
		expect(formatDate('2026-10-05', 'de')).toBe('5. Oktober 2026');
	});
});

describe('imported specification', () => {
	const tag = spec.latest.tag;
	const available = existsSync(`.spec-cache/${tag}/SPEC-v0.md`);

	it('lists the imported versions newest first', () => {
		expect(specVersions([{ tag: 'v0.1.0' }, { tag: 'v0.2.0-alpha.1' }, { tag: 'v1.0.0' }], 'v0.2.0-alpha.1')).toEqual([
			{ tag: 'v0.2.0-alpha.1', latest: true },
			{ tag: 'v0.1.0', latest: false }
		]);
		expect(specVersions()[0]).toEqual({ tag, latest: true });
	});
	it('refuses tags that are not v0 releases', () => {
		expect(() => loadSpec('../etc')).toThrow(/release tag/);
		expect(tagDate('../etc')).toBeUndefined();
		expect(tagDate('v0.0.0', '/nonexistent')).toBeUndefined();
	});
	it.runIf(available)('parses SPEC-v0.md with the anchors other pages link to', () => {
		const loaded = loadSpec(tag);
		expect(loadSpec(tag)).toBe(loaded);
		expect(loaded.document.title).toMatch(/^mandate-spec v0/);
		const ids = loaded.document.toc.map((e) => e.id);
		expect(ids).toEqual(expect.arrayContaining(['1-goal', '3-data-model', '31-validity-of-a-mandate', '9-audit-log', 'changelog']));
		expect(new Set(ids).size).toBe(ids.length);
		expect(loaded.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
	it.runIf(available)('finds the changelog of the imported release', () => {
		const entries = parseChangelog(loadSpec(tag).document.blocks);
		expect(entries.length).toBeGreaterThan(0);
		expect(entries.some((e) => e.groups.some((g) => g.kind !== undefined))).toBe(true);
	});
	it.runIf(available)('dates the changelog with the release tag, and only imported releases', () => {
		const notes = loadReleaseNotes();
		expect(notes.tag).toBe(tag);
		expect(notes.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		const imported = new Set(specVersions().map((v) => v.tag));
		for (const entry of notes.entries) expect(entry.date === undefined || imported.has(entry.version)).toBe(true);
	});
});
