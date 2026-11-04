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
		spec: 'v0.1.1',
		classes: ['evaluator', 'selection', 'audit', 'audit-anchored', 'pdp'],
		guide: '/implementations/home-assistant/',
		conformance: {
			run: 'https://github.com/home-mandate/ha-home-mandate/releases/tag/v0.1.0',
			reports: [
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0/conformance-report-process.json',
					sha256: '03f8a3b7d134893e314f3fc2055e3eb5001afad63f2ab519dc876d9853fe317f'
				},
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0/conformance-report-http.json',
					sha256: '8ed00d2c88dc1e215b233e5bbc9fe1672d42ef56af984123b03f80f437f4b52b'
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
		spec: 'v0.1.1',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec/releases/tag/v0.1.1',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec/releases/download/v0.1.1/conformance-report.json',
					sha256: '21daf68fc39de7b5fe21e32749f41e7bb31de7624a9ecf386a1f4d0576797225'
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
		spec: 'v0.1.1',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec-ts/releases/tag/v0.1.2',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec-ts/releases/download/v0.1.2/conformance-report.json',
					sha256: 'fdd6b4f08e3abb39bed9e325fa5aab39b8074208c9ef1b07df49c12fbf515c0d'
				}
			]
		}
	}
];
