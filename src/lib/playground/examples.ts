// The mandates to start from: the example files of the specification (passed in by
// the page as their text) and an empty mandate for "build your own".
import type { JsonObject } from './model.ts';

export const EXAMPLE_IDS = ['voice', 'energy', 'shopping', 'build'] as const;
export type ExampleId = (typeof EXAMPLE_IDS)[number];

/** Example files of the specification (examples/<file>.json) by playground id. */
export const EXAMPLE_FILES: Readonly<Record<Exclude<ExampleId, 'build'>, string>> = {
	voice: 'voice-assistant',
	energy: 'energy-agent',
	shopping: 'shopping-agent'
};

/** A valid mandate without rules: everything is denied. */
export function emptyMandate(displayName: string): JsonObject {
	return {
		type: 'https://home-mandate.org/mandate/v0',
		id: 'm-my-agent',
		principal: 'household:my-home',
		agent: { client_id: 'hm-client:my-agent', display_name: displayName },
		rules: [],
		default: 'deny',
		approval: { timeout: 'PT2M', approvers: ['user-1'] },
		limits: { max_actions_per_hour: 60 },
		valid_from: '2026-10-01T00:00:00+02:00',
		created_by: 'user-1',
		created_at: '2026-10-01T09:00:00+02:00'
	};
}

export function isExampleId(value: string): value is ExampleId {
	return (EXAMPLE_IDS as readonly string[]).includes(value);
}
