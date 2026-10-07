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
	/** mandate-spec version it implements. */
	spec: string;
	classes: ConformanceClass[];
	/** Link to a published conformance run; without it the classes are "declared". */
	conformanceRun?: string;
}

export const IMPLEMENTATIONS: Implementation[] = [
	{
		name: 'mandate-spec',
		url: 'https://github.com/mandate-spec/mandate-spec',
		origin: 'mandate-spec',
		kinds: ['library', 'tool'],
		language: 'Go',
		license: 'Apache-2.0',
		spec: 'v0.2.0-alpha.5',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored']
	},
	{
		name: 'mandate-spec-ts',
		url: 'https://github.com/mandate-spec/mandate-spec-ts',
		origin: 'mandate-spec',
		kinds: ['library'],
		language: 'TypeScript',
		license: 'Apache-2.0',
		spec: 'v0.2.0-alpha.5',
		classes: ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored']
	}
];
