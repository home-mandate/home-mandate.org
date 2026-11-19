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
			run: 'https://github.com/home-mandate/ha-home-mandate/releases/tag/v0.1.2',
			reports: [
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.2/conformance-report-process.json',
					sha256: 'f6b57ca224b530ddce33bf6f1a5520a62a51144d05b2991fc2b6f9553d44c8cc'
				},
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.2/conformance-report-http.json',
					sha256: '9ee581a0ee712c6160168d9bc1894efba6900805bb2ec3e5bff8e9d55dfc046d'
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
		spec: 'v0.2.0',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec/releases/tag/v0.2.0',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec/releases/download/v0.2.0/conformance-report.json',
					sha256: '76cd95ddd943de87edfedf520a8ee14ca5a43d8a07673ccecf3d3fe74e23ca52'
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
		spec: 'v0.2.0',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec-ts/releases/tag/v0.2.0',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec-ts/releases/download/v0.2.0/conformance-report.json',
					sha256: 'fd99f79335346e9a446d00b992a29fd48b26deb5fca67d4f901eedd085e07043'
				}
			]
		}
	}
];
