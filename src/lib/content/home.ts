// Data of the home page. The mandate card in the hero illustrates the mandate
// below; every row names the rule it shows, so the decision on the card is read
// from the mandate and cannot drift from it (test/home.test.ts checks the
// mandate against the vocabulary of the specification).
import type { IconName } from '$lib/icons';
import type { Implementation, ImplementationKind } from './implementations';
import type { K, Tone } from './types';

export interface MandateRule {
	id: string;
	resource: { any: true } | { category: string };
	actions: string[];
	decision: Tone;
	constraints?: Record<string, { min?: number; max?: number }>;
	approval?: { timeout: string; approvers: string[] };
}

export interface Mandate {
	type: string;
	id: string;
	rules: MandateRule[];
	default: 'deny';
}

/** The voice-assistant mandate the hero card shows (format of SPEC-v0.md section 3). */
export const HOME_MANDATE: Mandate = {
	type: 'https://mandate-spec.org/mandate/v0',
	id: 'm-voice-assistant',
	rules: [
		{ id: 'r-read-all', resource: { any: true }, actions: ['read'], decision: 'allow' },
		{ id: 'r-lights', resource: { category: 'light' }, actions: ['turn_on', 'turn_off', 'set'], decision: 'allow' },
		{
			id: 'r-climate',
			resource: { category: 'climate' },
			actions: ['set_temperature'],
			decision: 'allow',
			// 0.01 degree Celsius (vocabulary v0): at most 22 °C.
			constraints: { temperature: { max: 2200 } }
		},
		{
			id: 'r-locks',
			resource: { category: 'lock' },
			actions: ['unlock', 'open'],
			decision: 'ask',
			approval: { timeout: 'PT2M', approvers: ['alex'] }
		},
		{ id: 'r-no-snapshots', resource: { category: 'camera' }, actions: ['snapshot'], decision: 'deny' },
		{ id: 'r-no-disarm', resource: { category: 'alarm' }, actions: ['disarm'], decision: 'deny' }
	],
	default: 'deny'
};

export interface CardRow {
	/** Rule of HOME_MANDATE, or "default" for the mandate's default decision. */
	rule: string;
	icon: IconName;
	text: K;
	note: K;
}

export const CARD_ROWS: CardRow[] = [
	{ rule: 'r-read-all', icon: 'read', text: 'home_card_read', note: 'home_card_read_note' },
	{ rule: 'r-lights', icon: 'light', text: 'home_card_lights', note: 'home_card_lights_note' },
	{ rule: 'r-climate', icon: 'climate', text: 'home_card_climate', note: 'home_card_climate_note' },
	{ rule: 'r-locks', icon: 'lock', text: 'home_card_locks', note: 'home_card_locks_note' },
	{ rule: 'r-no-snapshots', icon: 'camera', text: 'home_card_cameras', note: 'home_card_cameras_note' },
	{ rule: 'r-no-disarm', icon: 'alarm', text: 'home_card_alarm', note: 'home_card_alarm_note' },
	{ rule: 'default', icon: 'other', text: 'home_card_else', note: 'home_card_else_note' }
];

/** Decision a card row shows: that of its rule, or the default of the mandate. */
export function rowDecision(mandate: Mandate, rule: string): Tone {
	if (rule === 'default') return mandate.default;
	const found = mandate.rules.find((r) => r.id === rule);
	if (!found) throw new Error(`card row names unknown rule ${rule}`);
	return found.decision;
}

/** Version label of a mandate type URI, e.g. .../mandate/v0 -> v0. */
export function typeVersion(type: string): string {
	return type.slice(type.lastIndexOf('/') + 1);
}

/** How many implementations the home page lists before "All implementations". */
export const HOME_IMPLEMENTATIONS = 3;

export interface ImplementationRow {
	name: string;
	url: string;
	kinds: ImplementationKind[];
	meta: string;
	classes: string[];
	/** True only with a link to a published conformance run. */
	passed: boolean;
}

/** The first implementations, shaped for the table on the home page. */
export function implementationRows(list: readonly Implementation[], max = HOME_IMPLEMENTATIONS): ImplementationRow[] {
	return list.slice(0, max).map((impl) => ({
		name: impl.name,
		url: impl.url,
		kinds: impl.kinds,
		meta: [impl.language, impl.license, impl.spec].join(' · '),
		classes: impl.classes,
		passed: typeof impl.conformanceRun === 'string' && impl.conformanceRun !== ''
	}));
}
