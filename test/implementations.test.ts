import { describe, expect, it } from 'vitest';
import { IMPLEMENTATIONS } from '../src/lib/content/implementations';
import { conformanceRun, isPassed } from '../src/lib/implement/verified';
import { isKindFilter, kindCounts, kindsAttribute, matchesFilter, parseKinds, shownCount, statusText } from '../src/lib/implement/list';

describe('kind filter', () => {
	it('knows the filters', () => {
		expect(isKindFilter('all')).toBe(true);
		expect(isKindFilter('guard')).toBe(true);
		expect(isKindFilter('robot')).toBe(false);
		expect(isKindFilter(undefined)).toBe(false);
	});
	it('shows an entry under every one of its kinds and under all', () => {
		expect(matchesFilter(['library', 'tool'], 'all')).toBe(true);
		expect(matchesFilter(['library', 'tool'], 'tool')).toBe(true);
		expect(matchesFilter(['library', 'tool'], 'guard')).toBe(false);
	});
	it('counts entries per filter', () => {
		const counts = kindCounts([{ kinds: ['library', 'tool'] }, { kinds: ['guard'] }, { kinds: ['library'] }]);
		expect(counts).toEqual({ all: 3, guard: 1, integration: 0, library: 2, tool: 1 });
		expect(shownCount([['library', 'tool'], ['guard']], 'tool')).toBe(1);
		expect(shownCount([['library', 'tool'], ['guard']], 'all')).toBe(2);
	});
	it('round-trips the data-kinds attribute', () => {
		expect(kindsAttribute(['library', 'tool'])).toBe('library tool');
		expect(parseKinds('library tool')).toEqual(['library', 'tool']);
		expect(parseKinds(null)).toEqual([]);
		expect(parseKinds(undefined)).toEqual([]);
	});
	it('fills the status message', () => {
		expect(statusText('{count} of {total} shown', 1, 2)).toBe('1 of 2 shown');
	});
});

describe('implementation list', () => {
	it('has unique names, https links and a release tag as spec version', () => {
		const names = IMPLEMENTATIONS.map((i) => i.name);
		expect(new Set(names).size).toBe(names.length);
		for (const impl of IMPLEMENTATIONS) {
			expect(impl.url).toMatch(/^https:\/\//);
			expect(impl.spec).toMatch(/^v[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$/);
			expect(impl.kinds.length).toBeGreaterThan(0);
			for (const report of impl.conformance?.reports ?? []) {
				expect(report.url).toMatch(/^https:\/\//);
				expect(report.sha256).toMatch(/^[0-9a-f]{64}$/);
			}
			if (impl.conformance !== undefined) expect(impl.conformance.run).toMatch(/^https:\/\//);
		}
	});
});

describe('verified conformance', () => {
	const verified = { a: { run: 'https://r/a', classes: { evaluator: { cases: 3, passed: 3 } } } };
	it('passes only classes a checked report backs', () => {
		expect(isPassed(verified, 'a', 'evaluator')).toBe(true);
		expect(isPassed(verified, 'a', 'pdp')).toBe(false);
		expect(isPassed(verified, 'b', 'evaluator')).toBe(false);
	});
	it('links the run of a checked entry only', () => {
		expect(conformanceRun(verified, 'a')).toBe('https://r/a');
		expect(conformanceRun(verified, 'b')).toBeUndefined();
	});
});
