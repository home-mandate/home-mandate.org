// Step 3: the request form. The page renders it; this reads it and keeps the action
// list and the value field in line with the chosen device category.
import { DAYS, defaultEntityId, defaultParameter, type RequestInput } from '../request.ts';
import { actionLabel, parameterLabel, tx, unitLabel, type Texts } from '../texts.ts';
import { formatUnit, toUnit } from '../units.ts';
import { actionsOf, parametersOf } from '../vocab.ts';
import { h } from './dom.ts';

export interface RequestForm {
	category: HTMLSelectElement;
	action: HTMLSelectElement;
	day: HTMLSelectElement;
	time: HTMLInputElement;
	valueField: HTMLElement;
	valueLabel: HTMLElement;
	value: HTMLInputElement;
	area: HTMLInputElement;
	entity: HTMLInputElement;
	entityHint: HTMLElement;
	critical: HTMLInputElement;
}

function byId<T extends HTMLElement>(id: string): T {
	const el = document.getElementById(id);
	if (!el) throw new Error(`#${id} is missing`);
	return el as T;
}

export function findForm(): RequestForm {
	return {
		category: byId('pg-req-category'),
		action: byId('pg-req-action'),
		day: byId('pg-req-day'),
		time: byId('pg-req-time'),
		valueField: byId('pg-req-value-field'),
		valueLabel: byId('pg-req-value-label'),
		value: byId('pg-req-value'),
		area: byId('pg-req-area'),
		entity: byId('pg-req-entity'),
		entityHint: byId('pg-req-entity-hint'),
		critical: byId('pg-req-critical')
	};
}

/** The parameter of the chosen action (the vocabulary has at most one per action). */
function parameter(form: RequestForm) {
	return parametersOf(form.category.value, form.action.value)[0];
}

/** Sets the form to a category and action (from the overview) and updates dependent fields. */
export function setRequest(form: RequestForm, texts: Texts, locale: string, category: string, action: string, values: Record<string, number>): void {
	form.category.value = category;
	syncCategory(form, texts, locale, action, values);
}

/** Refills the action list for the category and shows the value field if needed. */
export function syncCategory(form: RequestForm, texts: Texts, locale: string, action: string, values: Record<string, number>): void {
	const category = form.category.value;
	const actions = actionsOf(category);
	form.action.replaceChildren(...actions.map((a) => h('option', { value: a, selected: a === action }, actionLabel(texts, a))));
	if (!actions.includes(action)) form.action.value = actions[0] ?? '';
	form.entity.placeholder = defaultEntityId(category);
	form.entityHint.textContent = tx(texts, 'req_entity_hint', { entity: defaultEntityId(category) });
	syncValue(form, texts, locale, values);
}

export function syncValue(form: RequestForm, texts: Texts, locale: string, values: Record<string, number>): void {
	const p = parameter(form);
	form.valueField.hidden = p === undefined;
	if (!p) return;
	form.valueLabel.textContent = tx(texts, 'req_value_unit', { param: parameterLabel(texts, p.name), unit: unitLabel(texts, p) });
	const value = values[p.name] ?? defaultParameter(form.category.value, form.action.value, p.name);
	form.value.value = formatUnit(value, p.scale, locale);
	form.value.removeAttribute('aria-invalid');
}

/** Reads the value field into the per-parameter values (unchanged if it does not parse). */
export function readValue(form: RequestForm, values: Record<string, number>): Record<string, number> {
	const p = parameter(form);
	if (!p) return values;
	const n = toUnit(form.value.value, p.scale);
	// A value with too many decimals stays in the request: the evaluation calls it invalid.
	const next = form.value.value.trim() === '' ? values : { ...values, [p.name]: n };
	form.value.toggleAttribute('aria-invalid', !Number.isSafeInteger(n));
	return next;
}

export function readRequest(form: RequestForm, values: Record<string, number>): RequestInput {
	const time = /^\d{2}:\d{2}/.exec(form.time.value)?.[0] ?? '00:00';
	return {
		category: form.category.value,
		action: form.action.value,
		area: form.area.value,
		entityId: form.entity.value,
		critical: form.critical.checked,
		day: Math.min(Math.max(Number(form.day.value) || 0, 0), DAYS.length - 1),
		time,
		parameters: values
	};
}
