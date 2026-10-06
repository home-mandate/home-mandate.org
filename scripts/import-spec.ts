// Imports the specification releases listed in spec.lock.json and builds the
// static assets of the site in .generated/static (SvelteKit kit.files.assets):
//   static/**                          copied as is (robots.txt, security.txt, ...)
// Only files listed in the release's manifest are published, and only from the
// official repository.
//   <name>/v<N>/<file>.schema.json     every schema under its $id URL (latest release)
//   <name>/v<N>/schema.json            the schema of an identifier URL (content negotiation)
//   vocabulary/v<N>.json               normative vocabulary
//   version.json                       commit of this site (smoke test after deploy)
// and src/lib/generated/spec.ts with the release list for the pages.
//
// Every release is checked out at its tag, the commit must match the lock file
// and every file must match conformance/manifest.json. Nothing is copied by hand.
// Run with: node scripts/import-spec.ts
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { identifierSchemas, isOfficialRepository, OFFICIAL_REPOSITORY, publishedFiles, schemaTarget, sha256, verifyManifest, type Manifest } from './lib/spec.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const CACHE = join(ROOT, '.spec-cache');
const ASSETS = join(ROOT, '.generated', 'static');
const TAG = /^v[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$/;
const COMMIT = /^[0-9a-f]{40}$/;

interface Lock {
	repository: string;
	versions: { tag: string; commit: string }[];
}

function git(args: string[], cwd = ROOT): string {
	return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function checkout(repository: string, tag: string, commit: string): string {
	if (!TAG.test(tag) || !COMMIT.test(commit)) throw new Error(`spec.lock.json: invalid entry ${tag} ${commit}`);
	const dir = join(CACHE, tag);
	if (!existsSync(dir)) {
		git(['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--depth', '1', '--branch', tag, '--', repository, dir]);
	}
	const head = git(['rev-parse', 'HEAD'], dir);
	if (head !== commit) throw new Error(`${tag}: checked out ${head}, spec.lock.json says ${commit}`);
	if (git(['status', '--porcelain'], dir) !== '') throw new Error(`${tag}: .spec-cache/${tag} has local changes`);
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

function siteCommit(): string {
	const commit = process.env.SITE_COMMIT ?? git(['rev-parse', 'HEAD']);
	if (!COMMIT.test(commit)) throw new Error(`SITE_COMMIT must be a 40-character commit, got "${commit}"`);
	return commit;
}

function main(): void {
	const lock = JSON.parse(readFileSync(join(ROOT, 'spec.lock.json'), 'utf8')) as Lock;
	if (!isOfficialRepository(lock.repository)) {
		throw new Error(`spec.lock.json: repository must be ${OFFICIAL_REPOSITORY}`);
	}
	if (!Array.isArray(lock.versions) || lock.versions.length === 0) throw new Error('spec.lock.json: no versions');
	const latest = lock.versions[lock.versions.length - 1];

	rmSync(ASSETS, { recursive: true, force: true });
	mkdirSync(ASSETS, { recursive: true });
	if (existsSync(join(ROOT, 'static'))) cpSync(join(ROOT, 'static'), ASSETS, { recursive: true });

	const schemas: { path: string; sha256: string }[] = [];
	for (const { tag, commit } of lock.versions) {
		const dir = checkout(lock.repository, tag, commit);
		const files = new Map([...readTree(dir, 'schema'), ...readTree(dir, 'conformance'), ...readTree(dir, 'vocabulary'), ...readTree(dir, 'data'), ...readTree(dir, 'examples')]);
		const manifest = JSON.parse(readFileSync(join(dir, 'conformance', 'manifest.json'), 'utf8')) as Manifest;
		const errors = verifyManifest(files, manifest);
		if (errors.length > 0) throw new Error(`${tag}:\n  ${errors.join('\n  ')}`);
		if (tag !== latest.tag) continue;

		for (const path of publishedFiles(manifest)) {
			const data = files.get(path);
			if (data === undefined) throw new Error(`${tag}: ${path} missing`);
			if (path.startsWith('vocabulary/')) {
				write(join(ASSETS, path), data);
				continue;
			}
			const target = schemaTarget(JSON.parse(data.toString('utf8')) as Record<string, unknown>);
			if (target === undefined) continue;
			if (schemas.some((s) => s.path === target)) throw new Error(`${tag}: two schemas claim ${target}`);
			write(join(ASSETS, target), data);
			schemas.push({ path: target, sha256: sha256(data) });
		}
	}
	schemas.sort((a, b) => a.path.localeCompare(b.path));
	const identifiers = identifierSchemas(schemas.map((s) => s.path));
	for (const [dir, schema] of identifiers) {
		cpSync(join(ASSETS, schema), join(ASSETS, dir, 'schema.json'));
	}

	write(join(ASSETS, 'version.json'), `${JSON.stringify({ commit: siteCommit(), spec: latest.tag })}\n`);
	const index = {
		repository: OFFICIAL_REPOSITORY.replace(/\.git$/, ''),
		latest,
		versions: lock.versions,
		schemas,
		identifiers: Object.fromEntries(identifiers)
	};
	write(join(ROOT, '.generated', 'spec.json'), `${JSON.stringify(index, null, 2)}\n`);
	write(
		join(ROOT, 'src', 'lib', 'generated', 'spec.ts'),
		`// Generated by scripts/import-spec.ts - do not edit.\nexport const spec = ${JSON.stringify(index, null, '\t')} as const;\n`
	);
	console.log(`Specification ${latest.tag}: ${schemas.length} schemas, identifiers ${[...identifiers.keys()].join(', ')}`);
}

main();
