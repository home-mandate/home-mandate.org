// Implementations listed on /implementations/ and the home page. Additions come
// as pull requests. Conformance counts as "passed" only with a link to a
// published conformance run; otherwise it is what the project itself declares.

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
	/** Link to a published conformance run; without it the classes are "declared". */
	conformanceRun?: string;
}

export const IMPLEMENTATIONS: Implementation[] = [
	{
		name: 'home-mandate/spec',
		url: 'https://github.com/home-mandate/spec',
		origin: 'Home-Mandate Specification',
		kinds: ['library', 'tool'],
		language: 'Go',
		license: 'Apache-2.0',
		spec: 'v0.1.0-alpha.4',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored']
	},
	{
		name: 'home-mandate/spec-ts',
		url: 'https://github.com/home-mandate/spec-ts',
		origin: 'Home-Mandate Specification',
		kinds: ['library'],
		language: 'TypeScript',
		license: 'Apache-2.0',
		spec: 'v0.1.0-alpha.4',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored']
	}
];
