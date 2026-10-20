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
		spec: 'v0.1.0-rc.1',
		classes: ['evaluator', 'selection', 'audit', 'audit-anchored', 'pdp'],
		conformance: {
			run: 'https://github.com/home-mandate/ha-home-mandate/releases/tag/v0.1.0-rc.5',
			reports: [
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.5/conformance-report-process.json',
					sha256: 'e23e5d5b9aceb4c118a8a04978efc3494cadf18624ec78f4ab2498b4fa6c0d74'
				},
				{
					url: 'https://github.com/home-mandate/ha-home-mandate/releases/download/v0.1.0-rc.5/conformance-report-http.json',
					sha256: '1e1303ed303457be011db83ba405b62c814fdd58fea42f0391a5fd2ca9b89ec7'
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
		spec: 'v0.1.0-rc.2',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec/releases/tag/v0.1.0-rc.2',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec/releases/download/v0.1.0-rc.2/conformance-report.json',
					sha256: 'aca233407a65bb3f631ce238725589a3c4b27806fa194f6fe6c068c4e954031d'
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
		spec: 'v0.1.0-rc.1',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored'],
		conformance: {
			run: 'https://github.com/home-mandate/spec-ts/releases/tag/v0.1.0-rc.1',
			reports: [
				{
					url: 'https://github.com/home-mandate/spec-ts/releases/download/v0.1.0-rc.1/conformance-report.json',
					sha256: 'fd2cb4dc71ce40aab6e8d45d8cf051283d0e00c5c3e874ee628bba9363dc1c35'
				}
			]
		}
	}
];
