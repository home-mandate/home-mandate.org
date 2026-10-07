// Atom feed (RFC 4287) of the changelog. Entry content is HTML built here from
// the document tree: every piece of text is escaped, so nothing from the
// specification can become markup of its own.
import type { ChangeGroup, ChangelogEntry } from './changelog';
import type { Block, Inline } from './types';

/** Escapes text for XML and HTML (element content and quoted attributes). */
export function escapeXml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** base: absolute URL that in-page anchors (#...) are resolved against. */
export function inlineHtml(nodes: Inline[], base = ''): string {
	return nodes
		.map((n) => {
			switch (n.type) {
				case 'text':
					return escapeXml(n.text);
				case 'keyword':
					return `<strong>${escapeXml(n.text)}</strong>`;
				case 'code':
					return `<code>${escapeXml(n.text)}</code>`;
				case 'strong':
				case 'em':
				case 'del':
					return `<${n.type}>${inlineHtml(n.children, base)}</${n.type}>`;
				case 'link':
					return `<a href="${escapeXml(n.href.startsWith('#') ? base + n.href : n.href)}">${inlineHtml(n.children, base)}</a>`;
				case 'br':
					return '<br>';
			}
		})
		.join('');
}

export function blocksHtml(blocks: Block[], base = ''): string {
	return blocks
		.map((b) => {
			switch (b.type) {
				case 'heading':
					return `<h${b.depth}>${escapeXml(b.text)}</h${b.depth}>`;
				case 'paragraph':
					return b.tight ? inlineHtml(b.inline, base) : `<p>${inlineHtml(b.inline, base)}</p>`;
				case 'list': {
					const tag = b.ordered ? 'ol' : 'ul';
					const start = b.ordered && b.start !== 1 ? ` start="${b.start}"` : '';
					return `<${tag}${start}>${b.items.map((i) => `<li>${blocksHtml(i.blocks, base)}</li>`).join('')}</${tag}>`;
				}
				case 'table': {
					const head = `<tr>${b.header.map((c) => `<th>${inlineHtml(c, base)}</th>`).join('')}</tr>`;
					const rows = b.rows.map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c, base)}</td>`).join('')}</tr>`).join('');
					return `<table>${head}${rows}</table>`;
				}
				case 'code':
					return `<pre><code>${escapeXml(b.text)}</code></pre>`;
				case 'blockquote':
					return `<blockquote>${blocksHtml(b.blocks, base)}</blockquote>`;
				case 'hr':
					return '<hr>';
			}
		})
		.join('');
}

export interface FeedOptions {
	/** Absolute URL of the changelog page. */
	page: string;
	/** Absolute URL of the specification page (for in-page anchors). */
	spec: string;
	/** Absolute URL of the feed itself. */
	self: string;
	title: string;
	/** Kind labels shown before each group, e.g. { added: 'added' }. */
	kinds: Record<string, string>;
	/** RFC 3339 date of the imported release; Atom requires an updated date. */
	updated: string;
	/** Label for the Unreleased entry, e.g. "Unreleased (as of v0.2.0-alpha.4)". */
	entryTitle: (entry: ChangelogEntry) => string;
}

function groupHtml(group: ChangeGroup, kinds: Record<string, string>, base: string): string {
	const label = group.kind ? `<strong>${escapeXml(kinds[group.kind] ?? group.kind)}</strong> ` : '';
	const intro = group.intro ? inlineHtml(group.intro, base) : '';
	const head = label || intro ? `<p>${label}${intro}</p>` : '';
	const list = group.items.length > 0 ? `<ul>${group.items.map((i) => `<li>${blocksHtml(i.blocks, base)}</li>`).join('')}</ul>` : '';
	return head + list;
}

export function atomFeed(entries: ChangelogEntry[], options: FeedOptions): string {
	const items = entries.map((entry) => {
		const url = `${options.page}#${entry.id}`;
		const html = entry.groups.map((g) => groupHtml(g, options.kinds, options.spec)).join('');
		return [
			'\t<entry>',
			`\t\t<id>${escapeXml(url)}</id>`,
			`\t\t<title>${escapeXml(options.entryTitle(entry))}</title>`,
			`\t\t<updated>${escapeXml(options.updated)}</updated>`,
			`\t\t<link rel="alternate" type="text/html" href="${escapeXml(url)}"/>`,
			`\t\t<content type="html" xml:lang="en">${escapeXml(html)}</content>`,
			'\t</entry>'
		].join('\n');
	});
	return [
		'<?xml version="1.0" encoding="utf-8"?>',
		'<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
		`\t<id>${escapeXml(options.page)}</id>`,
		`\t<title>${escapeXml(options.title)}</title>`,
		`\t<updated>${escapeXml(options.updated)}</updated>`,
		`\t<author><name>mandate-spec</name></author>`,
		`\t<link rel="self" type="application/atom+xml" href="${escapeXml(options.self)}"/>`,
		`\t<link rel="alternate" type="text/html" href="${escapeXml(options.page)}"/>`,
		...items,
		'</feed>',
		''
	].join('\n');
}
