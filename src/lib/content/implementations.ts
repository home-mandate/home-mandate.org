// Implementations listed on /implementations/ and the home page. Additions come
// as pull requests. A conformance class counts as "passed" only if a pinned report
// of mandate-conformance shows it (checked at build time by
// scripts/import-conformance.ts); otherwise it is what the project itself declares.

export type ImplementationKind = 'guard' | 'integration' | 'library' | 'tool';
export type ConformanceClass = 'evaluator' | 'selection' | 'signatures' | 'audit' | 'audit-anchored' | 'pdp';

export interface Implementation {
	name: string;
	url: string;
	/** Who maintains it, shown under the name. */
	origin: string;
	kinds: ImplementationKind[];
	language: string;
	license: string;
	/** Version of the specification it implements. */
	spec: string;
	classes: ConformanceClass[];
	/** Published reports of mandate-conformance; without them the classes are "declared". */
	conformance?: ConformanceEvidence;
	/** Path of a guide on this site for the platform it serves, e.g. /implementations/home-assistant/. */
	guide?: string;
}

export interface ConformanceEvidence {
	/** Where the run is published, e.g. the release the reports are attached to. */
	run: string;
	/** The report files under `url` (https) with their SHA-256; they must have run the cases of `spec`. */
	reports: { url: string; sha256: string }[];
}

export const IMPLEMENTATIONS: Implementation[] = [
	{
		name: 'home-mandate/ha-home-mandate',
		url: 'https://github.com/home-mandate/ha-home-mandate',
		origin: 'Home-Mandate for Home Assistant',
		kinds: ['guard', 'integration'],
		language: 'Go',
		license: 'AGPL-3.0-or-later',
		spec: 'v0.1.0',
		classes: ['evaluator', 'selection', 'audit', 'audit-anchored', 'pdp'],
		guide: '/implementations/home-assistant/',
		conformance: {
			run: 'https://github.com/home-mandate/ha-home-mandate/releases/tag/v0.1.0-rc.11',
			reports: [
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.11/conformance-report-process.json',
					sha256: '53cae8721d2d0e32d7862ae2765a62e2cd8982d0135741b81e06168f0f7d1187'
				},
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.11/conformance-report-http.json',
					sha256: 'e08eeaf9cd14ac19f885f1153de4ee00ac4ed83f76418734c2488ddbcd4b01a7'
				}
			]
		}
	},
	{
		name: 'home-mandate/spec',
		url: 'https://github.com/home-mandate/spec',
		origin: 'Home-Mandate Specification',
		kinds: ['library', 'tool'],
		language: 'Go',
		license: 'Apache-2.0',
		spec: 'v0.1.0',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec/releases/tag/v0.1.0',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec/releases/download/v0.1.0/conformance-report.json',
					sha256: 'e439e2ba0ea71747492364583e226dded1c2ba4ef6ef0fcd2f77415665c71da6'
				}
			]
		}
	},
	{
		name: 'home-mandate/spec-ts',
		url: 'https://github.com/home-mandate/spec-ts',
		origin: 'Home-Mandate Specification',
		kinds: ['library'],
		language: 'TypeScript',
		license: 'Apache-2.0',
		spec: 'v0.1.0',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec-ts/releases/tag/v0.1.0',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec-ts/releases/download/v0.1.0/conformance-report.json',
					sha256: '3836a03d0525c7e7a0274daf81d40c037ba861e0b9897fa55354f0bebde0d0b1'
				}
			]
		}
	}
];
