import { describe, expect, it } from 'vitest';
import { parseMandate } from '../src/client/playground/engine.ts';
import {
	addRule,
	agentName,
	fileName,
	formatDoc,
	freeRuleId,
	normalize,
	parseApprovers,
	readRule,
	removeRule,
	ruleEntries,
	rulesOf,
	updateRule,
	writeRule,
	type JsonObject,
	type RuleView
} from '../src/client/playground/model.ts';
import { exampleDoc } from './playground-fixtures.ts';

const EXAMPLES = ['voice-assistant', 'energy-agent', 'shopping-agent'] as const;

/** The editor's output must be a valid mandate of the specification. */
function valid(doc: JsonObject): void {
	expect(() => parseMandate(formatDoc(doc))).not.toThrow();
}

describe('rule view round trip', () => {
	it.each(EXAMPLES)('reads and writes every rule of %s unchanged', (name) => {
		for (const rule of rulesOf(exampleDoc(name))) expect(writeRule(readRule(rule))).toEqual(rule);
	});

	it('reads what it can of a broken rule', () => {
		const view = readRule({ id: 7, resource: 'x', actions: ['read', 3], decision: null, constraints: { a: 1, b: { min: 'x', max: 5 } } });
		expect(view).toMatchObject({ id: '', any: false, actions: ['read'], decision: '', constraints: { b: { max: 5 } } });
	});

	it('writes conditions, constraints, approval and allow_critical', () => {
		const view: RuleView = {
			id: 'r',
			any: false,
			category: 'climate',
			actions: ['set_temperature'],
			decision: 'allow',
			window: { start: '06:00', end: '22:00' },
			weekdays: ['mon'],
			constraints: { temperature: { min: 1600, max: 2300 }, empty: {} },
			allowCritical: true
		};
		expect(writeRule(view)).toEqual({
			id: 'r',
			resource: { category: 'climate' },
			actions: ['set_temperature'],
			decision: 'allow',
			conditions: { time_window: '06:00-22:00', weekdays: ['mon'] },
			constraints: { temperature: { min: 1600, max: 2300 } },
			allow_critical: true
		});
	});
});

describe('normalize', () => {
	const base: RuleView = { id: 'r', any: false, category: 'light', actions: ['read'], decision: 'allow', constraints: {}, allowCritical: false };

	it('drops the resource fields of "any device"', () => {
		const view = normalize({ ...base, any: true, area: 'x', entityId: 'y' });
		expect([view.any, 'category' in view, 'area' in view, 'entityId' in view]).toEqual([true, false, false, false]);
	});
	it('keeps only actions of the category and falls back to its first action', () => {
		expect(normalize({ ...base, category: 'scene', actions: ['turn_on'] }).actions).toEqual(['read']);
		expect(normalize({ ...base, category: 'lock', actions: ['read', 'unlock', 'set'] }).actions).toEqual(['read', 'unlock']);
	});
	it('does not check the actions of an extension category', () => {
		expect(normalize({ ...base, category: 'acme:thing', actions: ['frobnicate'] }).actions).toEqual(['frobnicate']);
	});
	it('reduces "*" to itself and removes allow_critical and constraints with it', () => {
		expect(normalize({ ...base, actions: ['read', '*'], allowCritical: true, constraints: { brightness: { max: 1 } } })).toMatchObject({
			actions: ['*'],
			allowCritical: false,
			constraints: {}
		});
	});
	it('keeps approval only with ask, constraints and allow_critical only with allow', () => {
		const ask = normalize({ ...base, decision: 'ask', approval: { timeout: 'PT2M', approvers: ['a'] }, allowCritical: true });
		expect(ask.approval).toBeDefined();
		expect(ask.allowCritical).toBe(false);
		expect(normalize({ ...base, decision: 'deny', approval: { timeout: 'PT2M', approvers: ['a'] } }).approval).toBeUndefined();
	});
	it('keeps only constraints on parameters every action has', () => {
		const view = { ...base, actions: ['set', 'turn_on'], constraints: { brightness: { max: 50 } } };
		expect(normalize(view).constraints).toEqual({});
		expect(normalize({ ...view, actions: ['set'] }).constraints).toEqual({ brightness: { max: 50 } });
	});
	it('drops an empty weekday list', () => {
		expect(normalize({ ...base, weekdays: [] }).weekdays).toBeUndefined();
	});
});

describe('editing a document', () => {
	it('every edit of the editor yields a valid mandate', () => {
		let doc = exampleDoc('voice-assistant');
		doc = addRule(doc);
		const last = (rulesOf(doc).length ?? 1) - 1;
		valid(doc);
		doc = updateRule(doc, last, (v) => ({ ...v, category: 'climate', actions: ['set_temperature'] }));
		doc = updateRule(doc, last, (v) => ({ ...v, constraints: { temperature: { max: 2300 } } }));
		valid(doc);
		doc = updateRule(doc, last, (v) => ({ ...v, window: { start: '22:00', end: '06:00' }, weekdays: ['sat', 'sun'] }));
		valid(doc);
		doc = updateRule(doc, last, (v) => ({ ...v, decision: 'ask', approval: { timeout: 'PT5M', approvers: parseApprovers('alex, sam') } }));
		valid(doc);
		doc = updateRule(doc, last, (v) => ({ ...v, decision: 'allow', category: 'lock', actions: ['unlock'], allowCritical: true }));
		valid(doc);
		doc = updateRule(doc, last, (v) => ({ ...v, category: undefined, area: 'hall', actions: ['*'] }));
		valid(doc);
		doc = updateRule(doc, last, (v) => ({ ...v, any: true }));
		valid(doc);
		expect(rulesOf(doc)[last]).toMatchObject({ id: 'r-1', resource: { any: true }, actions: ['*'], decision: 'allow' });
		doc = removeRule(doc, last);
		expect(doc).toEqual(exampleDoc('voice-assistant'));
	});

	it('does not change the input document', () => {
		const doc = exampleDoc('energy-agent');
		const copy = structuredClone(doc);
		updateRule(doc, 0, (v) => ({ ...v, decision: 'deny' }));
		addRule(doc);
		removeRule(doc, 0);
		expect(doc).toEqual(copy);
	});

	it('leaves entries that are not objects alone', () => {
		const doc = { rules: ['x', { id: 'a', resource: { any: true }, actions: ['read'], decision: 'allow' }] } as JsonObject;
		expect(updateRule(doc, 0, (v) => v)).toBe(doc);
		expect(ruleEntries(doc).map((e) => e.index)).toEqual([1]);
		expect(updateRule({}, 0, (v) => v)).toEqual({});
		expect(removeRule({}, 0)).toEqual({ rules: [] });
		expect(rulesOf({ rules: 'x' })).toEqual([]);
	});

	it('finds a free rule id', () => {
		expect(freeRuleId({ rules: [{ id: 'r-1' }, { id: 'r-3' }] })).toBe('r-2');
		expect(addRule({}).rules).toEqual([{ id: 'r-1', resource: { category: 'light' }, actions: ['read'], decision: 'allow' }]);
	});
});

describe('helpers', () => {
	it('parses approvers', () => {
		expect(parseApprovers(' a, b ,,a ')).toEqual(['a', 'b']);
	});
	it('names the download after the mandate id', () => {
		expect(fileName(exampleDoc('voice-assistant'))).toBe('m-voice-assistant.mandate.json');
		expect(fileName({ id: '../x' })).toBe('mandate.mandate.json');
		expect(fileName(null)).toBe('mandate.mandate.json');
	});
	it('reads the agent name', () => {
		expect(agentName(exampleDoc('voice-assistant'), 'x')).toBe('Sprachassistent');
		expect(agentName({ agent: { display_name: ' ' } }, 'fallback')).toBe('fallback');
		expect(agentName(null, 'fallback')).toBe('fallback');
	});
	it('formats with two spaces and a final line feed', () => {
		expect(formatDoc({ a: [1] })).toBe('{\n  "a": [\n    1\n  ]\n}\n');
	});
});
