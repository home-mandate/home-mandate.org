// The specification as a small, typed document tree. It is built at build time
// from the marked lexer (src/lib/spec/markdown.ts) and rendered by Svelte
// components; nothing in it is ever inserted as HTML.

export type Inline =
	| { type: 'text'; text: string }
	| { type: 'keyword'; text: string }
	| { type: 'code'; text: string }
	| { type: 'strong'; children: Inline[] }
	| { type: 'em'; children: Inline[] }
	| { type: 'del'; children: Inline[] }
	| { type: 'link'; href: string; external: boolean; children: Inline[] }
	| { type: 'br' };

export interface ListItem {
	blocks: Block[];
}

export type Align = 'left' | 'center' | 'right' | null;

export type Block =
	| { type: 'heading'; depth: number; id: string; number: string; title: Inline[]; text: string }
	/** tight: a list item's text without its own paragraph. */
	| { type: 'paragraph'; inline: Inline[]; tight?: boolean }
	| { type: 'list'; ordered: boolean; start: number; items: ListItem[] }
	| { type: 'table'; align: Align[]; header: Inline[][]; rows: Inline[][][] }
	| { type: 'code'; lang: string; text: string }
	| { type: 'blockquote'; blocks: Block[] }
	| { type: 'hr' };

export interface TocEntry {
	id: string;
	depth: number;
	number: string;
	text: string;
}

export interface SpecDocument {
	/** Text of the first level-1 heading (the page title). */
	title: string;
	/** Everything after the title, in order. */
	blocks: Block[];
	/** Level-2 and level-3 headings for the table of contents. */
	toc: TocEntry[];
}

export interface SpecVersion {
	tag: string;
	latest: boolean;
}

export interface LoadedSpec {
	tag: string;
	/** Date of the release tag (YYYY-MM-DD), when it is known. */
	date?: string;
	document: SpecDocument;
}

export interface LinkContext {
	/** Repository URL without .git, e.g. https://github.com/home-mandate/spec */
	repository: string;
	/** Tag of the imported release; relative links point to files at this tag. */
	tag: string;
	/** Path of the Markdown file inside the repository, e.g. SPEC-v0.md */
	file: string;
}
