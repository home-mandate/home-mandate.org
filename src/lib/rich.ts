// Inline links in messages: "Read [the spec](/spec/v0/) first." The language
// check (scripts/lib/languages.ts) makes sure translations keep the English
// link targets, so only these few forms can appear.

export type Segment = { text: string } | { text: string; href: string; external: boolean };

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
// Site paths (not //host or /\host, which browsers treat as another site), anchors,
// https and mailto; nothing with control characters or white space.
const SAFE_HREF = /^(\/(?![/\\])|#|https:\/\/|mailto:)[^\s\p{Cc}\\]*$/u;

/** Splits a message into plain text and links. Unsafe targets stay plain text. */
export function segments(message: string): Segment[] {
	const out: Segment[] = [];
	let last = 0;
	for (const match of message.matchAll(LINK)) {
		const [whole, text = '', href = ''] = match;
		const start = match.index ?? 0;
		if (start > last) out.push({ text: message.slice(last, start) });
		if (SAFE_HREF.test(href)) out.push({ text, href, external: href.startsWith('https://') });
		else out.push({ text: whole });
		last = start + whole.length;
	}
	if (last < message.length) out.push({ text: message.slice(last) });
	return out;
}

/** The message without link markup, e.g. for meta descriptions. */
export function plain(message: string): string {
	return segments(message)
		.map((s) => s.text)
		.join('');
}
