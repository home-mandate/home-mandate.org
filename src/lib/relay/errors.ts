// The problem types of the Relay Specification as the site shows them: one per
// row of the table of errors in RELAY-v0 Section 5.1, read at build time by
// src/lib/relay/source.server.ts.
import type { Inline } from '#lib/spec/types.ts';

export interface RelayErrorView {
	/** Name after https://home-mandate.org/relay/errors/, e.g. bad-nonce. */
	name: string;
	status: number;
	/** The cells of the table, in English as the specification writes them. */
	meaning: Inline[];
	gateway: Inline[];
}

/** Links to a section of the text (#…) point into /relay/v0/ when shown on another page. */
export function linkToText(nodes: Inline[]): Inline[] {
	return nodes.map((n) => {
		if (n.type === 'link') return { ...n, href: n.href.startsWith('#') ? `/relay/v0/${n.href}` : n.href, children: linkToText(n.children) };
		if (n.type === 'strong' || n.type === 'em' || n.type === 'del') return { ...n, children: linkToText(n.children) };
		return n;
	});
}
