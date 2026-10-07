// Inline Markdown (marked tokens) -> Inline nodes. Raw HTML is never passed
// on as markup: it becomes visible text. Links are checked and rewritten.
import type { Tokens } from 'marked';
import type { Inline, LinkContext } from './types';

type Token = Tokens.Generic;

// RFC 2119 / RFC 8174 key words, longest first so "MUST NOT" wins over "MUST".
const KEYWORDS = /\b(NOT RECOMMENDED|MUST NOT|SHALL NOT|SHOULD NOT|RECOMMENDED|REQUIRED|OPTIONAL|MUST|SHALL|SHOULD|MAY)\b/g;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Decodes the HTML character references that Markdown text may contain. */
export function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-f]{1,6}|#[0-9]{1,7}|[a-z]+);/gi, (whole, ref: string) => {
		if (ref.startsWith('#')) {
			const code = ref[1] === 'x' || ref[1] === 'X' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
			return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : whole;
		}
		return ENTITIES[ref.toLowerCase()] ?? whole;
	});
}

/** Splits text into plain parts and RFC 2119 key words. */
export function splitKeywords(text: string): Inline[] {
	const out: Inline[] = [];
	let last = 0;
	for (const match of text.matchAll(KEYWORDS)) {
		const start = match.index;
		if (start > last) out.push({ type: 'text', text: text.slice(last, start) });
		out.push({ type: 'keyword', text: match[0] });
		last = start + match[0].length;
	}
	if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
	return out;
}

/**
 * Target of a link in the specification: anchors stay on the page, relative
 * paths point to the file in the repository at the imported tag, https and
 * mailto stay as they are. Anything else (javascript:, data:, protocol-relative
 * ...) is not a link: returns undefined.
 */
export function rewriteHref(href: string, ctx: LinkContext): { href: string; external: boolean } | undefined {
	const target = href.trim();
	if (target.startsWith('#')) return { href: target, external: false };
	if (/^https:\/\//i.test(target) || /^http:\/\//i.test(target)) return { href: target, external: true };
	if (/^mailto:/i.test(target)) return { href: target, external: false };
	if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//') || target.includes('\\')) return undefined;

	const [pathPart = '', hash] = splitHash(target);
	const base = ctx.file.includes('/') ? ctx.file.slice(0, ctx.file.lastIndexOf('/') + 1) : '';
	const path = resolvePath(pathPart.startsWith('/') ? pathPart.slice(1) : base + pathPart);
	if (path === undefined) return undefined;
	// The file itself: an anchor on this page.
	if (path === ctx.file && hash !== undefined) return { href: `#${hash}`, external: false };
	const url = `${ctx.repository}/blob/${ctx.tag}/${path}`;
	return { href: hash === undefined ? url : `${url}#${hash}`, external: true };
}

function splitHash(target: string): [string, string | undefined] {
	const i = target.indexOf('#');
	return i < 0 ? [target, undefined] : [target.slice(0, i), target.slice(i + 1)];
}

/** Resolves ./ and ../ segments; undefined when the path leaves the repository. */
function resolvePath(path: string): string | undefined {
	const out: string[] = [];
	for (const segment of path.split('/')) {
		if (segment === '' || segment === '.') continue;
		if (segment === '..') {
			if (out.length === 0) return undefined;
			out.pop();
			continue;
		}
		out.push(segment);
	}
	return out.join('/');
}

/** Plain text of inline nodes (for slugs, the table of contents, feeds). */
export function plainText(nodes: Inline[]): string {
	return nodes
		.map((n) => {
			if (n.type === 'br') return ' ';
			if ('children' in n) return plainText(n.children);
			return n.text;
		})
		.join('');
}

/** Converts marked inline tokens. Adjacent text nodes are merged. */
export function convertInline(tokens: Token[] | undefined, ctx: LinkContext): Inline[] {
	const out: Inline[] = [];
	for (const token of tokens ?? []) out.push(...convertToken(token, ctx));
	return withKeywords(merge(out));
}

function convertToken(token: Token, ctx: LinkContext): Inline[] {
	switch (token.type) {
		case 'text':
			// Text inside lists can carry its own inline tokens.
			return token.tokens ? convertInline(token.tokens, ctx) : [{ type: 'text', text: decodeEntities(token.text) }];
		case 'escape':
			return [{ type: 'text', text: token.text }];
		case 'codespan':
			return [{ type: 'code', text: token.text }];
		case 'strong':
		case 'em':
		case 'del':
			return [{ type: token.type, children: convertInline(token.tokens, ctx) }];
		case 'br':
			return [{ type: 'br' }];
		case 'link': {
			const children = convertInline(token.tokens, ctx);
			const target = rewriteHref(token.href, ctx);
			return target ? [{ type: 'link', ...target, children }] : children;
		}
		case 'image':
			// No images from elsewhere: the alternative text stands in.
			return [{ type: 'text', text: token.text }];
		default:
			// html and anything unknown: shown as the literal source text.
			return [{ type: 'text', text: token.raw }];
	}
}

function merge(nodes: Inline[]): Inline[] {
	const out: Inline[] = [];
	for (const node of nodes) {
		const prev = out[out.length - 1];
		if (node.type === 'text' && prev?.type === 'text') out[out.length - 1] = { type: 'text', text: prev.text + node.text };
		else out.push(node);
	}
	return out;
}

/** Key words are found in plain text only (never inside code). */
function withKeywords(nodes: Inline[]): Inline[] {
	return nodes.flatMap((n) => (n.type === 'text' ? splitKeywords(n.text) : [n]));
}
