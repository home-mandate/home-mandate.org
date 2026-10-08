// What the playground offers, read from the vocabulary of the specification (via
// spec-ts): categories, their actions and the parameters of an action.
import { isCritical, vocabulary } from './engine.ts';

/** Categories of the vocabulary, in its order. */
export const CATEGORIES: readonly string[] = Object.freeze(Object.keys(vocabulary));

/** Every action of any category, in the order of first appearance. */
export const ACTIONS: readonly string[] = Object.freeze([
	...new Set(CATEGORIES.flatMap((c) => Object.keys(vocabulary[c]?.actions ?? {})))
]);

export function isCategory(category: string | undefined): category is string {
	return category !== undefined && Object.hasOwn(vocabulary, category);
}

/** Actions of a category; without a category every action of the vocabulary. */
export function actionsOf(category: string | undefined): readonly string[] {
	if (category === undefined) return ACTIONS;
	return isCategory(category) ? Object.keys(vocabulary[category]?.actions ?? {}) : [];
}

export function hasAction(category: string, action: string): boolean {
	return isCategory(category) && Object.hasOwn(vocabulary[category]?.actions ?? {}, action);
}

export interface ParameterInfo {
	name: string;
	/** Unit as the vocabulary writes it, without a scale prefix ("degree Celsius"). */
	unit: string;
	/** Steps per displayed unit: 100 for "0.01 degree Celsius". */
	scale: number;
	minimum?: number;
	maximum?: number;
}

const SCALED = /^(0\.0*1) (.+)$/;

export function parameterInfo(name: string, raw: { unit?: string; minimum?: number; maximum?: number }): ParameterInfo {
	const unit = raw.unit ?? '';
	const scaled = SCALED.exec(unit);
	const info: ParameterInfo = scaled
		? { name, unit: scaled[2] ?? '', scale: Math.round(1 / Number(scaled[1])) }
		: { name, unit, scale: 1 };
	if (raw.minimum !== undefined) info.minimum = raw.minimum;
	if (raw.maximum !== undefined) info.maximum = raw.maximum;
	return info;
}

/** Parameters of an action; without a category those of the action in any category. */
export function parametersOf(category: string | undefined, action: string): ParameterInfo[] {
	const found = new Map<string, ParameterInfo>();
	const categories = category === undefined ? CATEGORIES : isCategory(category) ? [category] : [];
	for (const c of categories) {
		const params = vocabulary[c]?.actions[action]?.parameters ?? {};
		for (const [name, raw] of Object.entries(params)) if (!found.has(name)) found.set(name, parameterInfo(name, raw));
	}
	return [...found.values()];
}

/** Parameters that every listed action has (the only ones a constraint may name). */
export function commonParameters(category: string | undefined, actions: readonly string[]): ParameterInfo[] {
	if (actions.length === 0 || actions.includes('*')) return [];
	const [first, ...rest] = actions.map((a) => parametersOf(category, a));
	return (first ?? []).filter((p) => rest.every((list) => list.some((q) => q.name === p.name)));
}

/** Whether the action is critical in the category, or (without one) in any category. */
export function criticalSomewhere(category: string | undefined, action: string): boolean {
	const categories = category === undefined ? CATEGORIES : [category];
	return categories.some((c) => isCritical({ category: c }, action));
}
