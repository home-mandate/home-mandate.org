// Runs after "vite build": checks that build/ keeps the contract with the web
// server (see README) and the promises of the site. Exit 1 on any problem.
// Run with: node scripts/check-build.ts
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { checkHtml, checkProvenance, checkSecurityTxt } from './lib/build-check.ts';
import { sha256 } from './lib/spec.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const BUILD = join(ROOT, 'build');
const IDENTIFIER_PAGES = ['mandate/v0', 'audit/v0', 'audit-checkpoint/v0'];
// The contact form and the pages the contact service redirects to (303).
const CONTACT_PAGES = ['contact', 'contact/sent', 'contact/failed', 'contact/limit', 'contact/invalid'];

const problems: string[] = [];
const need = (path: string): void => {
	if (!existsSync(join(BUILD, path))) problems.push(`${path}: missing`);
};

const spec = JSON.parse(readFileSync(join(ROOT, '.generated', 'spec.json'), 'utf8')) as {
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
	for (const page of [...IDENTIFIER_PAGES, ...CONTACT_PAGES]) need(`${prefix}${page}/index.html`);
}
need('404.html');
need('robots.txt');
need('.well-known/security.txt');
problems.push(...checkSecurityTxt(readFileSync(join(BUILD, '.well-known', 'security.txt'), 'utf8'), new Date()));

const version = JSON.parse(readFileSync(join(BUILD, 'version.json'), 'utf8')) as { commit?: string };
const expected = process.env.SITE_COMMIT ?? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
if (version.commit !== expected) problems.push(`version.json: commit ${version.commit} != ${expected}`);

for (const entry of readdirSync(BUILD, { recursive: true, withFileTypes: true })) {
	if (!entry.isFile() || /\.(br|gz)$/.test(entry.name)) continue;
	const file = join(entry.parentPath, entry.name);
	if (/\.(svg|png|ico|webp|jpe?g)$/.test(entry.name)) {
		for (const p of checkProvenance(readFileSync(file))) problems.push(`${file.slice(BUILD.length + 1)}: ${p}`);
	}
	if (!entry.name.endsWith('.html')) continue;
	const path = file.slice(BUILD.length + 1);
	for (const p of checkHtml(readFileSync(file, 'utf8'), path)) problems.push(`${path}: ${p}`);
}

if (problems.length > 0) {
	console.error(problems.map((p) => `  ${p}`).join('\n'));
	console.error(`\n${problems.length} problem(s) in build/.`);
	process.exit(1);
}
console.log('build/ checked: schemas, identifier and contact pages, languages, version.json, HTML.');
