import { error } from '@sveltejs/kit';
import { relay } from '#lib/generated/relay.ts';
import { loadRelay, relayErrors } from '#lib/relay/source.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// https://home-mandate.org/relay/errors/<name>: the "type" of a Problem Details
// response of an operator (RELAY-v0 Section 5.1) answers with this page.
const errors = () => relayErrors(loadRelay(relay.latest.tag).document.blocks);

export const entries: EntryGenerator = () => errors().map((e) => ({ name: e.name }));

export const load: PageServerLoad = ({ params }) => {
	const all = errors();
	const current = all.find((e) => e.name === params.name);
	if (!current) error(404, 'Unknown error type');
	return { errors: all, current, tag: relay.latest.tag };
};
