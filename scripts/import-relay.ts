// Imports the releases of the Relay Specification listed in relay.lock.json,
// the companion specification in home-mandate/relay-spec. It runs after
// scripts/import-spec.ts and adds to .generated/static:
//   <name>/v<N>/<file>.schema.json     every schema under its $id URL (latest release):
//                                      relay-metadata/v0, relay-enrollment/v0, relay-conformance/v0
//   <name>/v<N>/schema.json            the schema of an identifier URL (content negotiation)
// and writes src/lib/generated/relay.ts with the release list, the schemas, the
// version of the core specification it requires and the number of cases per file.
//
// As for the core specification: every release is checked out at its tag, the
// commit must match the lock file and every file must match
// conformance/manifest.json. Nothing is copied by hand.
// Run with: node scripts/import-relay.ts
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { identifierSchemas, isOfficialRepository, publishedFiles, RELAY_REPOSITORY, schemaTarget, sha256, verifyManifest, type Manifest } from './lib/spec.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const CACHE = join(ROOT, '.spec-cache', 'relay');
const ASSETS = join(ROOT, '.generated', 'static');
const TAG = /^v[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$/;
const COMMIT = /^[0-9a-f]{40}$/;
/** Schemas of the Relay Specification live under these names only. */
const RELAY_SCHEMA = /^relay-[a-z0-9-]+\/v[0-9]+\//;

interface Lock {
	repository: string;
	versions: { tag: string; commit: string }[];
}

type RelayManifest = Manifest & { files: { path: string; sha256: string; cases?: number }[] };

function git(args: string[], cwd = ROOT): string {
	return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function checkout(repository: string, tag: string, commit: string): string {
	if (!TAG.test(tag) || !COMMIT.test(commit)) throw new Error(`relay.lock.json: invalid entry ${tag} ${commit}`);
	const dir = join(CACHE, tag);
	if (!existsSync(dir)) {
		git(['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--depth', '1', '--branch', tag, '--', repository, dir]);
	}
	const head = git(['rev-parse', 'HEAD'], dir);
	if (head !== commit) throw new Error(`relay ${tag}: checked out ${head}, relay.lock.json says ${commit}`);
	if (git(['status', '--porcelain'], dir) !== '') throw new Error(`relay ${tag}: .spec-cache/relay/${tag} has local changes`);
	return dir;
}

function readTree(dir: string, sub: string): Map<string, Buffer> {
	const files = new Map<string, Buffer>();
	const base = join(dir, sub);
	if (!existsSync(base)) return files;
	for (const entry of readdirSync(base, { recursive: true, withFileTypes: true })) {
		if (!entry.isFile()) continue;
		const abs = join(entry.parentPath, entry.name);
		files.set(abs.slice(dir.length + 1), readFileSync(abs));
	}
	return files;
}

function write(path: string, data: Buffer | string): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, data);
}

function main(): void {
	const lock = JSON.parse(readFileSync(join(ROOT, 'relay.lock.json'), 'utf8')) as Lock;
	if (!isOfficialRepository(lock.repository, RELAY_REPOSITORY)) {
		throw new Error(`relay.lock.json: repository must be ${RELAY_REPOSITORY}`);
	}
	if (!Array.isArray(lock.versions) || lock.versions.length === 0) throw new Error('relay.lock.json: no versions');
	const latest = lock.versions[lock.versions.length - 1];
	if (!existsSync(ASSETS)) throw new Error('.generated/static is missing: run scripts/import-spec.ts first');
	// Only relay-*/ belongs to this script; an earlier run's files are replaced.
	for (const entry of readdirSync(ASSETS)) {
		if (entry.startsWith('relay-')) rmSync(join(ASSETS, entry), { recursive: true, force: true });
	}

	const schemas: { path: string; sha256: string }[] = [];
	let cases: { file: string; cases: number }[] = [];
	let requires = '';
	for (const { tag, commit } of lock.versions) {
		const dir = checkout(lock.repository, tag, commit);
		const files = new Map([...readTree(dir, 'schema'), ...readTree(dir, 'conformance'), ...readTree(dir, 'examples')]);
		const manifest = JSON.parse(readFileSync(join(dir, 'conformance', 'manifest.json'), 'utf8')) as RelayManifest;
		const errors = verifyManifest(files, manifest);
		if (errors.length > 0) throw new Error(`relay ${tag}:\n  ${errors.join('\n  ')}`);
		if (tag !== latest.tag) continue;

		// "this one requires SPEC-v0 `v0.2.0` or later": the core version the release builds on.
		const text = readFileSync(join(dir, 'RELAY-v0.md'), 'utf8').replace(/\s+/g, ' ');
		const match = /requires SPEC-v0 `(v[0-9]+\.[0-9]+\.[0-9]+)` or later/.exec(text);
		if (!match?.[1]) throw new Error(`relay ${tag}: RELAY-v0.md does not name the version of SPEC-v0 it requires`);
		requires = match[1];

		cases = manifest.files
			.filter((f) => typeof f.cases === 'number' && /^conformance\/[a-z0-9-]+\.json$/.test(f.path))
			.map((f) => ({ file: f.path.slice('conformance/'.length), cases: f.cases as number }));
		for (const path of publishedFiles(manifest)) {
			const data = files.get(path);
			if (data === undefined) throw new Error(`relay ${tag}: ${path} missing`);
			const target = schemaTarget(JSON.parse(data.toString('utf8')) as Record<string, unknown>);
			if (target === undefined) continue;
			if (!RELAY_SCHEMA.test(target)) throw new Error(`relay ${tag}: ${path} claims ${target}, outside relay-*/`);
			if (existsSync(join(ASSETS, target))) throw new Error(`relay ${tag}: ${target} is already taken`);
			write(join(ASSETS, target), data);
			schemas.push({ path: target, sha256: sha256(data) });
		}
	}
	schemas.sort((a, b) => a.path.localeCompare(b.path));
	const identifiers = identifierSchemas(schemas.map((s) => s.path));
	for (const [dir, schema] of identifiers) {
		cpSync(join(ASSETS, schema), join(ASSETS, dir, 'schema.json'));
	}

	const index = {
		repository: lock.repository.replace(/\.git$/, ''),
		latest,
		versions: lock.versions,
		schemas,
		identifiers: Object.fromEntries(identifiers),
		requires,
		cases
	};
	write(join(ROOT, '.generated', 'relay.json'), `${JSON.stringify(index, null, 2)}\n`);
	write(
		join(ROOT, 'src', 'lib', 'generated', 'relay.ts'),
		`// Generated by scripts/import-relay.ts - do not edit.\nexport const relay = ${JSON.stringify(index, null, '\t')} as const;\n`
	);
	console.log(`Relay Specification ${latest.tag}: ${schemas.length} schemas, identifiers ${[...identifiers.keys()].join(', ')}`);
}

main();
