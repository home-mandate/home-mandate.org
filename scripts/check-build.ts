// Runs after "vite build": checks that build/ keeps the contract with the web
// server (see README) and the promises of the site. Exit 1 on any problem.
// Run with: node scripts/check-build.ts
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { checkHtml } from './lib/build-check.ts';
import { sha256 } from './lib/spec.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const BUILD = join(ROOT, 'build');
const IDENTIFIER_PAGES = ['mandate/v0', 'audit/v0', 'audit-checkpoint/v0'];

const problems: string[] = [];
const need = (path: string): void => {
	if (!existsSync(join(BUILD, path))) problems.push(`${path}: missing`);
};

const generated = readFileSync(join(ROOT, 'src', 'lib', 'generated', 'spec.ts'), 'utf8');
const spec = JSON.parse(generated.slice(generated.indexOf('{'), generated.lastIndexOf('}') + 1)) as {
	schemas: { path: string; sha256: string }[];
	identifiers: Record<string, string>;
};
for (const schema of spec.schemas) {
	const file = join(BUILD, schema.path);
	if (!existsSync(file)) problems.push(`${schema.path}: missing`);
	else if (sha256(readFileSync(file)) !== schema.sha256) problems.push(`${schema.path}: differs from the specification`);
}
for (const [dir, schema] of Object.entries(spec.identifiers)) {
	const file = join(BUILD, dir, 'schema.json');
	if (!existsSync(file) || !readFileSync(file).equals(readFileSync(join(BUILD, schema)))) {
		problems.push(`${dir}/schema.json: missing or not equal to ${schema}`);
	}
}

const languages = JSON.parse(readFileSync(join(ROOT, '.generated', 'languages.json'), 'utf8')) as { tag: string }[];
for (const { tag } of languages) {
	const prefix = tag === 'en' ? '' : `${tag}/`;
	need(`${prefix}index.html`);
	for (const page of IDENTIFIER_PAGES) need(`${prefix}${page}/index.html`);
}
need('404.html');
need('robots.txt');
need('.well-known/security.txt');

const version = JSON.parse(readFileSync(join(BUILD, 'version.json'), 'utf8')) as { commit?: string };
const expected = process.env.SITE_COMMIT ?? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
if (version.commit !== expected) problems.push(`version.json: commit ${version.commit} != ${expected}`);

for (const entry of readdirSync(BUILD, { recursive: true, withFileTypes: true })) {
	if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
	const file = join(entry.parentPath, entry.name);
	for (const p of checkHtml(readFileSync(file, 'utf8'))) problems.push(`${file.slice(BUILD.length + 1)}: ${p}`);
}

if (problems.length > 0) {
	console.error(problems.map((p) => `  ${p}`).join('\n'));
	console.error(`\n${problems.length} problem(s) in build/.`);
	process.exit(1);
}
console.log('build/ checked: schemas, identifier pages, languages, version.json, HTML.');
