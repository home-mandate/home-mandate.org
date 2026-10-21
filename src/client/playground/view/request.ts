// Step 3: the request form. The page renders it; this reads it and keeps the action
// list and the value field in line with the chosen device category. An integer
// parameter is typed in displayed units; a string parameter with permitted values
// (mode) is chosen from a list.
import type { ParameterValue } from '../../../lib/playground/engine.ts';
import { chosenParameter, DAYS, defaultEntityId, defaultParameter, type RequestInput } from '../../../lib/playground/request.ts';
import { actionLabel, parameterLabel, parameterValueLabel, tx, unitLabel, type Texts } from '../../../lib/playground/texts.ts';
import { decimalPlaces, formatUnit, toUnit } from '../../../lib/playground/units.ts';
import { actionsOf, parametersOf } from '../../../lib/playground/vocab.ts';
import { required, setInvalid } from '../../lib/dom.ts';
import { h } from './dom.ts';

export interface RequestForm {
	category: HTMLSelectElement;
	action: HTMLSelectElement;
	day: HTMLSelectElement;
	time: HTMLInputElement;
	/** Shown when the action has a parameter per unit (temperature in °C or °F). */
	unitField: HTMLElement;
	unit: HTMLSelectElement;
	valueField: HTMLElement;
	valueLabel: HTMLElement;
	value: HTMLInputElement;
	/** Shown (and linked with aria-describedby) while the value does not parse. */
	valueError: HTMLElement;
	/** Shown instead of the value field for a string parameter with permitted values. */
	choiceField: HTMLElement;
	choiceLabel: HTMLElement;
	choice: HTMLSelectElement;
	areas: HTMLInputElement;
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
		unitField: required('#pg-req-unit-field'),
		unit: required('#pg-req-unit'),
		valueField: required('#pg-req-value-field'),
		valueLabel: required('#pg-req-value-label'),
		value: required('#pg-req-value'),
		valueError: required('#pg-req-value-error'),
		choiceField: required('#pg-req-choice-field'),
		choiceLabel: required('#pg-req-choice-label'),
		choice: required('#pg-req-choice'),
		areas: required('#pg-req-areas'),
		entity: required('#pg-req-entity'),
		entityHint: required('#pg-req-entity-hint'),
		critical: required('#pg-req-critical')
	};
}

/** The parameter the request carries: the chosen unit's, or the action's only one. */
function parameter(form: RequestForm) {
	return chosenParameter(form.category.value, form.action.value, form.unit.value);
}

/** Offers the units of the action's parameters; hidden when it has fewer than two. */
function syncUnit(form: RequestForm, texts: Texts): void {
	const params = parametersOf(form.category.value, form.action.value);
	const current = form.unit.value;
	form.unitField.hidden = params.length < 2;
	form.unit.replaceChildren(...params.map((p) => h('option', { value: p.name, selected: p.name === current }, unitLabel(texts, p))));
	if (!params.some((p) => p.name === current)) form.unit.value = params[0]?.name ?? '';
}

/** Sets the form to a category and action (from the overview) and updates dependent fields. */
export function setRequest(form: RequestForm, texts: Texts, locale: string, category: string, action: string, values: Record<string, ParameterValue>): void {
	form.category.value = category;
	syncCategory(form, texts, locale, action, values);
}

/** Refills the action list for the category and shows the value field if needed. */
export function syncCategory(form: RequestForm, texts: Texts, locale: string, action: string, values: Record<string, ParameterValue>): void {
	const category = form.category.value;
	const actions = actionsOf(category);
	form.action.replaceChildren(...actions.map((a) => h('option', { value: a, selected: a === action }, actionLabel(texts, a))));
	if (!actions.includes(action)) form.action.value = actions[0] ?? '';
	form.entity.placeholder = defaultEntityId(category);
	form.entityHint.textContent = tx(texts, 'req_entity_hint', { entity: defaultEntityId(category) });
	syncValue(form, texts, locale, values);
}

export function syncValue(form: RequestForm, texts: Texts, locale: string, values: Record<string, ParameterValue>): void {
	syncUnit(form, texts);
	const p = parameter(form);
	const choices = p?.type === 'string' ? p.values : undefined;
	form.valueField.hidden = p === undefined || choices !== undefined;
	form.choiceField.hidden = choices === undefined;
	if (!p) return;
	const value = values[p.name] ?? defaultParameter(form.category.value, form.action.value, p.name);
	if (choices !== undefined) {
		form.choiceLabel.textContent = parameterLabel(texts, p.name);
		form.choice.replaceChildren(...choices.map((v) => h('option', { value: v, selected: v === value }, parameterValueLabel(texts, p.name, v))));
		return;
	}
	if (p.type === 'string') {
		form.valueLabel.textContent = parameterLabel(texts, p.name);
		form.value.value = String(value);
		setInvalid(form.value, false, form.valueError);
		return;
	}
	form.valueLabel.textContent = tx(texts, 'req_value_unit', { param: parameterLabel(texts, p.name), unit: unitLabel(texts, p) });
	form.value.value = typeof value === 'number' ? formatUnit(value, p.scale, locale) : value;
	const places = decimalPlaces(p.scale);
	form.valueError.textContent = places === 0 ? tx(texts, 'req_value_whole') : tx(texts, 'req_value_decimals', { places });
	setInvalid(form.value, false, form.valueError);
}

/** Reads the value field into the per-parameter values (unchanged if it does not parse). */
export function readValue(form: RequestForm, values: Record<string, ParameterValue>): Record<string, ParameterValue> {
	const p = parameter(form);
	if (!p) return values;
	if (p.type === 'string') {
		const text = (p.values === undefined ? form.value.value : form.choice.value).trim();
		return text === '' ? values : { ...values, [p.name]: text };
	}
	const n = toUnit(form.value.value, p.scale);
	// A value with too many decimals stays in the request: the evaluation calls it invalid.
	const next = form.value.value.trim() === '' ? values : { ...values, [p.name]: n };
	setInvalid(form.value, !Number.isSafeInteger(n), form.valueError);
	return next;
}

export function readRequest(form: RequestForm, values: Record<string, ParameterValue>): RequestInput {
	const time = /^\d{2}:\d{2}/.exec(form.time.value)?.[0] ?? '00:00';
	return {
		category: form.category.value,
		action: form.action.value,
		areas: form.areas.value,
		entityId: form.entity.value,
		critical: form.critical.checked,
		day: Math.min(Math.max(Number(form.day.value) || 0, 0), DAYS.length - 1),
		time,
		parameters: values,
		parameter: form.unit.value
	};
}
