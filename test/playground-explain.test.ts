import { describe, expect, it } from 'vitest';
import { analyse } from '../src/client/playground/analyse.ts';
import { evaluate, MandateError, parseMandate, type Request } from '../src/client/playground/engine.ts';
import { formatTimeout, matchingRules, reasonText, requestIsCritical } from '../src/client/playground/explain.ts';
import { duplicateKeyLine, lineAt, lineOfPointer, syntaxErrorLine } from '../src/client/playground/locate.ts';
import { formatDoc, type JsonObject } from '../src/client/playground/model.ts';
import { explainProblem } from '../src/client/playground/problems.ts';
import { buildRequest, type RequestInput } from '../src/client/playground/request.ts';
import { example, exampleDoc, specText, texts } from './playground-fixtures.ts';

const input: RequestInput = { category: 'lock', action: 'unlock', area: '', entityId: '', critical: false, day: 2, time: '19:00', parameters: {} };
const en = texts('en');
const de = texts('de');

/** The voice assistant example with an edit, formatted as the editor writes it. */
function voiceWith(edit: (doc: JsonObject) => JsonObject): string {
	return formatDoc(edit(exampleDoc('voice-assistant')));
}

describe('matching rules', () => {
	const mandate = parseMandate(example('voice-assistant'));

	it('names the deciding rule and the outvoted ones', () => {
		const request = buildRequest({ ...input, category: 'camera', action: 'read' });
		const result = evaluate(mandate, request);
		expect(matchingRules(mandate, request, result)).toEqual([
			{ id: 'r-read-all', decision: 'allow', role: 'outvoted' },
			{ id: 'r-no-cameras', decision: 'deny', role: 'decides' }
		]);
	});

	it('names rules that miss only because of their limits', () => {
		const text = voiceWith((doc): JsonObject => ({
			...doc,
			rules: [
				{ id: 'warm', resource: { category: 'climate' }, actions: ['set_temperature'], decision: 'allow', constraints: { temperature: { max: 2200 } } },
				{ id: 'also', resource: { category: 'climate' }, actions: ['set_temperature'], decision: 'allow' }
			]
		}));
		const limited = parseMandate(text);
		const hot = buildRequest({ ...input, category: 'climate', action: 'set_temperature', parameters: { temperature: 2500 } });
		expect(matchingRules(limited, hot, evaluate(limited, hot))).toEqual([
			{ id: 'warm', decision: 'allow', role: 'limits' },
			{ id: 'also', decision: 'allow', role: 'decides' }
		]);
		const mild = buildRequest({ ...input, category: 'climate', action: 'set_temperature', parameters: { temperature: 2000 } });
		expect(matchingRules(limited, mild, evaluate(limited, mild)).map((m) => m.role)).toEqual(['decides', 'also']);
	});

	it('has none before the rules are compared', () => {
		const request = buildRequest({ ...input, entityId: 'with space' });
		const result = evaluate(mandate, request);
		expect(result.reason).toBe('invalid_request');
		expect(matchingRules(mandate, request, result)).toEqual([]);
		expect(matchingRules(null, request, evaluate(null, request))).toEqual([]);
	});

	it('knows critical requests', () => {
		expect(requestIsCritical(buildRequest(input))).toBe(true);
		expect(requestIsCritical(buildRequest({ ...input, action: 'lock' }))).toBe(false);
		expect(requestIsCritical(buildRequest({ ...input, action: 'lock', critical: true }))).toBe(true);
	});
});

describe('reason texts', () => {
	// Every reason code of SPEC-v0 section 4.1.
	const table = specText('SPEC-v0.md').match(/^\s*\| `([a-z_]+)` \| (?:deny|ask|allow)/gm) ?? [];
	const codes = table.map((row) => /`([a-z_]+)`/.exec(row)?.[1] ?? '');

	it('has a text for every reason code of the specification in both languages', () => {
		expect(codes).toContain('critical_demotion');
		expect(codes.length).toBe(13);
		for (const t of [en, de]) {
			for (const code of codes) {
				const keys = code === 'rule' ? ['reason_rule_allow', 'reason_rule_ask', 'reason_rule_deny'] : [`reason_${code}`];
				for (const key of keys) expect(t[key], key).toBeTruthy();
			}
		}
	});

	it('fills every placeholder for the results of the conformance cases', () => {
		const cases = (JSON.parse(specText('conformance/cases-v0.json')) as { cases: Record<string, unknown>[] }).cases;
		for (const c of cases) {
			if (typeof c.mandate !== 'string') continue;
			const mandate = analyse(specText(c.mandate)).mandate;
			const request = { resource: c.resource, action: c.action, parameters: c.parameters, time: c.time, timezone: c.timezone, revoked: c.revoked } as Request;
			const result = evaluate(mandate, request);
			for (const t of [en, de]) expect(reasonText(t, result, request, mandate)).not.toMatch(/[{}]/);
		}
	});

	it('explains the main results', () => {
		const mandate = parseMandate(example('voice-assistant'));
		const ask = buildRequest(input);
		expect(reasonText(en, evaluate(mandate, ask), ask, mandate)).toBe('Rule “r-locks” applies: “unlock” for locks needs confirmation by user-1.');
		const deny = buildRequest({ ...input, category: 'alarm', action: 'disarm', area: 'hall' });
		expect(reasonText(de, evaluate(mandate, deny), deny, mandate)).toBe('Regel „r-no-alarm“ greift: „unscharf schalten“ bei Alarmanlage im Bereich „hall“ ist nicht erlaubt.');
		const energy = parseMandate(example('energy-agent'));
		const late = buildRequest({ ...input, category: 'sensor', action: 'read', day: 0 });
		const expired = { ...late, time: '2027-10-01T00:00:00+02:00' };
		expect(reasonText(en, evaluate(energy, expired), expired, energy)).toBe('The mandate expired on 2027-10-01, so everything is denied.');
		const early = { ...late, time: '2026-09-30T23:59:00+02:00' };
		expect(reasonText(en, evaluate(energy, early), early, energy)).toBe('The mandate is only valid from 2026-10-01, so everything is denied.');
	});

	it('explains the critical demotion', () => {
		const text = voiceWith((doc) => ({ ...doc, rules: [{ id: 'open', resource: { category: 'lock' }, actions: ['unlock'], decision: 'allow' }] }));
		const mandate = parseMandate(text);
		const request = buildRequest(input);
		const result = evaluate(mandate, request);
		expect(result).toMatchObject({ decision: 'ask', reason: 'critical_demotion', rule_id: 'open' });
		expect(reasonText(en, result, request, mandate)).toContain('does not carry allow_critical');
	});

	it('formats timeouts', () => {
		expect(formatTimeout(en, 'PT1H')).toBe('1 h');
		expect(formatTimeout(en, 'PT1M30S')).toBe('1 min 30 s');
		expect(formatTimeout(de, 'PT2M')).toBe('2 Min.');
		expect(formatTimeout(en, 'PT')).toBe('PT');
		expect(formatTimeout(en, 'P1D')).toBe('P1D');
	});
});

describe('problems', () => {
	it('accepts the examples', () => {
		for (const name of ['voice-assistant', 'energy-agent', 'shopping-agent'] as const) expect(analyse(example(name)).problem).toBeNull();
	});

	it('reports a syntax error with its line', () => {
		const text = example('voice-assistant').replace('"default": "deny",', '"default": "deny"');
		const { problem, doc, mandate } = analyse(text);
		expect(doc).toBeNull();
		expect(mandate).toBeNull();
		expect(problem).toMatchObject({ key: 'err_syntax', line: 16 });
	});

	it('reports a duplicate key with its line', () => {
		const text = '{\n  "id": "a",\n  "rules": [],\n  "id": "b"\n}';
		expect(analyse(text).problem).toMatchObject({ key: 'err_duplicate_key', vars: { key: 'id' }, line: 4 });
	});

	it('reports a schema violation with line, rule and field', () => {
		const text = voiceWith((doc) => ({ ...doc, rules: [...(doc.rules as JsonObject[]).slice(0, 4), { id: 'cameras', resource: { category: 'camera' }, actions: ['*'], decision: 'never' }] }));
		const { problem } = analyse(text);
		expect(problem).toMatchObject({ key: 'err_wrong_value', vars: { field: 'decision' }, rule: { number: 5, id: 'cameras' } });
		expect(text.split('\n')[(problem?.line ?? 0) - 1]).toContain('"decision": "never"');
	});

	it('reports a missing field', () => {
		const text = voiceWith((doc) => {
			const { approval: _, ...rest } = doc;
			return rest;
		});
		expect(analyse(text).problem).toMatchObject({ key: 'err_missing', vars: { field: 'approval' }, line: 1 });
	});

	it('reports a rule the vocabulary does not allow', () => {
		const text = voiceWith((doc) => ({ ...doc, rules: [{ id: 'x', resource: { category: 'light' }, actions: ['unlock'], decision: 'allow' }] }));
		const { problem } = analyse(text);
		expect(problem).toMatchObject({ key: 'err_action_unknown', vars: { action: 'unlock' }, rule: { number: 1, id: 'x' } });
		expect(text.split('\n')[(problem?.line ?? 0) - 1]?.trim()).toBe('{');
	});

	it('reports duplicate rule ids and other mandate errors', () => {
		const rule = { id: 'x', resource: { any: true }, actions: ['read'], decision: 'allow' };
		const text = voiceWith((doc) => ({ ...doc, rules: [rule, rule] }));
		expect(analyse(text).problem).toMatchObject({ key: 'err_duplicate_rule', rule: { number: 2, id: 'x' } });
		const expires = voiceWith((doc) => ({ ...doc, expires: '2026-01-01T00:00:00Z' }));
		expect(analyse(expires).problem).toMatchObject({ key: 'err_expires' });
		const timeout = voiceWith((doc) => ({ ...doc, approval: { timeout: 'PT2H', approvers: ['a'] } }));
		expect(analyse(timeout).problem).toMatchObject({ key: 'err_timeout' });
	});

	it('keeps the technical message and falls back to a general text', () => {
		expect(explainProblem('', new Error('boom'), null)).toEqual({ key: 'err_other', vars: {}, detail: 'boom' });
		expect(explainProblem('', new MandateError('something new'), null)).toMatchObject({ key: 'err_other', detail: 'something new' });
		expect(explainProblem('{}', new MandateError('rule nope: odd'), {})).toEqual({ key: 'err_other', vars: {}, detail: 'rule nope: odd' });
		expect(explainProblem('[]', new MandateError('violates the schema at /: must be object'), null)).toMatchObject({ key: 'err_wrong_type', line: 1 });
		expect(explainProblem('{}', new MandateError('violates the schema at /x: strange'), {})).toMatchObject({ key: 'err_schema', vars: { field: 'x' } });
	});
});

describe('locating lines', () => {
	const text = '{\n  "a": [\n    1,\n    {"b": "x\\"y"}\n  ],\n  "c": {}, "d": []\n}';

	it('finds values by pointer, or their nearest ancestor', () => {
		expect(lineOfPointer(text, '/a/1/b')).toBe(4);
		expect(lineOfPointer(text, '/a/0')).toBe(3);
		expect(lineOfPointer(text, '/d')).toBe(6);
		expect(lineOfPointer(text, '/a/7')).toBe(2);
		expect(lineOfPointer(text, '')).toBe(1);
		expect(lineOfPointer('{"a": tru', '/a')).toBe(1);
		expect(lineOfPointer('x', '/a')).toBe(1);
	});
	it('finds syntax errors and duplicate keys', () => {
		expect(syntaxErrorLine('{\n"a": 1,\n}')).toBe(3);
		expect(syntaxErrorLine('{}')).toBeUndefined();
		expect(duplicateKeyLine('{"a": {"b": 1}, "b": 2}')).toBeUndefined();
		expect(duplicateKeyLine('{"a": 1,\n"a": 2}')).toBe(2);
		expect(duplicateKeyLine('{"a": ')).toBeUndefined();
		expect(lineAt('a\nb', 99)).toBe(2);
	});
});
