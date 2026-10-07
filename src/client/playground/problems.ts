// Why a mandate is not valid, in plain language with a line number. parseMandate says
// what is wrong in a technical message (MandateError); this maps the known messages to
// texts of the page and finds the line. The technical message is kept as the detail.
import { MandateError } from './engine.ts';
import { duplicateKeyLine, lineOfPointer, syntaxErrorLine } from './locate.ts';
import { ruleEntries, type JsonObject } from './model.ts';

export interface Problem {
	/** Text key (without "playground_") and its placeholders. */
	key: string;
	vars: Record<string, string>;
	line?: number;
	/** 1-based position of the rule in "rules", and its id. */
	rule?: { number: number; id: string };
	/** The message of the implementation. */
	detail: string;
}

interface Pattern {
	re: RegExp;
	key: string;
	names: string[];
}

// Messages of mandate-spec-ts (src/mandate.ts) that name a rule.
const RULE_MESSAGES: Pattern[] = [
	{ re: /^action (\S+) not in the vocabulary$/, key: 'err_action_unknown', names: ['action'] },
	{ re: /^time window with equal start and end$/, key: 'err_window_equal', names: [] },
	{ re: /^constraint (\S+) has min greater than max$/, key: 'err_min_max', names: ['param'] },
	{ re: /^(\S+) has no parameter (\S+)$/, key: 'err_no_parameter', names: ['action', 'param'] },
	{ re: /^timeout outside 10 s to 1 h$/, key: 'err_timeout', names: [] },
	{ re: /^approver not displayable$/, key: 'err_not_displayable', names: [] }
];

// Messages of the schema validator (Ajv) after "violates the schema at <pointer>: ".
const SCHEMA_MESSAGES: Pattern[] = [
	{ re: /^must have required property '([^']+)'$/, key: 'err_missing', names: ['field'] },
	{ re: /^must NOT have additional properties \(([^)]+)\)$/, key: 'err_unknown_field', names: ['field'] },
	{ re: /^must be equal to one of the allowed values$/, key: 'err_wrong_value', names: [] },
	{ re: /^must be equal to constant$/, key: 'err_wrong_value', names: [] },
	{ re: /^must match pattern/, key: 'err_wrong_format', names: [] },
	{ re: /^must match a schema in anyOf$/, key: 'err_wrong_value', names: [] },
	{ re: /^must be (string|integer|number|boolean|array|object)$/, key: 'err_wrong_type', names: ['type'] },
	{ re: /^must NOT have (fewer|more) than \d+ (items|properties|characters)$/, key: 'err_wrong_size', names: [] },
	{ re: /^must NOT have duplicate items/, key: 'err_duplicate_item', names: [] },
	{ re: /^must match format "date-time"$/, key: 'err_wrong_time', names: [] }
];

function match(patterns: Pattern[], text: string, fallback: string): { key: string; vars: Record<string, string> } {
	for (const p of patterns) {
		const m = p.re.exec(text);
		if (m) return { key: p.key, vars: Object.fromEntries(p.names.map((n, i) => [n, m[i + 1] ?? ''])) };
	}
	return { key: fallback, vars: {} };
}

function ruleByIndex(doc: JsonObject | null, index: number): { number: number; id: string } {
	const entry = ruleEntries(doc).find((e) => e.index === index);
	return { number: index + 1, id: typeof entry?.raw.id === 'string' ? entry.raw.id : '' };
}

function ruleById(doc: JsonObject | null, id: string): { number: number; id: string } | undefined {
	const entry = ruleEntries(doc).find((e) => e.raw.id === id);
	return entry ? { number: entry.index + 1, id } : undefined;
}

/** The field a pointer names, for the message: "/rules/2/resource/category" → "category". */
function fieldOf(pointer: string): string {
	const parts = pointer.split('/').filter((p) => p !== '' && !/^\d+$/.test(p));
	return parts[parts.length - 1] ?? '';
}

function schemaProblem(text: string, doc: JsonObject | null, detail: string, rest: string): Problem {
	const split = /^(\/[^:]*|\/): (.*)$/.exec(rest);
	const pointer = split?.[1] ?? '/';
	const message = split?.[2] ?? rest;
	const { key, vars } = match(SCHEMA_MESSAGES, message, 'err_schema');
	const problem: Problem = { key, vars: { field: fieldOf(pointer), ...vars }, detail };
	const line = lineOfPointer(text, pointer === '/' ? '' : pointer);
	if (line !== undefined) problem.line = line;
	const rule = /^\/rules\/(\d+)/.exec(pointer);
	if (rule) problem.rule = ruleByIndex(doc, Number(rule[1]));
	return problem;
}

function ruleProblem(text: string, doc: JsonObject | null, detail: string, id: string, rest: string): Problem {
	const { key, vars } = match(RULE_MESSAGES, rest, 'err_other');
	const problem: Problem = { key, vars, detail };
	const rule = ruleById(doc, id);
	if (rule) {
		problem.rule = rule;
		const line = lineOfPointer(text, `/rules/${rule.number - 1}`);
		if (line !== undefined) problem.line = line;
	}
	return problem;
}

const MANDATE_MESSAGES: Pattern[] = [
	{ re: /^larger than 256 KiB$/, key: 'err_too_large', names: [] },
	{ re: /^not UTF-8$/, key: 'err_not_text', names: [] },
	{ re: /^duplicate rule id$/, key: 'err_duplicate_rule', names: [] },
	{ re: /^expires must be after valid_from$/, key: 'err_expires', names: [] },
	{ re: /^text not displayable$/, key: 'err_not_displayable', names: [] },
	{ re: /^approval: timeout outside 10 s to 1 h$/, key: 'err_timeout', names: [] },
	{ re: /^approval: approver not displayable$/, key: 'err_not_displayable', names: [] }
];

/** Why the text is not a valid mandate; doc is the text parsed as JSON, if it parses. */
export function explainProblem(text: string, error: unknown, doc: JsonObject | null): Problem {
	const detail = error instanceof Error ? error.message : String(error);
	if (!(error instanceof MandateError)) return { key: 'err_other', vars: {}, detail };
	if (detail.startsWith('not I-JSON: ')) {
		const reason = detail.slice('not I-JSON: '.length);
		const duplicate = /^duplicate key (.+)$/.exec(reason);
		const problem: Problem = duplicate
			? { key: 'err_duplicate_key', vars: { key: JSON.parse(duplicate[1] ?? '""') as string }, detail }
			: { key: 'err_syntax', vars: {}, detail };
		const line = duplicate ? duplicateKeyLine(text) : syntaxErrorLine(text);
		if (line !== undefined) problem.line = line;
		return problem;
	}
	if (detail.startsWith('violates the schema at ')) return schemaProblem(text, doc, detail, detail.slice('violates the schema at '.length));
	const rule = /^rule (\S+): (.*)$/.exec(detail);
	if (rule) return ruleProblem(text, doc, detail, rule[1] ?? '', rule[2] ?? '');
	const { key, vars } = match(MANDATE_MESSAGES, detail, 'err_other');
	const problem: Problem = { key, vars, detail };
	if (key === 'err_duplicate_rule') {
		const ids = ruleEntries(doc).map((e) => e.raw.id);
		const index = ids.findIndex((id, i) => ids.indexOf(id) !== i);
		if (index >= 0) {
			const entry = ruleEntries(doc)[index];
			if (entry) {
				problem.rule = ruleByIndex(doc, entry.index);
				const line = lineOfPointer(text, `/rules/${entry.index}`);
				if (line !== undefined) problem.line = line;
			}
		}
	}
	return problem;
}
