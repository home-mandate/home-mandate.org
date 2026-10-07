// Step 2: every rule as a sentence of controls, after the mandate model of SPEC-v0
// sections 3, 4.2 and 4.5. Edits go to ctx.edit as functions on the rule view; the
// document, the JSON and the evaluation follow from there.
import { describeRule, type Language } from '../describe.ts';
import { formatTimeout } from '../explain.ts';
import { DECISIONS, readRule, ruleEntries, WEEKDAYS, type JsonObject, type RuleView } from '../model.ts';
import { actionLabel, categoryLabel, parameterLabel, tx, unitLabel } from '../texts.ts';
import { formatUnit, toUnit } from '../units.ts';
import { actionsOf, CATEGORIES, commonParameters, criticalSomewhere, isCategory } from '../vocab.ts';
import { clear, h, icon, rerender } from './dom.ts';

export interface RulesContext {
	lang: Language;
	agent: string;
	/** Approval of the mandate (used by ask rules without their own). */
	approval: { timeout: string; approvers: string[] };
	/** structural: the controls of the rule change and the list is drawn again. */
	edit(index: number, change: (view: RuleView) => RuleView, structural: boolean): void;
	remove(index: number): void;
}

const ANY = '*any';
const NONE = '*none';
const TIMEOUTS = ['PT30S', 'PT1M', 'PT2M', 'PT5M', 'PT10M', 'PT30M', 'PT1H'];
const DEFAULT_WINDOW = { start: '06:00', end: '22:00' };
const DEFAULT_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];

/** Whether the rule covers an action that is critical (SPEC-v0 section 4, step 5). */
export function coversCritical(view: RuleView): boolean {
	const actions = view.actions.includes('*') ? actionsOf(view.category) : view.actions;
	return actions.some((a) => criticalSomewhere(view.category, a));
}

function warnings(ctx: RulesContext, view: RuleView): HTMLElement[] {
	if (view.decision !== 'allow' || !coversCritical(view)) return [];
	const t = ctx.lang.texts;
	if (view.actions.includes('*')) return [h('p', { class: 'pg-warn' }, icon('warning', 16), tx(t, 'warn_star'))];
	if (!view.allowCritical) return [h('p', { class: 'pg-warn' }, icon('warning', 16), tx(t, 'warn_demoted'))];
	return [h('p', { class: 'pg-warn pg-warn-critical' }, icon('critical', 16), tx(t, 'warn_critical'))];
}

/** The parts of a card that follow from the rule: badge, warnings, the sentence. */
function derived(ctx: RulesContext, view: RuleView): { badge: Node | null; body: HTMLElement } {
	const t = ctx.lang.texts;
	const badge = coversCritical(view) ? h('span', { class: 'pg-critical' }, icon('critical', 13, 2), tx(t, 'critical_badge')) : null;
	const words = describeRule(ctx.lang, ctx.agent, view);
	const body = h(
		'div',
		{ class: 'pg-derived' },
		...warnings(ctx, view),
		h('p', { class: 'pg-words' }, h('span', { class: 'pg-words-label' }, `${tx(t, 'in_words')}: `), words.join(' '))
	);
	return { badge, body };
}

function select(focus: string, label: string, options: [string, string][], value: string, onchange: (v: string) => void, cls = ''): HTMLElement {
	const el = h(
		'select',
		{ 'data-focus': focus, 'aria-label': label, class: cls, onchange: (e) => onchange((e.target as HTMLSelectElement).value) },
		...options.map(([v, text]) => h('option', { value: v, selected: v === value }, text))
	);
	return el;
}

function textField(focus: string, label: string, value: string, oninput: (v: string, el: HTMLInputElement) => void, attrs: Record<string, string> = {}): HTMLElement {
	return h(
		'label',
		{ class: 'pg-inline' },
		h('span', {}, label),
		h('input', {
			type: 'text',
			value,
			'data-focus': focus,
			autocomplete: 'off',
			spellcheck: 'false',
			...attrs,
			oninput: (e) => oninput((e.target as HTMLInputElement).value, e.target as HTMLInputElement)
		})
	);
}

function pill(focus: string, text: string, checked: boolean, onchange: (on: boolean) => void): HTMLElement {
	return h(
		'label',
		{ class: 'pg-pill' },
		h('input', { type: 'checkbox', class: 'visually-hidden', checked, 'data-focus': focus, onchange: (e) => onchange((e.target as HTMLInputElement).checked) }),
		h('span', {}, text)
	);
}

function resourceRow(ctx: RulesContext, i: number, view: RuleView): HTMLElement {
	const t = ctx.lang.texts;
	const scope = view.any ? ANY : (view.category ?? NONE);
	const options: [string, string][] = [[ANY, tx(t, 'any_device')], ...CATEGORIES.map((c): [string, string] => [c, categoryLabel(t, c)])];
	if (view.category !== undefined && !isCategory(view.category)) options.push([view.category, view.category]);
	options.push([NONE, tx(t, 'by_id')]);
	const row = h(
		'div',
		{ class: 'pg-row' },
		select(`${i}:scope`, tx(t, 'field_device'), options, scope, (v) =>
			ctx.edit(i, (r) => (v === ANY ? { ...r, any: true } : { ...r, any: false, category: v === NONE ? undefined : v }), true)
		)
	);
	if (view.any) return row;
	const set = (key: 'area' | 'entityId') => (value: string) =>
		ctx.edit(i, (r) => ({ ...r, [key]: value.trim() === '' ? undefined : value }), false);
	row.append(textField(`${i}:area`, tx(t, 'field_area'), view.area ?? '', set('area'), { placeholder: tx(t, 'field_optional') }));
	if (scope === NONE || view.entityId !== undefined) {
		row.append(textField(`${i}:entity`, tx(t, 'field_entity'), view.entityId ?? '', set('entityId'), { class: 'mono' }));
	}
	return row;
}

function actionsRow(ctx: RulesContext, i: number, view: RuleView): HTMLElement {
	const t = ctx.lang.texts;
	const all = view.actions.includes('*');
	const known = isCategory(view.category) || view.category === undefined ? actionsOf(view.category) : view.actions.filter((a) => a !== '*');
	const toggle = (action: string) => (on: boolean) =>
		ctx.edit(
			i,
			(r) => {
				if (action === '*') return { ...r, actions: on ? ['*'] : [known[0] ?? 'read'] };
				const rest = r.actions.filter((a) => a !== action && a !== '*');
				const next = on ? known.filter((a) => a === action || rest.includes(a)) : rest;
				return next.length === 0 ? r : { ...r, actions: next };
			},
			true
		);
	return h(
		'fieldset',
		{ class: 'pg-row pg-pills' },
		h('legend', { class: 'visually-hidden' }, tx(t, 'field_actions')),
		pill(`${i}:act:*`, tx(t, 'all_actions'), all, toggle('*')),
		...known.map((a) => pill(`${i}:act:${a}`, actionLabel(t, a), !all && view.actions.includes(a), toggle(a)))
	);
}

function timeRow(ctx: RulesContext, i: number, view: RuleView): HTMLElement {
	const t = ctx.lang.texts;
	const row = h(
		'div',
		{ class: 'pg-row' },
		select(
			`${i}:time`,
			tx(t, 'field_time'),
			[
				['any', tx(t, 'time_any')],
				['window', tx(t, 'time_window')]
			],
			view.window ? 'window' : 'any',
			(v) => ctx.edit(i, (r) => ({ ...r, window: v === 'window' ? { ...DEFAULT_WINDOW } : undefined }), true)
		)
	);
	if (view.window) {
		const set = (key: 'start' | 'end') => (e: Event) => {
			const value = (e.target as HTMLInputElement).value;
			if (/^\d{2}:\d{2}$/.test(value)) ctx.edit(i, (r) => ({ ...r, window: { ...(r.window ?? DEFAULT_WINDOW), [key]: value } }), false);
		};
		row.append(
			h('label', { class: 'pg-inline' }, h('span', {}, tx(t, 'field_from')), h('input', { type: 'time', value: view.window.start, 'data-focus': `${i}:start`, oninput: set('start') })),
			h('label', { class: 'pg-inline' }, h('span', {}, tx(t, 'field_to')), h('input', { type: 'time', value: view.window.end, 'data-focus': `${i}:end`, oninput: set('end') }))
		);
	}
	row.append(
		select(
			`${i}:days`,
			tx(t, 'field_days'),
			[
				['all', tx(t, 'days_all')],
				['some', tx(t, 'days_some')]
			],
			view.weekdays ? 'some' : 'all',
			(v) => ctx.edit(i, (r) => ({ ...r, weekdays: v === 'some' ? [...DEFAULT_DAYS] : undefined }), true)
		)
	);
	if (!view.weekdays) return row;
	const days = view.weekdays;
	const toggle = (day: string) => (on: boolean) =>
		ctx.edit(i, (r) => {
			const next = WEEKDAYS.filter((d) => (d === day ? on : (r.weekdays ?? []).includes(d)));
			return next.length === 0 ? r : { ...r, weekdays: next };
		}, true);
	return h(
		'div',
		{ class: 'pg-group' },
		row,
		h(
			'fieldset',
			{ class: 'pg-row pg-pills' },
			h('legend', { class: 'visually-hidden' }, tx(t, 'field_days')),
			...WEEKDAYS.map((d) => pill(`${i}:day:${d}`, tx(t, `day_short_${d}`), days.includes(d), toggle(d)))
		)
	);
}

function limitsRow(ctx: RulesContext, i: number, view: RuleView): HTMLElement | null {
	if (view.decision !== 'allow' || view.actions.includes('*')) return null;
	const { texts: t, locale } = ctx.lang;
	const params = commonParameters(view.category, view.actions);
	if (params.length === 0) return null;
	return h(
		'div',
		{ class: 'pg-group' },
		...params.map((p) => {
			const limits = view.constraints[p.name] ?? {};
			const field = (key: 'min' | 'max') =>
				textField(
					`${i}:${p.name}:${key}`,
					tx(t, key === 'min' ? 'field_min' : 'field_max'),
					limits[key] === undefined ? '' : formatUnit(limits[key], p.scale, locale),
					(value, el) => {
						const n = value.trim() === '' ? undefined : toUnit(value, p.scale);
						const bad = n !== undefined && !Number.isSafeInteger(n);
						el.toggleAttribute('aria-invalid', bad);
						if (bad) return;
						ctx.edit(i, (r) => ({ ...r, constraints: { ...r.constraints, [p.name]: { ...(r.constraints[p.name] ?? {}), [key]: n } } }), false);
					},
					{ inputmode: 'decimal', class: 'pg-num-input' }
				);
			return h('div', { class: 'pg-row' }, h('span', { class: 'pg-param' }, parameterLabel(t, p.name)), field('min'), field('max'), h('span', { class: 'pg-unit' }, unitLabel(t, p)));
		})
	);
}

function decisionRow(ctx: RulesContext, i: number, view: RuleView): HTMLElement {
	const t = ctx.lang.texts;
	const row = h(
		'div',
		{ class: 'pg-row' },
		h('span', { class: 'pg-arrow', 'aria-hidden': 'true' }, '→'),
		select(
			`${i}:decision`,
			tx(t, 'field_decision'),
			DECISIONS.map((d): [string, string] => [d, tx(t, `decision_${d}`)]),
			view.decision,
			(v) => ctx.edit(i, (r) => ({ ...r, decision: v }), true),
			`pg-decision pg-${view.decision}`
		)
	);
	if (view.decision !== 'ask') return row;
	const approvers = view.approval?.approvers.join(', ') ?? '';
	row.append(
		textField(
			`${i}:approvers`,
			tx(t, 'field_approvers'),
			approvers,
			(value) =>
				ctx.edit(i, (r) => {
					const list = value.split(',').map((s) => s.trim()).filter((s) => s !== '');
					if (list.length === 0) return { ...r, approval: undefined };
					return { ...r, approval: { timeout: r.approval?.timeout ?? ctx.approval.timeout, approvers: [...new Set(list)] } };
				}, false),
			{ placeholder: ctx.approval.approvers.join(', '), title: tx(t, 'field_approvers_hint', { approvers: ctx.approval.approvers.join(', ') }) }
		)
	);
	if (view.approval) {
		const current = view.approval.timeout;
		const options = TIMEOUTS.includes(current) ? TIMEOUTS : [current, ...TIMEOUTS];
		row.append(
			h(
				'label',
				{ class: 'pg-inline' },
				h('span', {}, tx(t, 'field_timeout')),
				select(`${i}:timeout`, tx(t, 'field_timeout'), options.map((o): [string, string] => [o, formatTimeout(t, o)]), current, (v) =>
					ctx.edit(i, (r) => ({ ...r, approval: r.approval ? { ...r.approval, timeout: v } : undefined }), true)
				)
			)
		);
	}
	return row;
}

function criticalRow(ctx: RulesContext, i: number, view: RuleView): HTMLElement | null {
	if (view.decision !== 'allow' || view.actions.includes('*')) return null;
	return h(
		'label',
		{ class: 'pg-check' },
		h('input', {
			type: 'checkbox',
			checked: view.allowCritical,
			'data-focus': `${i}:critical`,
			onchange: (e) => ctx.edit(i, (r) => ({ ...r, allowCritical: (e.target as HTMLInputElement).checked }), true)
		}),
		h('span', {}, tx(ctx.lang.texts, 'allow_critical'))
	);
}

function card(ctx: RulesContext, index: number, view: RuleView): HTMLElement {
	const t = ctx.lang.texts;
	const { badge, body } = derived(ctx, view);
	return h(
		'article',
		{ class: 'pg-rule', 'data-index': index, id: `pg-rule-${index}`, tabindex: '-1', 'aria-label': view.id || `#${index + 1}` },
		h(
			'div',
			{ class: 'pg-rule-head' },
			h('code', { class: 'pg-rule-id' }, view.id),
			h('span', { class: 'pg-badge-slot' }, badge),
			h('button', { type: 'button', class: 'pg-icon-btn', 'aria-label': tx(t, 'remove_rule', { id: view.id }), 'data-focus': `${index}:remove`, onclick: () => ctx.remove(index) }, icon('trash', 18))
		),
		h('p', { class: 'pg-subject' }, tx(t, 'rule_subject', { agent: ctx.agent })),
		resourceRow(ctx, index, view),
		actionsRow(ctx, index, view),
		timeRow(ctx, index, view),
		limitsRow(ctx, index, view),
		decisionRow(ctx, index, view),
		criticalRow(ctx, index, view),
		body
	);
}

function empty(ctx: RulesContext): HTMLElement {
	const t = ctx.lang.texts;
	return h('div', { class: 'pg-empty' }, icon('home', 28, 1.6), h('strong', {}, tx(t, 'empty_title')), h('span', {}, tx(t, 'empty_body')));
}

/** Draws all rules again, keeping keyboard focus on the same control. */
export function renderRules(container: HTMLElement, doc: JsonObject | null, ctx: RulesContext): void {
	rerender(container, () => {
		clear(container);
		const entries = ruleEntries(doc);
		if (entries.length === 0) container.append(empty(ctx));
		for (const { index, raw } of entries) container.append(card(ctx, index, readRule(raw)));
	});
}

/** Updates what follows from the rules (after typing in a text field). */
export function refreshRules(container: HTMLElement, doc: JsonObject | null, ctx: RulesContext): void {
	for (const { index, raw } of ruleEntries(doc)) {
		const el = container.querySelector(`[data-index="${index}"]`);
		if (!el) continue;
		const view = readRule(raw);
		const { badge, body } = derived(ctx, view);
		el.querySelector('.pg-badge-slot')?.replaceChildren(...(badge ? [badge] : []));
		el.querySelector('.pg-derived')?.replaceWith(body);
	}
}

