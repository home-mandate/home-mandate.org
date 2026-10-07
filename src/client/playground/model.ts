// The mandate document the editor works on: the JSON object itself (so that nothing the
// editor does not show is lost), read into a view per rule and written back. Every
// function returns new objects; nothing is changed in place. Validity is not decided
// here but by parseMandate (engine.ts).
import { actionsOf, commonParameters, isCategory } from './vocab.ts';

export type Json = null | boolean | number | string | Json[] | JsonObject;
export interface JsonObject {
	[key: string]: Json;
}

export type DecisionValue = 'allow' | 'ask' | 'deny';
export const DECISIONS: readonly DecisionValue[] = ['allow', 'ask', 'deny'];
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface Limits {
	min?: number;
	max?: number;
}

/** One rule as the editor shows it (SPEC-v0 section 3). */
export interface RuleView {
	id: string;
	/** resource.any */
	any: boolean;
	category?: string;
	area?: string;
	entityId?: string;
	actions: string[];
	decision: string;
	window?: { start: string; end: string };
	weekdays?: string[];
	constraints: Record<string, Limits>;
	approval?: { timeout: string; approvers: string[] };
	allowCritical: boolean;
}

export function isObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const str = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);
const strings = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/** The rules of a document that are objects (anything else cannot be shown). */
export function rulesOf(doc: JsonObject | null): JsonObject[] {
	return ruleEntries(doc).map((e) => e.raw);
}

/** Rules that are objects, with their index in "rules" (what updateRule expects). */
export function ruleEntries(doc: JsonObject | null): { index: number; raw: JsonObject }[] {
	const rules = doc?.rules;
	if (!Array.isArray(rules)) return [];
	return rules.flatMap((raw, index) => (isObject(raw) ? [{ index, raw }] : []));
}

export function agentName(doc: JsonObject | null, fallback: string): string {
	const agent = doc?.agent;
	const name = isObject(agent) ? str(agent.display_name) : undefined;
	return name && name.trim() !== '' ? name : fallback;
}

function readLimits(raw: Json | undefined): Record<string, Limits> {
	if (!isObject(raw)) return {};
	// No prototype: a parameter named "__proto__" stays an ordinary key.
	const out: Record<string, Limits> = Object.create(null) as Record<string, Limits>;
	for (const [name, value] of Object.entries(raw)) {
		if (!isObject(value)) continue;
		const limits: Limits = {};
		if (typeof value.min === 'number') limits.min = value.min;
		if (typeof value.max === 'number') limits.max = value.max;
		out[name] = limits;
	}
	return out;
}

export function readRule(raw: JsonObject): RuleView {
	const resource = isObject(raw.resource) ? raw.resource : {};
	const conditions = isObject(raw.conditions) ? raw.conditions : {};
	const window = str(conditions.time_window);
	const view: RuleView = {
		id: str(raw.id) ?? '',
		any: resource.any === true,
		actions: strings(raw.actions),
		decision: str(raw.decision) ?? '',
		constraints: readLimits(raw.constraints),
		allowCritical: raw.allow_critical === true
	};
	const category = str(resource.category);
	if (category !== undefined) view.category = category;
	const area = str(resource.area);
	if (area !== undefined) view.area = area;
	const entityId = str(resource.entity_id);
	if (entityId !== undefined) view.entityId = entityId;
	if (window !== undefined) view.window = { start: window.slice(0, 5), end: window.slice(6) };
	if (Array.isArray(conditions.weekdays)) view.weekdays = strings(conditions.weekdays);
	if (isObject(raw.approval)) {
		view.approval = { timeout: str(raw.approval.timeout) ?? '', approvers: strings(raw.approval.approvers) };
	}
	return view;
}

/** The rule as JSON, keys in the order of the schema summary (SPEC-v0 section 3). */
export function writeRule(view: RuleView): JsonObject {
	const resource: JsonObject = {};
	if (view.any) resource.any = true;
	else {
		if (view.entityId !== undefined) resource.entity_id = view.entityId;
		if (view.category !== undefined) resource.category = view.category;
		if (view.area !== undefined) resource.area = view.area;
	}
	const rule: JsonObject = { id: view.id, resource, actions: [...view.actions], decision: view.decision };
	const conditions: JsonObject = {};
	if (view.window) conditions.time_window = `${view.window.start}-${view.window.end}`;
	if (view.weekdays) conditions.weekdays = [...view.weekdays];
	if (Object.keys(conditions).length > 0) rule.conditions = conditions;
	const constraints: JsonObject = {};
	for (const [name, limits] of Object.entries(view.constraints)) {
		const value: JsonObject = {};
		if (limits.min !== undefined) value.min = limits.min;
		if (limits.max !== undefined) value.max = limits.max;
		if (Object.keys(value).length > 0) constraints[name] = value;
	}
	if (Object.keys(constraints).length > 0) rule.constraints = constraints;
	if (view.approval) rule.approval = { timeout: view.approval.timeout, approvers: [...view.approval.approvers] };
	if (view.allowCritical) rule.allow_critical = true;
	return rule;
}

/**
 * Keeps a rule consistent with the schema after an edit: approval only with ask,
 * constraints and allow_critical only with allow and listed actions, actions of the
 * category, constraints only on parameters every action has.
 */
export function normalize(view: RuleView): RuleView {
	const next: RuleView = { ...view, actions: [...view.actions], constraints: { ...view.constraints } };
	if (next.any) {
		delete next.category;
		delete next.area;
		delete next.entityId;
	}
	if (next.category === undefined || isCategory(next.category)) {
		const known = actionsOf(next.category);
		next.actions = next.actions.filter((a) => a === '*' || known.includes(a));
		if (next.actions.length === 0) next.actions = [known[0] ?? '*'];
	}
	if (next.actions.includes('*')) next.actions = ['*'];
	if (next.decision !== 'ask') delete next.approval;
	if (next.decision !== 'allow' || next.actions.includes('*')) {
		next.constraints = {};
		next.allowCritical = false;
	}
	if (next.category === undefined || isCategory(next.category)) {
		const allowed = new Set(commonParameters(next.category, next.actions).map((p) => p.name));
		for (const name of Object.keys(next.constraints)) if (!allowed.has(name)) delete next.constraints[name];
	}
	if (next.weekdays?.length === 0) delete next.weekdays;
	return next;
}

function withRules(doc: JsonObject, rules: Json[]): JsonObject {
	return { ...doc, rules };
}

/** Applies an edit to the rule at index (counted among all entries of "rules"). */
export function updateRule(doc: JsonObject, index: number, edit: (view: RuleView) => RuleView): JsonObject {
	const rules = Array.isArray(doc.rules) ? doc.rules : [];
	const raw = rules[index];
	if (!isObject(raw)) return doc;
	return withRules(doc, rules.map((r, i) => (i === index ? writeRule(normalize(edit(readRule(raw)))) : r)));
}

export function removeRule(doc: JsonObject, index: number): JsonObject {
	const rules = Array.isArray(doc.rules) ? doc.rules : [];
	return withRules(doc, rules.filter((_, i) => i !== index));
}

/** A rule id that is not taken yet: r-1, r-2, ... */
export function freeRuleId(doc: JsonObject): string {
	const taken = new Set(rulesOf(doc).map((r) => r.id));
	let n = 1;
	while (taken.has(`r-${n}`)) n += 1;
	return `r-${n}`;
}

export function addRule(doc: JsonObject): JsonObject {
	const rules = Array.isArray(doc.rules) ? doc.rules : [];
	const rule: JsonObject = { id: freeRuleId(doc), resource: { category: 'light' }, actions: ['read'], decision: 'allow' };
	return withRules(doc, [...rules, rule]);
}

/** Text of the approvers field: "a, b" → ["a", "b"]. */
export function parseApprovers(text: string): string[] {
	return [...new Set(text.split(',').map((s) => s.trim()).filter((s) => s !== ''))];
}

/** The document as the JSON editor shows it. */
export function formatDoc(doc: JsonObject): string {
	return `${JSON.stringify(doc, null, 2)}\n`;
}

/** File name for the download: <id>.mandate.json. */
export function fileName(doc: JsonObject | null): string {
	const id = str(doc?.id);
	return `${id && /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : 'mandate'}.mandate.json`;
}
