// The specification text (Markdown) -> SpecDocument. Only the marked lexer is
// used; rendering is done by Svelte components (src/lib/components/spec/),
// so no HTML string is ever produced or inserted. Raw HTML blocks (such as the
// SPDX comment at the top of SPEC-v0.md) are dropped.
import { Lexer, type Token, type Tokens } from 'marked';
import { convertInline, plainText } from './inline';
import { createSlugger } from './slug';
import type { Align, Block, Inline, LinkContext, SpecDocument, TocEntry } from './types';

// "3.1 Validity of a mandate" or "3. Data model": number and title.
const NUMBERED = /^(\d+(?:\.\d+)*)\.?\s+(.*)$/;

/** Splits a section number off a heading: ("3.1", "Validity ..."). */
export function splitNumber(text: string): { number: string; title: string } {
	const match = NUMBERED.exec(text);
	return match ? { number: match[1] ?? '', title: match[2] ?? '' } : { number: '', title: text };
}

export function parseSpec(markdown: string, ctx: LinkContext): SpecDocument {
	const slug = createSlugger();
	const blocks = convertBlocks(Lexer.lex(markdown, { gfm: true }), ctx, slug);
	const titleIndex = blocks.findIndex((b) => b.type === 'heading' && b.depth === 1);
	const title = titleIndex >= 0 ? (blocks[titleIndex] as Extract<Block, { type: 'heading' }>).text : '';
	const body = titleIndex >= 0 ? blocks.filter((_, i) => i !== titleIndex) : blocks;
	return { title, blocks: body, toc: tableOfContents(body) };
}

export function tableOfContents(blocks: Block[]): TocEntry[] {
	const toc: TocEntry[] = [];
	for (const b of blocks) {
		if (b.type !== 'heading' || b.depth < 2 || b.depth > 3) continue;
		toc.push({ id: b.id, depth: b.depth, number: b.number, text: plainText(b.title) });
	}
	return toc;
}

function convertBlocks(tokens: Token[], ctx: LinkContext, slug: (text: string) => string): Block[] {
	const out: Block[] = [];
	for (const token of tokens) {
		const block = convertBlock(token as Tokens.Generic, ctx, slug);
		if (block) out.push(block);
	}
	return out;
}

function convertBlock(token: Tokens.Generic, ctx: LinkContext, slug: (text: string) => string): Block | undefined {
	switch (token.type) {
		case 'heading':
			return heading(token as Tokens.Heading, ctx, slug);
		case 'paragraph':
			return { type: 'paragraph', inline: convertInline(token.tokens, ctx) };
		case 'text':
			// The text of a tight list item.
			return { type: 'paragraph', inline: convertInline(token.tokens ?? [{ type: 'text', raw: token.raw, text: token.text }], ctx), tight: true };
		case 'list': {
			const list = token as Tokens.List;
			const start = typeof list.start === 'number' ? list.start : 1;
			return {
				type: 'list',
				ordered: list.ordered,
				start,
				items: list.items.map((item) => ({ blocks: convertBlocks(item.tokens, ctx, slug) }))
			};
		}
		case 'table':
			return table(token as Tokens.Table, ctx);
		case 'code':
			return { type: 'code', lang: (token.lang as string | undefined)?.split(/\s/)[0] ?? '', text: token.text };
		case 'blockquote':
			return { type: 'blockquote', blocks: convertBlocks(token.tokens ?? [], ctx, slug) };
		case 'hr':
			return { type: 'hr' };
		default:
			// space, html (never rendered as markup), def and unknown tokens.
			return undefined;
	}
}

function heading(token: Tokens.Heading, ctx: LinkContext, slug: (text: string) => string): Block {
	const inline = convertInline(token.tokens, ctx);
	const text = plainText(inline);
	const { number, title } = splitNumber(text);
	// The number is shown on its own, so the title keeps only what follows it.
	const titleInline: Inline[] = number === '' ? inline : stripPrefix(inline, text.length - title.length);
	return { type: 'heading', depth: token.depth, id: slug(text), number, title: titleInline, text };
}

/** Removes the first n characters of plain text from the start of inline nodes. */
function stripPrefix(nodes: Inline[], n: number): Inline[] {
	let rest = n;
	const out: Inline[] = [];
	for (const node of nodes) {
		if (rest > 0 && (node.type === 'text' || node.type === 'keyword' || node.type === 'code')) {
			if (node.text.length <= rest) {
				rest -= node.text.length;
				continue;
			}
			out.push({ ...node, text: node.text.slice(rest) });
			rest = 0;
			continue;
		}
		out.push(node);
	}
	return out;
}

function table(token: Tokens.Table, ctx: LinkContext): Block {
	return {
		type: 'table',
		align: token.align.map((a) => (a ?? null) as Align),
		header: token.header.map((cell) => convertInline(cell.tokens, ctx)),
		rows: token.rows.map((row) => row.map((cell) => convertInline(cell.tokens, ctx)))
	};
}

