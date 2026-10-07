// The identifier URLs (W9): https://mandate-spec.org/<kind>/v0 names a format.
// Browsers get this explanation; software asking for JSON gets the schema
// (content negotiation in the web server).
import { spec } from '$lib/generated/spec';
import type { Block, TextPage } from '../types';

const SITE = 'https://mandate-spec.org';

function page(kind: 'mandate' | 'audit' | 'checkpoint', path: string, code: string, cards: Block): TextPage {
	return {
		title: `ident_${kind}_title`,
		intro: `ident_${kind}_intro`,
		eyebrow: `${SITE}/${path}`,
		blocks: [{ code }, cards]
	};
}

const schemaCard = (path: string | undefined) =>
	path ? [{ icon: 'doc' as const, title: 'ident_schema_title' as const, body: 'ident_schema_body' as const, link: 'ident_schema_link' as const, href: `/${path}` }] : [];
const specCard = (anchor: string) => ({
	icon: 'spec' as const,
	title: 'ident_spec_title' as const,
	body: 'ident_spec_body' as const,
	link: 'ident_spec_link' as const,
	href: `/spec/v0/#${anchor}`
});

export const mandateIdentifier = page(
	'mandate',
	'mandate/v0',
	`{\n  "type": "${SITE}/mandate/v0",\n  "id": "m-voice-assistant",\n  "rules": [ … ],\n  "default": "deny",\n  …\n}`,
	{
		cards: [
			...schemaCard(spec.identifiers['mandate/v0']),
			specCard('3-data-model'),
			{ icon: 'play', title: 'ident_play_title', body: 'ident_play_body', link: 'ident_play_link', href: '/playground/' }
		]
	}
);

export const auditIdentifier = page(
	'audit',
	'audit/v0',
	`{\n  "type": "${SITE}/audit/v0",\n  "seq": 1,\n  "event": "decision",\n  "prev": null,\n  …\n}`,
	{
		cards: [
			...schemaCard(spec.identifiers['audit/v0']),
			specCard('91-entries'),
			{ icon: 'link', title: 'ident_how_title', body: 'ident_how_body', link: 'ident_how_link', href: '/how-it-works/' }
		]
	}
);

export const checkpointIdentifier = page(
	'checkpoint',
	'audit-checkpoint/v0',
	`{ "type": "${SITE}/audit-checkpoint/v0",\n  "log_id": "…", "seq": 41, "digest": "sha256:…" }`,
	{ cards: [specCard('95-checkpoints')] }
);
