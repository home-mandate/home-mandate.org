// The normative vocabulary of the imported specification release
// (vocabulary/v0.json, SPEC-v0 section 5), read at build time.
import data from '../../../.generated/static/vocabulary/v0.json';

export interface ActionInfo {
	critical?: boolean;
	parameters?: Record<string, { unit: string; minimum?: number; maximum?: number }>;
}
export interface Vocabulary {
	categories: Record<string, { actions: Record<string, ActionInfo> }>;
}

export const vocabulary: Vocabulary = data as Vocabulary;

export interface CriticalAction {
	category: string;
	action: string;
	/** "category.action", as the specification writes it. */
	id: string;
}

/** Every action the vocabulary marks as critical, in vocabulary order. */
export function criticalActions(vocab: Vocabulary): CriticalAction[] {
	return Object.entries(vocab.categories).flatMap(([category, { actions }]) =>
		Object.entries(actions)
			.filter(([, info]) => info.critical === true)
			.map(([action]) => ({ category, action, id: `${category}.${action}` }))
	);
}

export function categoryCount(vocab: Vocabulary): number {
	return Object.keys(vocab.categories).length;
}
