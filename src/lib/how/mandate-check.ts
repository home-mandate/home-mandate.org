// Structural checks of a v0 mandate that need no JSON Schema validator: the
// rules of schema/mandate-v0.schema.json and SPEC-v0 section 3.1 that the
// example on the "How it works" page relies on. Not a full validator.
import type { Vocabulary } from './vocabulary';

export const MANDATE_TYPE = 'https://home-mandate.org/mandate/v0';
export const REQUIRED = ['type', 'id', 'principal', 'agent', 'rules', 'default', 'approval', 'limits', 'valid_from', 'created_by', 'created_at'] as const;
export const DECISIONS = ['allow', 'ask', 'deny'] as const;
export type Decision = (typeof DECISIONS)[number];

const TIMEOUT = /^PT(?:([0-9]{1,5})H)?(?:([0-9]{1,5})M)?(?:([0-9]{1,5})S)?$/;
const MIN_TIMEOUT_S = 10;
const MAX_TIMEOUT_S = 3600;
const RULE_KEYS = new Set(['id', 'resource', 'actions', 'decision', 'conditions', 'constraints', 'approval', 'allow_critical']);

export interface Rule {
	id: string;
	resource: { any?: true; category?: string; area?: string; entity_id?: string };
	actions: string[];
	decision: Decision;
	conditions?: { time_window?: string; weekdays?: string[] };
	constraints?: Record<string, { min?: number; max?: number }>;
	approval?: Approval;
	allow_critical?: true;
}
export interface Approval {
	timeout: string;
	approvers: string[];
}
export interface Mandate {
	type: string;
	id: string;
	principal: string;
	agent: { client_id: string; display_name: string };
	rules: Rule[];
	default: 'deny';
	approval: Approval;
	limits: { max_actions_per_hour: number };
	valid_from: string;
	created_by: string;
	created_at: string;
}

/** Seconds of a PT[nH][nM][nS] timeout, or undefined if it is not of that form. */
export function timeoutSeconds(value: string): number | undefined {
	const match = TIMEOUT.exec(value);
	if (!match || value === 'PT') return undefined;
	const [, h = '0', m = '0', s = '0'] = match;
	return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

function checkApproval(where: string, approval: Approval): string[] {
	const seconds = timeoutSeconds(approval.timeout);
	const errors: string[] = [];
	if (seconds === undefined || seconds < MIN_TIMEOUT_S || seconds > MAX_TIMEOUT_S) errors.push(`${where}: timeout ${approval.timeout} not between 10 s and 1 h`);
	if (approval.approvers.length === 0) errors.push(`${where}: no approvers`);
	return errors;
}

/** Actions a rule may name: those of its category, or of any category if it names none. */
function knownActions(rule: Rule, vocab: Vocabulary): Set<string> | undefined {
	const category = rule.resource.category;
	if (category === undefined) return new Set(Object.values(vocab.categories).flatMap((c) => Object.keys(c.actions)));
	return category in vocab.categories ? new Set(Object.keys(vocab.categories[category]!.actions)) : undefined;
}

function checkRule(rule: Rule, vocab: Vocabulary): string[] {
	const where = `rule ${rule.id}`;
	const errors = Object.keys(rule)
		.filter((key) => !RULE_KEYS.has(key))
		.map((key) => `${where}: unknown field ${key}`);
	if (!DECISIONS.includes(rule.decision)) errors.push(`${where}: decision ${String(rule.decision)} is not allow, ask or deny`);
	if (rule.resource.any === true && Object.keys(rule.resource).length > 1) errors.push(`${where}: any must stand alone`);
	const category = rule.resource.category;
	if (category !== undefined && !(category in vocab.categories)) errors.push(`${where}: unknown category ${category}`);
	const known = knownActions(rule, vocab);
	if (rule.actions.length === 0) errors.push(`${where}: no actions`);
	for (const action of rule.actions) {
		if (action !== '*' && known && !known.has(action)) errors.push(`${where}: action ${action} not in the vocabulary`);
	}
	const wildcard = rule.actions.includes('*');
	if (rule.approval) {
		if (rule.decision !== 'ask') errors.push(`${where}: approval only with ask`);
		errors.push(...checkApproval(where, rule.approval));
	}
	if (rule.allow_critical && (rule.decision !== 'allow' || wildcard)) errors.push(`${where}: allow_critical only with allow and listed actions`);
	if (rule.constraints) {
		if (rule.decision !== 'allow' || wildcard) errors.push(`${where}: constraints only with allow and listed actions`);
		for (const [name, { min, max }] of Object.entries(rule.constraints)) {
			if (min !== undefined && max !== undefined && min > max) errors.push(`${where}: ${name} min > max`);
			const pool = category === undefined ? Object.values(vocab.categories) : [vocab.categories[category]];
			const everyAction = rule.actions.every((a) => pool.some((c) => c?.actions[a]?.parameters?.[name] !== undefined));
			if (!everyAction) errors.push(`${where}: ${name} is not a parameter of every action`);
		}
	}
	return errors;
}

/** Problems found; an empty list means every check passed. */
export function checkMandate(value: unknown, vocab: Vocabulary): string[] {
	if (value === null || typeof value !== 'object') return ['not an object'];
	const missing = REQUIRED.filter((key) => !(key in value)).map((key) => `missing field ${key}`);
	if (missing.length > 0) return missing;
	const mandate = value as Mandate;
	const errors: string[] = [];
	if (mandate.type !== MANDATE_TYPE) errors.push(`type is not ${MANDATE_TYPE}`);
	if (mandate.default !== 'deny') errors.push('default is not deny');
	errors.push(...checkApproval('approval', mandate.approval));
	const ids = mandate.rules.map((r) => r.id);
	if (new Set(ids).size !== ids.length) errors.push('rule ids are not distinct');
	for (const rule of mandate.rules) errors.push(...checkRule(rule, vocab));
	return errors;
}
