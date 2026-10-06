// Pure helpers for importing a tagged release of the specification.
import { createHash } from 'node:crypto';

export interface Manifest {
	files: { path: string; sha256: string }[];
}

const SITE = 'https://mandate-spec.org/';
const SCHEMA_PATH = /^[a-z0-9-]+\/v[0-9]+\/[a-z0-9-]+\.schema\.json$/;

export function sha256(data: Buffer): string {
	return createHash('sha256').update(data).digest('hex');
}

/** Every file listed in the manifest must exist with exactly that hash. */
export function verifyManifest(files: Map<string, Buffer>, manifest: Manifest): string[] {
	if (!Array.isArray(manifest?.files)) return ['conformance/manifest.json: malformed manifest'];
	const errors: string[] = [];
	for (const entry of manifest.files) {
		const data = files.get(entry.path);
		if (data === undefined) errors.push(`${entry.path}: listed in the manifest but missing`);
		else if (sha256(data) !== entry.sha256) errors.push(`${entry.path}: SHA-256 differs from the manifest`);
	}
	return errors;
}

/**
 * Site path for a schema with an $id on mandate-spec.org, undefined for files
 * without $id. Anything else under our domain that does not look like
 * <name>/v<N>/<file>.schema.json is an error, never silently skipped.
 */
export function schemaTarget(json: Record<string, unknown>): string | undefined {
	const id = json.$id;
	if (id === undefined) return undefined;
	if (typeof id !== 'string' || !id.startsWith(SITE)) throw new Error(`$id ${String(id)} is not on ${SITE}`);
	const path = id.slice(SITE.length);
	if (!SCHEMA_PATH.test(path)) throw new Error(`$id ${id} does not have the form ${SITE}<name>/v<N>/<file>.schema.json`);
	return path;
}

/** Identifier directories (<name>/v<N>) that contain exactly one schema. */
export function identifierSchemas(paths: string[]): Map<string, string> {
	const byDir = new Map<string, string[]>();
	for (const path of paths) {
		const dir = path.slice(0, path.lastIndexOf('/'));
		byDir.set(dir, [...(byDir.get(dir) ?? []), path]);
	}
	const result = new Map<string, string>();
	for (const [dir, [only, ...rest]] of byDir) {
		if (only !== undefined && rest.length === 0) result.set(dir, only);
	}
	return result;
}
