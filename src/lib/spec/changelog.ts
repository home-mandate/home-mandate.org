// The "## Changelog" section of the specification as structured entries.
// Under each "### <version>" the text has groups: a paragraph that names the
// kind ("New:", "Incompatible; ...:", "Clarified ...:") followed by a list.
// A kind is only set when the text names one; nothing is guessed.
import { plainText } from './inline';
import type { Block, Inline, ListItem } from './types';

export type ChangeKind = 'added' | 'changed' | 'fixed' | 'removed' | 'incompatible' | 'clarified';

export interface ChangeGroup {
	kind?: ChangeKind;
	/** The paragraph that introduces the group, without the word naming the kind; absent when nothing else is said ("New:"). */
	intro?: Inline[];
	items: ListItem[];
}

export interface ChangelogEntry {
	/** Heading text as written, e.g. "Unreleased" or "v0.1.0-alpha.1". */
	version: string;
	/** Anchor of the heading in the specification (GitHub slug). */
	id: string;
	unreleased: boolean;
	groups: ChangeGroup[];
}

export interface DatedEntry extends ChangelogEntry {
	/** Date of the release tag, only for imported releases. */
	date?: string;
}

export interface ReleaseNotes {
	/** Tag of the release the changelog was read from. */
	tag: string;
	/** Date of that release tag, if known. */
	date?: string;
	entries: DatedEntry[];
}

const KINDS:[RegExp, ChangeKind][] = [
	[/^(new|added)\b/i, 'added'],
	[/^(incompatible|breaking)\b/i, 'incompatible'],
	[/^clarified\b/i, 'clarified'],
	[/^changed\b/i, 'changed'],
	[/^fixed\b/i, 'fixed'],
	[/^removed\b/i, 'removed']
];

/** Kind named at the start of a group's paragraph, if any. */
export function kindOf(text: string): ChangeKind | undefined {
	const trimmed = text.trim();
	return KINDS.find(([re]) => re.test(trimmed))?.[1];
}

// The word that names the kind and its separator: "Incompatible; ", "New:".
const KIND_WORD = /^\s*\p{L}+[;:,]?\s*/u;

/**
 * The paragraph without the word that names the kind (the badge shows it):
 * "Incompatible; mandates ..." -> "mandates ...". Empty when nothing is left.
 */
export function withoutKindWord(intro: Inline[]): Inline[] {
	const [first, ...rest] = intro;
	if (first?.type !== 'text') return intro;
	const remainder = first.text.replace(KIND_WORD, '');
	return remainder === '' ? rest : [{ type: 'text', text: remainder }, ...rest];
}

/** The blocks of the level-2 "Changelog" section (without its heading). */
export function changelogSection(blocks: Block[]): Block[] {
	const start = blocks.findIndex((b) => b.type === 'heading' && b.depth === 2 && /^changelog$/i.test(b.text.trim()));
	if (start < 0) return [];
	const rest = blocks.slice(start + 1);
	const end = rest.findIndex((b) => b.type === 'heading' && b.depth <= 2);
	return end < 0 ? rest : rest.slice(0, end);
}

export function parseChangelog(blocks: Block[]): ChangelogEntry[] {
	const entries: ChangelogEntry[] = [];
	let pending: Inline[] | undefined;
	for (const block of changelogSection(blocks)) {
		if (block.type === 'heading') {
			if (block.depth !== 3) continue;
			flush();
			entries.push({ version: block.text.trim(), id: block.id, unreleased: /^unreleased$/i.test(block.text.trim()), groups: [] });
			continue;
		}
		const entry = entries[entries.length - 1];
		if (!entry) continue;
		if (block.type === 'paragraph') {
			flush();
			pending = block.inline;
		} else if (block.type === 'list') {
			entry.groups.push(group(pending, block.items));
			pending = undefined;
		}
	}
	flush();
	return entries;

	/** A paragraph without a list after it is a group of its own. */
	function flush(): void {
		const entry = entries[entries.length - 1];
		if (pending && entry) entry.groups.push(group(pending, []));
		pending = undefined;
	}
}

function group(intro: Inline[] | undefined, items: ListItem[]): ChangeGroup {
	if (!intro) return { items };
	const text = plainText(intro);
	const kind = kindOf(text);
	if (!kind) return { items, intro };
	const rest = withoutKindWord(intro);
	return rest.length > 0 ? { kind, intro: rest, items } : { kind, items };
}
