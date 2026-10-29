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
		spec: 'v0.1.0-rc.4',
		classes: ['evaluator', 'selection', 'audit', 'audit-anchored', 'pdp'],
		guide: '/implementations/home-assistant/',
		conformance: {
			run: 'https://github.com/home-mandate/ha-home-mandate/releases/tag/v0.1.0-rc.9',
			reports: [
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.9/conformance-report-process.json',
					sha256: '10e08ce9aba0879225edb289a54bf805a49c24bae09fd9f180526a7aee3c6bfe'
				},
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.9/conformance-report-http.json',
					sha256: 'a9a56c9c13cbfdd490a8b317be841718846e4200491823790778c15d0533bd29'
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
		spec: 'v0.1.0-rc.4',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec/releases/tag/v0.1.0-rc.4',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec/releases/download/v0.1.0-rc.4/conformance-report.json',
					sha256: '22696f5f40947420c8ad6cb5f70fbb68f596a70e65649ed435fc5f18d1d75af8'
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
