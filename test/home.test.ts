import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARD_ROWS, HOME_MANDATE, implementationRows, rowDecision, typeVersion } from '../src/lib/content/home.ts';
import { IMPLEMENTATIONS, type Implementation } from '../src/lib/content/implementations.ts';
import spec from '../.generated/spec.json' with { type: 'json' };

interface Vocabulary {
	categories: Record<string, { actions: Record<string, { critical?: boolean; parameters?: Record<string, unknown> }> }>;
}

// The vocabulary of the imported specification release (pnpm spec).
const vocabulary: Vocabulary = JSON.parse(
	readFileSync(new URL(`../.spec-cache/${spec.latest.tag}/vocabulary/v0.json`, import.meta.url), 'utf8')
);
const enMessages: Record<string, string> = JSON.parse(
	readFileSync(new URL('../languages/en/pages/home.json', import.meta.url), 'utf8')
);
const rule = (id: string) => HOME_MANDATE.rules.find((r) => r.id === id)!;
const actionsOf = (category: string) => vocabulary.categories[category]?.actions ?? {};

describe('the mandate on the home page card', () => {
	it('is a v0 mandate with default deny', () => {
		expect(HOME_MANDATE.type).toBe('https://mandate-spec.org/mandate/v0');
		expect(HOME_MANDATE.default).toBe('deny');
		expect(typeVersion(HOME_MANDATE.type)).toBe('v0');
	});

	it('uses only categories and actions of the vocabulary', () => {
		for (const r of HOME_MANDATE.rules) {
			const categories = 'category' in r.resource ? [r.resource.category] : Object.keys(vocabulary.categories);
			for (const category of categories) {
				expect(vocabulary.categories[category], `${r.id}: ${category}`).toBeDefined();
			}
			if ('category' in r.resource) {
				for (const action of r.actions) expect(actionsOf(r.resource.category)[action], `${r.id}: ${action}`).toBeDefined();
			}
		}
	});

	it('constrains only allow rules, on parameters of the vocabulary', () => {
		for (const r of HOME_MANDATE.rules.filter((x) => x.constraints)) {
			expect(r.decision).toBe('allow');
			expect(r.actions).not.toContain('*');
			const category = (r.resource as { category: string }).category;
			for (const name of Object.keys(r.constraints!)) {
				expect(r.actions.some((a) => actionsOf(category)[a]?.parameters?.[name])).toBe(true);
			}
		}
	});

	it('limits the temperature to 22 °C (unit 0.01 °C)', () => {
		expect(rule('r-climate').constraints).toEqual({ temperature: { max: 2200 } });
		expect(enMessages.home_card_climate_note).toContain('22 °C');
	});

	it('asks for unlocking with a two-minute approval', () => {
		const locks = rule('r-locks');
		expect(locks.decision).toBe('ask');
		expect(locks.approval?.timeout).toBe('PT2M');
		expect(enMessages.home_card_locks_note).toContain('2 min');
	});

	it('marks as critical exactly what the vocabulary marks as critical', () => {
		expect(actionsOf('alarm').disarm?.critical).toBe(true);
		expect(rule('r-no-disarm').actions).toEqual(['disarm']);
		expect(actionsOf('camera').snapshot?.critical).toBe(true);
		expect(rule('r-no-snapshots').actions).toEqual(['snapshot']);
	});

	it('shows one row per rule plus the default, in rule order', () => {
		expect(CARD_ROWS.map((r) => r.rule)).toEqual([...HOME_MANDATE.rules.map((r) => r.id), 'default']);
		expect(CARD_ROWS.map((r) => rowDecision(HOME_MANDATE, r.rule))).toEqual([
			'allow',
			'allow',
			'allow',
			'ask',
			'deny',
			'deny',
			'deny'
		]);
	});

	it('has a text for every row', () => {
		for (const row of CARD_ROWS) {
			expect(enMessages[row.text]).toBeTruthy();
			expect(enMessages[row.note]).toBeTruthy();
		}
	});

	it('rejects a row that names no rule', () => {
		expect(() => rowDecision(HOME_MANDATE, 'r-missing')).toThrow(/r-missing/);
	});
});

describe('implementationRows', () => {
	const impl = (name: string, extra: Partial<Implementation> = {}): Implementation => ({
		name,
		url: `https://example.org/${name}`,
		origin: 'x',
		kinds: ['library'],
		language: 'Go',
		license: 'Apache-2.0',
		spec: 'v0.2.0-alpha.4',
		classes: ['evaluator'],
		...extra
	});

	it('lists at most three implementations', () => {
		const rows = implementationRows([impl('a'), impl('b'), impl('c'), impl('d')]);
		expect(rows.map((r) => r.name)).toEqual(['a', 'b', 'c']);
	});

	it('joins language, license and spec version', () => {
		expect(implementationRows([impl('a')])[0]?.meta).toBe('Go · Apache-2.0 · v0.2.0-alpha.4');
	});

	it('counts as passed only with a conformance run link', () => {
		const rows = implementationRows([impl('a'), impl('b', { conformanceRun: '' }), impl('c', { conformanceRun: 'https://ci/run/1' })]);
		expect(rows.map((r) => r.passed)).toEqual([false, false, true]);
	});

	it('shows the declared classes of the real list', () => {
		const rows = implementationRows(IMPLEMENTATIONS);
		expect(rows.length).toBe(Math.min(3, IMPLEMENTATIONS.length));
		expect(rows[0]?.classes).toEqual(IMPLEMENTATIONS[0]?.classes);
	});
});
