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
		spec: 'v0.1.0-rc.5',
		classes: ['evaluator', 'selection', 'audit', 'audit-anchored', 'pdp'],
		guide: '/implementations/home-assistant/',
		conformance: {
			run: 'https://github.com/home-mandate/ha-home-mandate/releases/tag/v0.1.0-rc.10',
			reports: [
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.10/conformance-report-process.json',
					sha256: '5ffc3372b3add111aaecd073c71d6bc5aa479b61e9b88760ce841564766fe38f'
				},
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.10/conformance-report-http.json',
					sha256: '3a239e0a7ca0f246e4a3b0b9fa9bedb478e2e8f750309a87f956456587c878e2'
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
		spec: 'v0.1.0-rc.5',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec/releases/tag/v0.1.0-rc.5',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec/releases/download/v0.1.0-rc.5/conformance-report.json',
					sha256: '2b0736cbbe3b8c8f49b6b255697c4ca69eccfaa845ffb882dcd65f8660ada9ea'
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
		spec: 'v0.1.0-rc.4',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec-ts/releases/tag/v0.1.0-rc.4',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec-ts/releases/download/v0.1.0-rc.4/conformance-report.json',
					sha256: '50ceef8ae30c2955b3f561fcd1347b9b35af37614868a30fe7c780f0534fed61'
				}
			]
		}
	}
];
