import { describe, expect, it } from 'vitest';
import { checkDigest, checkReportUrl, parseReport, passedClasses, type Report } from '../scripts/lib/conformance.ts';
import { sha256 } from '../scripts/lib/spec.ts';

const MANIFEST = 'a'.repeat(64);
const OTHER = 'b'.repeat(64);
const ok = (cases: number) => ({ cases, passed: cases, failed: 0, skipped: 0, conforms: true });
const report = (classes: Report['classes'], manifest = MANIFEST): Report => ({ manifest, binding: 'process', classes });
const bytes = (value: unknown) => Buffer.from(JSON.stringify(value), 'utf8');

describe('parseReport', () => {
	it('reads the report mandate-conformance writes', () => {
		const data = bytes({ spec: 'v0', manifest: MANIFEST, binding: 'http', implementation: { name: 'x', version: '1' }, classes: { pdp: ok(5) }, failures: [] });
		expect(parseReport(data)).toEqual({ manifest: MANIFEST, binding: 'http', classes: { pdp: ok(5) } });
	});
	it('rejects files that are not such a report', () => {
		expect(() => parseReport(bytes(null))).toThrow(/JSON object/);
		expect(() => parseReport(bytes({ manifest: 'x', binding: 'p', classes: {} }))).toThrow(/manifest/);
		expect(() => parseReport(bytes({ manifest: MANIFEST, classes: {} }))).toThrow(/binding/);
		expect(() => parseReport(bytes({ manifest: MANIFEST, binding: 'p' }))).toThrow(/classes/);
		expect(() => parseReport(bytes({ manifest: MANIFEST, binding: 'p', classes: { pdp: 1 } }))).toThrow(/pdp is not an object/);
		expect(() => parseReport(bytes({ manifest: MANIFEST, binding: 'p', classes: { pdp: { ...ok(1), passed: -1 } } }))).toThrow(/pdp lacks/);
		expect(() => parseReport(bytes({ manifest: MANIFEST, binding: 'p', classes: { pdp: { ...ok(1), conforms: 'yes' } } }))).toThrow(/pdp lacks/);
	});
});

describe('checkReportUrl', () => {
	const project = 'https://github.com/home-mandate/spec-ts';
	it('accepts a report under the project URL', () => {
		expect(checkReportUrl(project, `${project}/releases/download/v1.0.0/conformance-report.json`)).toBeUndefined();
		expect(checkReportUrl(`${project}/`, `${project}/releases/download/v1.0.0/r.json`)).toBeUndefined();
	});
	it('rejects the report of another project', () => {
		expect(checkReportUrl(project, 'https://github.com/home-mandate/spec/releases/download/v1/r.json')).toMatch(/not published under/);
		expect(checkReportUrl(project, `${project}-fork/releases/download/v1/r.json`)).toMatch(/not published under/);
		expect(checkReportUrl('http://example.test/x', 'http://example.test/x/r.json')).toMatch(/not published under/);
	});
});

describe('checkDigest', () => {
	const data = Buffer.from('report', 'utf8');
	it('accepts the pinned bytes', () => {
		expect(checkDigest(data, sha256(data))).toBeUndefined();
	});
	it('names both digests on a mismatch', () => {
		expect(checkDigest(data, OTHER)).toMatch(new RegExp(`${sha256(data)}.*${OTHER}`));
	});
});

describe('passedClasses', () => {
	it('passes the declared classes the reports cover and leaves the rest declared', () => {
		const result = passedClasses(['evaluator', 'selection', 'pdp'], [report({ evaluator: ok(3), signatures: ok(2) }), report({ pdp: ok(4) })], MANIFEST);
		expect(result).toEqual({ classes: { evaluator: { cases: 3, passed: 3 }, pdp: { cases: 4, passed: 4 } }, errors: [] });
	});
	it('rejects a report made with the cases of another version', () => {
		const result = passedClasses(['evaluator'], [report({ evaluator: ok(3) }, OTHER)], MANIFEST);
		expect(result.classes).toEqual({});
		expect(result.errors.join()).toMatch(/report 1 ran the cases of manifest b+/);
	});
	it('rejects a declared class the report does not pass', () => {
		const failing = [
			{ ...ok(3), passed: 2, failed: 1, conforms: false },
			{ ...ok(3), passed: 2, skipped: 1 },
			{ ...ok(3), conforms: false },
			ok(0)
		];
		for (const c of failing) {
			const result = passedClasses(['evaluator'], [report({ evaluator: c })], MANIFEST);
			expect(result.classes).toEqual({});
			expect(result.errors.join()).toMatch(/class evaluator not passed/);
		}
	});
	it('ignores classes the entry does not declare', () => {
		const result = passedClasses(['evaluator'], [report({ evaluator: ok(1), pdp: { ...ok(1), conforms: false } })], MANIFEST);
		expect(result).toEqual({ classes: { evaluator: { cases: 1, passed: 1 } }, errors: [] });
	});
});
