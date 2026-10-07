// The plain-language view of the example mandate: one row per rule plus the
// default. The decision of every row comes from the JSON itself, so the chips
// cannot drift from the mandate; the sentence is looked up by rule id.
import type { IconName } from '$lib/icons';
import type { K } from '$lib/content/types';
import type { Decision, Mandate } from './mandate-check';

export interface PlainRow {
	/** Rule id, or "default" for the mandate's default decision. */
	id: string;
	text: K;
	icon: IconName;
	decision: Decision;
}

/** Sentence and icon for each rule of src/lib/content/example-mandate.json. */
export const RULE_TEXTS: Record<string, { text: K; icon: IconName }> = {
	'r-read-all': { text: 'how_plain_read_all', icon: 'read' },
	'r-lights': { text: 'how_plain_lights', icon: 'light' },
	'r-climate': { text: 'how_plain_climate', icon: 'climate' },
	'r-locks': { text: 'how_plain_locks', icon: 'lock' },
	'r-no-cameras': { text: 'how_plain_no_cameras', icon: 'camera' },
	'r-no-alarm': { text: 'how_plain_no_alarm', icon: 'alarm' }
};
export const DEFAULT_TEXT: { text: K; icon: IconName } = { text: 'how_plain_default', icon: 'other' };

export function plainRows(mandate: Mandate, texts = RULE_TEXTS): PlainRow[] {
	const rows = mandate.rules.map((rule) => {
		const entry = texts[rule.id];
		if (!entry) throw new Error(`plainRows: no plain-language text for rule ${rule.id}`);
		return { id: rule.id, ...entry, decision: rule.decision };
	});
	return [...rows, { id: 'default', ...DEFAULT_TEXT, decision: mandate.default }];
}
