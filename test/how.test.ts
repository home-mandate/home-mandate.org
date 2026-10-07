import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import example from '../src/lib/content/example-mandate.json';
import { BLOCKS } from '../src/lib/how/blocks.ts';
import { AUDIT_TYPE, brokenAt, buildChain, chain, TAMPERED, tamper } from '../src/lib/how/chain.ts';
import { criticalKey, criticalLabel } from '../src/lib/how/critical.ts';
import { canonical, digest, shortDigest, type Json } from '../src/lib/how/digest.ts';
import { checkMandate, timeoutSeconds, type Mandate } from '../src/lib/how/mandate-check.ts';
import { plainRows, RULE_TEXTS } from '../src/lib/how/plain.ts';
import { categoryCount, criticalActions, vocabulary } from '../src/lib/how/vocabulary.ts';

const SPEC = new URL('../.spec-cache/v0.2.0-alpha.4/', import.meta.url);
const read = (path: string): unknown => JSON.parse(readFileSync(new URL(path, SPEC), 'utf8'));
const texts = (tag: string): Record<string, string> => JSON.parse(readFileSync(new URL(`../languages/${tag}/pages/how.json`, import.meta.url), 'utf8'));
const mandate = example as Mandate;

describe('digest', () => {
	it('canonicalizes with sorted keys and no whitespace', () => {
		expect(canonical({ b: [1, true, null], a: 'ü"' })).toBe('{"a":"ü\\"","b":[1,true,null]}');
		expect(() => canonical(1.5)).toThrow(/safe integers/);
	});

	it('matches the digests of the conformance suite', async () => {
		const mandates = read('conformance/digest-v0.json') as { cases: { mandate?: string; digest: string }[] };
		const d01 = mandates.cases[0]!;
		expect(await digest(read(d01.mandate!) as Json)).toBe(d01.digest);
		const logs = read('conformance/audit-v0.json') as { logs: { entries: Json[]; entry_digests: string[] }[] };
		const a01 = logs.logs[0]!;
		expect(await Promise.all(a01.entries.map((e) => digest(e)))).toEqual(a01.entry_digests);
	});

	it('shortens digests for display', () => {
		expect(shortDigest('sha256:0123456789abcdef')).toBe('0123…cdef');
		expect(shortDigest(null)).toBe('null');
	});
});

describe('example mandate', () => {
	it('passes the structural checks', () => {
		expect(checkMandate(example, vocabulary)).toEqual([]);
	});

	it('is the voice assistant example of the specification with a temperature limit and a named approver', () => {
		const spec = read('examples/voice-assistant.json') as Mandate;
		expect(mandate.rules.map((r) => r.id)).toEqual(spec.rules.map((r) => r.id));
		expect(mandate.rules.map((r) => r.decision)).toEqual(spec.rules.map((r) => r.decision));
		expect(mandate.rules.find((r) => r.id === 'r-climate')?.constraints).toEqual({ temperature: { max: 2200 } });
		expect(mandate.rules.find((r) => r.id === 'r-locks')?.approval).toEqual({ timeout: 'PT2M', approvers: ['alex'] });
	});

	it('reports structural problems', () => {
		const broken = structuredClone(mandate) as unknown as Record<string, unknown> & Mandate;
		broken.type = 'x';
		(broken as { default: string }).default = 'allow';
		broken.approval = { timeout: 'PT5S', approvers: [] };
		broken.rules = [
			{ id: 'a', resource: { any: true, category: 'light' }, actions: ['unlokc'], decision: 'maybe' as 'allow' },
			{ id: 'a', resource: { category: 'toaster' }, actions: [], decision: 'deny', approval: { timeout: 'PT2H', approvers: ['x'] } },
			{ id: 'c', resource: { category: 'light' }, actions: ['*'], decision: 'ask', allow_critical: true, constraints: { brightness: { min: 9, max: 1 } } },
			{ id: 'd', resource: { area: 'x' }, actions: ['turn_on'], decision: 'allow', constraints: { brightness: { max: 50 } } },
			{ id: 'e', resource: { area: 'x' }, actions: ['set'], decision: 'allow', constraints: { brightness: { max: 50 } }, extra: 1 } as never
		];
		expect(checkMandate(broken, vocabulary)).toEqual([
			'type is not https://mandate-spec.org/mandate/v0',
			'default is not deny',
			'approval: timeout PT5S not between 10 s and 1 h',
			'approval: no approvers',
			'rule ids are not distinct',
			'rule a: decision maybe is not allow, ask or deny',
			'rule a: any must stand alone',
			'rule a: action unlokc not in the vocabulary',
			'rule a: unknown category toaster',
			'rule a: no actions',
			'rule a: approval only with ask',
			'rule a: timeout PT2H not between 10 s and 1 h',
			'rule c: allow_critical only with allow and listed actions',
			'rule c: constraints only with allow and listed actions',
			'rule c: brightness min > max',
			'rule c: brightness is not a parameter of every action',
			'rule d: brightness is not a parameter of every action',
			'rule e: unknown field extra'
		]);
	});

	it('names missing fields and rejects non-objects', () => {
		expect(checkMandate(null, vocabulary)).toEqual(['not an object']);
		const { limits: _limits, ...rest } = mandate;
		expect(checkMandate(rest, vocabulary)).toEqual(['missing field limits']);
	});

	it('reads approval timeouts', () => {
		expect(timeoutSeconds('PT2M')).toBe(120);
		expect(timeoutSeconds('PT1H0M10S')).toBe(3610);
		expect(timeoutSeconds('PT')).toBeUndefined();
		expect(timeoutSeconds('2M')).toBeUndefined();
	});
});

describe('plain-language view', () => {
	it('has one row per rule plus the default, with the decisions of the JSON', () => {
		const rows = plainRows(mandate);
		expect(rows.map((r) => r.id)).toEqual([...mandate.rules.map((r) => r.id), 'default']);
		expect(rows.map((r) => r.decision)).toEqual([...mandate.rules.map((r) => r.decision), 'deny']);
	});

	it('has a sentence in every language for every rule', () => {
		for (const tag of ['en', 'de']) {
			for (const row of plainRows(mandate)) expect(texts(tag)[row.text], `${tag} ${row.text}`).toBeTruthy();
		}
		expect(Object.keys(RULE_TEXTS).sort()).toEqual(mandate.rules.map((r) => r.id).sort());
	});

	it('refuses a rule without a sentence', () => {
		expect(() => plainRows({ ...mandate, rules: [{ ...mandate.rules[0]!, id: 'r-new' }] })).toThrow(/r-new/);
	});
});

describe('vocabulary', () => {
	it('lists exactly the critical actions of vocabulary/v0.json', () => {
		expect(criticalActions(vocabulary).map((c) => c.id)).toEqual([
			'gate.open',
			'lock.unlock',
			'lock.open',
			'alarm.disarm',
			'camera.snapshot',
			'scene.activate',
			'script.run',
			'other.set'
		]);
		expect(categoryCount(vocabulary)).toBe(13);
	});

	it('labels every critical action in every language, and falls back to its identifier', () => {
		for (const c of criticalActions(vocabulary)) {
			for (const tag of ['en', 'de']) expect(texts(tag)[criticalKey(c)], `${tag} ${c.id}`).toBeTruthy();
		}
		const c = { category: 'oven', action: 'heat', id: 'oven.heat' };
		expect(criticalLabel(c, () => undefined)).toBe('oven.heat');
		expect(criticalLabel(c, (k) => (k === 'how_crit_oven_heat' ? 'Heat the oven' : undefined))).toBe('Heat the oven');
	});

	it('uses only terms that SPEC-v0 section 2 defines for the building blocks', () => {
		const spec = readFileSync(new URL('SPEC-v0.md', SPEC), 'utf8');
		const section = spec.slice(spec.indexOf('## 2. Terminology'), spec.indexOf('## 3. Data model'));
		const terms = [...section.matchAll(/^- \*\*([^:*]+):\*\*/gm)].map((match) => match[1]!.toLowerCase());
		for (const block of BLOCKS) expect(terms).toContain(block.spec);
	});
});

describe('hash chain', () => {
	it('chains four decision entries with real digests', async () => {
		const view = await buildChain(mandate);
		expect(view.entries).toHaveLength(4);
		expect(view.entries[0]!.prev).toBeNull();
		for (let i = 1; i < 4; i++) expect(view.entries[i]!.prev).toBe(view.entries[i - 1]!.digest);
		expect(view.entries.every((e) => e.linked)).toBe(true);
		expect(view.brokenAt.intact).toBeUndefined();
		const lines = view.jsonl.split('\n').map((l) => JSON.parse(l) as Record<string, Json>);
		expect(await Promise.all(lines.map((l) => digest(l)))).toEqual(view.entries.map((e) => e.digest));
		expect(lines.every((l) => l.type === AUDIT_TYPE && l.event === 'decision')).toBe(true);
	});

	it('logs what the example mandate decides', async () => {
		const view = await buildChain(mandate);
		const lines = view.jsonl.split('\n').map((l) => JSON.parse(l) as { evaluation: { decision: string; rule_id: string }; mandate: { digest: string } });
		const mandateDigest = await digest(mandate as unknown as Json);
		for (const line of lines) {
			expect(mandate.rules.find((r) => r.id === line.evaluation.rule_id)?.decision).toBe(line.evaluation.decision);
			expect(line.mandate.digest).toBe(mandateDigest);
		}
	});

	it('breaks exactly at entry 3 when entry 2 is edited, as the page says', async () => {
		const view = await buildChain(mandate);
		expect(TAMPERED).toBe(1);
		expect(view.brokenAt.changed).toBe(3);
		expect(view.entries.map((e) => e.changed.edited)).toEqual([false, true, false, false]);
		expect(view.entries.map((e) => e.changed.linked)).toEqual([true, true, false, true]);
		expect(view.entries[1]!.changed.decision).toBe('allow');
		expect(view.entries[1]!.changed.digest).not.toBe(view.entries[1]!.digest);
	});

	it('verifies start and sequence', async () => {
		const entries = await chain([{ seq: 1 }, { seq: 2 }, { seq: 4 }]);
		expect(await brokenAt(entries)).toBe(4);
		expect(await brokenAt(await chain([{ seq: 2 }]))).toBe(2);
		expect(await brokenAt([])).toBeUndefined();
		expect(tamper({ seq: 1, prev: null }).result).toEqual({ status: 'executed' });
	});
});
