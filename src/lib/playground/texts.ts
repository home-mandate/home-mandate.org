// Texts of the playground in the page's language. The page renders them from the
// language pack (languages/<tag>/pages/playground.json, keys without the "playground_"
// prefix) into a data attribute; placeholders stay as {name} and are filled here.
import type { ParameterInfo } from './vocab.ts';

export type Texts = Readonly<Record<string, string>>;

/** The text of a key with its {placeholders} filled; the key itself if it is missing. */
export function tx(texts: Texts, key: string, vars: Readonly<Record<string, string | number>> = {}): string {
	const template = texts[key] ?? key;
	return template.replace(/\{([a-z_]+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

export function categoryLabel(texts: Texts, category: string): string {
	return texts[`cat_${category}`] ?? category;
}

export function actionLabel(texts: Texts, action: string): string {
	return action === '*' ? tx(texts, 'all_actions') : (texts[`act_${action}`] ?? action);
}

export function parameterLabel(texts: Texts, name: string): string {
	return texts[`param_${name}`] ?? name;
}

const UNIT_KEYS: Record<string, string> = {
	percent: 'unit_percent',
	'percent open': 'unit_percent_open',
	'degree Celsius': 'unit_celsius'
};

export function unitLabel(texts: Texts, parameter: Pick<ParameterInfo, 'unit'>): string {
	const key = UNIT_KEYS[parameter.unit];
	return key ? tx(texts, key) : parameter.unit;
}

/** "a, b or c" in the page's language. */
export function joinOr(texts: Texts, items: readonly string[]): string {
	if (items.length <= 1) return items.join('');
	return `${items.slice(0, -1).join(', ')}${tx(texts, 'list_or')}${items[items.length - 1]}`;
}

/** First letter upper case (a sentence that starts with a category label). */
export function capitalize(text: string, locale: string): string {
	return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
