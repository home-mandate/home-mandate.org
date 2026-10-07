// Step 3: the request form. The page renders it; this reads it and keeps the action
// list and the value field in line with the chosen device category.
import { DAYS, defaultEntityId, defaultParameter, type RequestInput } from '../../../lib/playground/request.ts';
import { actionLabel, parameterLabel, tx, unitLabel, type Texts } from '../../../lib/playground/texts.ts';
import { decimalPlaces, formatUnit, toUnit } from '../../../lib/playground/units.ts';
import { actionsOf, parametersOf } from '../../../lib/playground/vocab.ts';
import { required, setInvalid } from '../../lib/dom.ts';
import { h } from './dom.ts';

export interface RequestForm {
	category: HTMLSelectElement;
	action: HTMLSelectElement;
	day: HTMLSelectElement;
	time: HTMLInputElement;
	valueField: HTMLElement;
	valueLabel: HTMLElement;
	value: HTMLInputElement;
	/** Shown (and linked with aria-describedby) while the value does not parse. */
	valueError: HTMLElement;
	area: HTMLInputElement;
	entity: HTMLInputElement;
	entityHint: HTMLElement;
	critical: HTMLInputElement;
}

export function findForm(): RequestForm {
	return {
		category: required('#pg-req-category'),
		action: required('#pg-req-action'),
		day: required('#pg-req-day'),
		time: required('#pg-req-time'),
		valueField: required('#pg-req-value-field'),
		valueLabel: required('#pg-req-value-label'),
		value: required('#pg-req-value'),
		valueError: required('#pg-req-value-error'),
		area: required('#pg-req-area'),
		entity: required('#pg-req-entity'),
		entityHint: required('#pg-req-entity-hint'),
		critical: required('#pg-req-critical')
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
	const places = decimalPlaces(p.scale);
	form.valueError.textContent = places === 0 ? tx(texts, 'req_value_whole') : tx(texts, 'req_value_decimals', { places });
	setInvalid(form.value, false, form.valueError);
}

/** Reads the value field into the per-parameter values (unchanged if it does not parse). */
export function readValue(form: RequestForm, values: Record<string, number>): Record<string, number> {
	const p = parameter(form);
	if (!p) return values;
	const n = toUnit(form.value.value, p.scale);
	// A value with too many decimals stays in the request: the evaluation calls it invalid.
	const next = form.value.value.trim() === '' ? values : { ...values, [p.name]: n };
	setInvalid(form.value, !Number.isSafeInteger(n), form.valueError);
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
