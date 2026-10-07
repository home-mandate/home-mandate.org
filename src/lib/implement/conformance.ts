// Conformance classes of SPEC-v0 section 8.1 and the number of cases per class,
// counted from the conformance files of the imported release.

export const CONFORMANCE_CLASSES = ['evaluator', 'selection', 'signatures', 'audit', 'audit-anchored', 'pdp'] as const;
export type SpecClass = (typeof CONFORMANCE_CLASSES)[number];

/** Conformance files a count is taken from, without the "-v0.json" suffix. */
export const CASE_FILES = ['cases', 'invalid', 'digest', 'selection', 'signed', 'succession', 'audit'] as const;
export type CaseFile = (typeof CASE_FILES)[number];

export type CaseFiles = Record<CaseFile, unknown>;

function list(file: unknown, key: 'cases' | 'logs', name: string): Record<string, unknown>[] {
	const items = typeof file === 'object' && file !== null ? (file as Record<string, unknown>)[key] : undefined;
	if (!Array.isArray(items)) throw new Error(`conformance/${name}-v0.json has no "${key}" array`);
	return items as Record<string, unknown>[];
}

/**
 * Cases per class as SPEC-v0 section 8.1 assigns them. pdp has no count of its
 * own: it runs the cases of evaluator and selection whose mandates are valid.
 */
export function caseCounts(files: CaseFiles): Record<Exclude<SpecClass, 'pdp'>, number> {
	const n = (name: Exclude<CaseFile, 'audit'>) => list(files[name], 'cases', name).length;
	const logs = list(files.audit, 'logs', 'audit');
	const anchored = logs.filter((log) => typeof log.keys === 'string').length;
	return {
		evaluator: n('cases') + n('invalid') + n('digest'),
		selection: n('selection'),
		signatures: n('signed') + n('succession'),
		audit: logs.length - anchored,
		'audit-anchored': anchored
	};
}
