// The identifier URLs (W9): https://home-mandate.org/<kind>/v0 names a format.
// Browsers get this explanation; software asking for JSON gets the schema
// (content negotiation in the web server).
import { relay } from '#lib/generated/relay.ts';
import { spec } from '#lib/generated/spec.ts';
import type { Block, TextPage } from '../types';

const SITE = 'https://home-mandate.org';

function page(kind: 'mandate' | 'audit' | 'audit_v1' | 'checkpoint' | 'relay_metadata' | 'relay_enrollment', path: string, code: string, cards: Block): TextPage {
	return {
		title: `ident_${kind}_title`,
		intro: `ident_${kind}_intro`,
		metaTitle: `ident_${kind}_meta_title`,
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

export const auditV1Identifier = page(
	'audit_v1',
	'audit/v1',
	`{\n  "type": "${SITE}/audit/v1",\n  "seq": 42,\n  "event": "ct.status",\n  "prev": "sha256:…",\n  …\n}`,
	{
		cards: [
			...schemaCard(spec.identifiers['audit/v1']),
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

// The Relay Specification (home-mandate/relay-spec) names its formats under the same domain.
const relaySpecCard = (anchor: string) => ({
	icon: 'spec' as const,
	title: 'ident_relay_spec_title' as const,
	body: 'ident_relay_spec_body' as const,
	link: 'ident_spec_link' as const,
	href: `/relay/v0/#${anchor}`
});
const relayImplementCard = {
	icon: 'link' as const,
	title: 'ident_relay_implement_title' as const,
	body: 'ident_relay_implement_body' as const,
	link: 'ident_relay_implement_link' as const,
	href: '/implement/relay/'
};

export const relayMetadataIdentifier = page(
	'relay_metadata',
	'relay-metadata/v0',
	`GET https://<operator-domain>/.well-known/home-mandate-relay\n\n{\n  "type": "${SITE}/relay-metadata/v0",\n  "operator_domain": "relay-operator.example",\n  "name_domain": "homes.example.net",\n  "protection_levels": ["standard", "own-domain"],\n  …\n}`,
	{ cards: [...schemaCard(relay.identifiers['relay-metadata/v0']), relaySpecCard('3-operator-metadata'), relayImplementCard] }
);

export const relayEnrollmentIdentifier = page(
	'relay_enrollment',
	'relay-enrollment/v0',
	`// payload of a pairing request (Section 5.2), signed as a JWS\n{\n  "code": "ABCDEFGHIJKLMNOP",\n  "csr": "MH8wMwIBADAAMCowBQYDK2VwAyEA…"\n}`,
	{ cards: [...schemaCard(relay.identifiers['relay-enrollment/v0']), relaySpecCard('51-directory-nonces-and-requests'), relayImplementCard] }
);
