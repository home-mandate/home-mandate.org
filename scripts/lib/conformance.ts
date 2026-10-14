// Pure helpers for checking the conformance reports of the implementations list:
// a report of mandate-conformance is evidence for a class only if it is the file the
// list pins (SHA-256), ran the cases of the specification version the entry names
// (manifest digest) and passed every case of that class.
import { sha256 } from './spec.ts';

export interface ClassResult {
	cases: number;
	passed: number;
	failed: number;
	skipped: number;
	conforms: boolean;
}

export interface Report {
	manifest: string;
	binding: string;
	classes: Record<string, ClassResult>;
}

/** A class backed by a report, with the counts shown on the site. */
export interface PassedClass {
	cases: number;
	passed: number;
}

const HEX64 = /^[0-9a-f]{64}$/;

function isCount(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= 0;
}

function parseClass(name: string, value: unknown): ClassResult {
	const c = value as Record<string, unknown> | null;
	if (typeof c !== 'object' || c === null) throw new Error(`class ${name} is not an object`);
	const { cases, passed, failed, skipped, conforms } = c;
	if (!isCount(cases) || !isCount(passed) || !isCount(failed) || !isCount(skipped) || typeof conforms !== 'boolean') {
		throw new Error(`class ${name} lacks cases, passed, failed, skipped or conforms`);
	}
	return { cases, passed, failed, skipped, conforms };
}

/** Reads a report file; throws if it is not the JSON mandate-conformance writes. */
export function parseReport(data: Buffer): Report {
	const json = JSON.parse(data.toString('utf8')) as Record<string, unknown> | null;
	if (typeof json !== 'object' || json === null) throw new Error('not a JSON object');
	const { manifest, binding, classes } = json;
	if (typeof manifest !== 'string' || !HEX64.test(manifest)) throw new Error('"manifest" is not a SHA-256');
	if (typeof binding !== 'string') throw new Error('"binding" is missing');
	if (typeof classes !== 'object' || classes === null) throw new Error('"classes" is missing');
	const parsed = Object.fromEntries(Object.entries(classes).map(([name, value]) => [name, parseClass(name, value)]));
	return { manifest, binding, classes: parsed };
}

/**
 * A report counts only from the project's own address (e.g. its GitHub releases), so an
 * entry cannot borrow the report of another implementation.
 */
export function checkReportUrl(projectUrl: string, url: string): string | undefined {
	const base = projectUrl.replace(/\/+$/, '') + '/';
	return url.startsWith('https://') && url.startsWith(base) ? undefined : `report is not published under ${base}`;
}

/** The pinned digest must match the downloaded bytes. */
export function checkDigest(data: Buffer, expected: string): string | undefined {
	const actual = sha256(data);
	return actual === expected ? undefined : `SHA-256 is ${actual}, the list pins ${expected}`;
}

function passed(c: ClassResult): boolean {
	return c.conforms && c.cases > 0 && c.passed === c.cases && c.failed === 0 && c.skipped === 0;
}

/**
 * The declared classes the reports show as passed. A declared class a report covers but
 * does not pass, or a report made with the cases of another version, is an error: the
 * entry claims what its evidence contradicts. A declared class no report covers stays
 * declared.
 */
export function passedClasses(
	declared: readonly string[],
	reports: readonly Report[],
	manifest: string
): { classes: Record<string, PassedClass>; errors: string[] } {
	const errors: string[] = [];
	const classes: Record<string, PassedClass> = {};
	for (const [i, report] of reports.entries()) {
		if (report.manifest !== manifest) {
			errors.push(`report ${i + 1} ran the cases of manifest ${report.manifest}, the entry's specification version has ${manifest}`);
			continue;
		}
		for (const name of declared) {
			const c = report.classes[name];
			if (c === undefined) continue;
			if (!passed(c)) {
				errors.push(`report ${i + 1}: class ${name} not passed (${c.passed} of ${c.cases} cases)`);
				continue;
			}
			classes[name] = { cases: c.cases, passed: c.passed };
		}
	}
	return { classes, errors };
}
