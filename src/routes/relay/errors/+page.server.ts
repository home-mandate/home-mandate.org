import { relay } from '#lib/generated/relay.ts';
import { loadRelay, relayErrors } from '#lib/relay/source.server.ts';
import type { PageServerLoad } from './$types';

// https://home-mandate.org/relay/errors/: every problem type of the latest release.
export const load: PageServerLoad = () => ({ errors: relayErrors(loadRelay(relay.latest.tag).document.blocks), tag: relay.latest.tag });
