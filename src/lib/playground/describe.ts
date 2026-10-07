// A mandate in plain language: one sentence per rule, as the rule editor shows it under
// each rule and as the page shows the example without JavaScript. Pure functions of
// the rule and the texts, so that the page (at build time) and the browser agree.
import { readRule, type RuleView } from './model.ts';
import type { JsonObject } from './model.ts';
import { actionLabel, capitalize, categoryLabel, joinOr, parameterLabel, tx, unitLabel, type Texts } from './texts.ts';
import { formatUnit } from './units.ts';
import { commonParameters } from './vocab.ts';

export interface Language {
	texts: Texts;
	locale: string;
}

/** What the rule applies to: "lights in area “living”", "the device “x”", "any device". */
export function resourcePhrase(lang: Language, view: RuleView): string {
	const { texts } = lang;
	if (view.any) return tx(texts, 'desc_any');
	const parts: string[] = [];
	if (view.category !== undefined) parts.push(categoryLabel(texts, view.category));
	if (view.entityId !== undefined) {
		parts.push(tx(texts, parts.length > 0 ? 'desc_entity_also' : 'desc_entity', { entity: view.entityId }));
	}
	if (view.area !== undefined) {
		parts.push(tx(texts, parts.length > 0 ? 'desc_area_also' : 'desc_area', { area: view.area }));
	}
	return parts.length > 0 ? parts.join('') : tx(texts, 'desc_nothing');
}

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** " on Mon, Tue" and " between 06:00 and 22:00", in this order. */
export function whenPhrase(lang: Language, view: RuleView): string {
	const { texts } = lang;
	let out = '';
	if (view.weekdays) {
		const days = [...view.weekdays]
			.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
			.map((d) => texts[`day_short_${d}`] ?? d);
		out += tx(texts, 'desc_days', { days: days.join(', ') });
	}
	if (view.window) out += tx(texts, 'desc_window', { start: view.window.start, end: view.window.end });
	return out;
}

/** " (temperature at most 23 °C)" for the constraints of the rule. */
export function limitsPhrase(lang: Language, view: RuleView): string {
	const { texts, locale } = lang;
	const params = commonParameters(view.category, view.actions);
	const parts = Object.entries(view.constraints).map(([name, limits]) => {
		const info = params.find((p) => p.name === name) ?? { name, unit: '', scale: 1 };
		const vars = {
			param: parameterLabel(texts, name),
			unit: unitLabel(texts, info),
			min: limits.min === undefined ? '' : formatUnit(limits.min, info.scale, locale),
			max: limits.max === undefined ? '' : formatUnit(limits.max, info.scale, locale)
		};
		const key = limits.min === undefined ? 'desc_max' : limits.max === undefined ? 'desc_min' : 'desc_min_max';
		return tx(texts, key, vars).trim();
	});
	return parts.length > 0 ? tx(texts, 'desc_limits', { limits: parts.join(', ') }) : '';
}

/** The rule as sentences (the second one only for allow_critical). */
export function describeRule(lang: Language, agent: string, view: RuleView): string[] {
	const { texts, locale } = lang;
	const all = view.actions.includes('*');
	const vars = {
		resource: capitalize(resourcePhrase(lang, view), locale),
		agent,
		actions: joinOr(texts, view.actions.map((a) => actionLabel(texts, a))),
		when: whenPhrase(lang, view),
		limits: limitsPhrase(lang, view),
		who: view.approval?.approvers.length ? tx(texts, 'desc_who', { approvers: view.approval.approvers.join(', ') }) : ''
	};
	const decision = ['allow', 'ask', 'deny'].includes(view.decision) ? view.decision : 'unknown';
	const key = `desc_${decision}${all && decision !== 'unknown' ? '_all' : ''}`;
	const sentences = [tx(texts, key, vars)];
	if (view.allowCritical) sentences.push(tx(texts, 'desc_allow_critical'));
	return sentences;
}

/** Every rule of a mandate document, in document order. */
export function describeMandate(lang: Language, agent: string, rules: readonly JsonObject[]): { id: string; decision: string; sentences: string[] }[] {
	return rules.map((raw) => {
		const view = readRule(raw);
		return { id: view.id, decision: view.decision, sentences: describeRule(lang, agent, view) };
	});
}
