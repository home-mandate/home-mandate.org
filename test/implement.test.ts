import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { spec } from '../src/lib/generated/spec';
import { implementData } from '../src/lib/implement/build-data';
import { conformanceCommands, modulePath } from '../src/lib/implement/commands';
import { CONFORMANCE_CLASSES, caseCounts } from '../src/lib/implement/conformance';
import { DOWNLOADS, kilobytes, shortHash } from '../src/lib/implement/downloads';
import { cardinality, dataModel, fieldsOf, resolve, typeName, typeOf } from '../src/lib/implement/model';

const ROOT = new URL('..', import.meta.url).pathname;
const RELEASE = join(ROOT, '.spec-cache', spec.latest.tag);
const schema = JSON.parse(readFileSync(join(RELEASE, 'schema', 'mandate-v0.schema.json'), 'utf8')) as Record<string, unknown>;

describe('typeOf', () => {
	const root = {
		$defs: {
			when: { type: 'string', format: 'date-time' },
			thing: { type: 'object', properties: { a: { type: 'string' } } },
			plain: { type: 'string' }
		}
	};
	it('shows constants, enums and primitive types', () => {
		expect(typeOf({ const: 'deny' }, root)).toBe('"deny"');
		expect(typeOf({ const: true }, root)).toBe('true');
		expect(typeOf({ enum: ['allow', 'ask', 'deny'] }, root)).toBe('allow|ask|deny');
		expect(typeOf({ type: 'integer' }, root)).toBe('integer');
	});
	it('names referenced definitions: objects in PascalCase, formats, otherwise the name', () => {
		expect(typeOf({ $ref: '#/$defs/thing' }, root)).toBe('Thing');
		expect(typeOf({ $ref: '#/$defs/when' }, root)).toBe('date-time');
		expect(typeOf({ $ref: '#/$defs/plain' }, root)).toBe('plain');
	});
	it('shows arrays and inline objects', () => {
		expect(typeOf({ type: 'array', items: { $ref: '#/$defs/thing' } }, root)).toBe('Thing[]');
		expect(typeOf({ type: 'array' }, root)).toBe('unknown[]');
		expect(typeOf({ type: 'object', properties: { x: {}, y: {} } }, root)).toBe('{x, y}');
		expect(typeOf({ type: 'object' }, root)).toBe('object');
	});
	it('rejects what it cannot describe', () => {
		expect(() => typeOf({}, root)).toThrow(/no type/);
		expect(() => typeOf({ $ref: 'other.json#/x' }, root)).toThrow(/unsupported/);
		expect(() => typeOf({ $ref: '#/$defs/missing' }, root)).toThrow(/not found/);
		expect(() => resolve('#/$defs/x', {})).toThrow(/not found/);
	});
});

describe('fieldsOf and dataModel', () => {
	it('converts definition names', () => {
		expect(typeName('date_time')).toBe('DateTime');
		expect(typeName('rule')).toBe('Rule');
	});
	it('lists fields in schema order and marks optional ones', () => {
		const fields = fieldsOf({ $ref: '#/$defs/o' }, { $defs: { o: { required: ['a'], properties: { a: { type: 'string' }, b: { type: 'integer' } } } } });
		expect(fields).toEqual([
			{ name: 'a', type: 'string', optional: false },
			{ name: 'b', type: 'integer', optional: true }
		]);
		expect(() => fieldsOf({ type: 'string' }, {})).toThrow(/no properties/);
		expect(() => fieldsOf({ properties: { a: 1 } }, {})).toThrow(/not a schema/);
	});
	it('reads the array bounds', () => {
		expect(cardinality({ maxItems: 200 })).toEqual({ min: 0, max: '200' });
		expect(cardinality({ minItems: 1 })).toEqual({ min: 1, max: 'n' });
	});
	it('derives the real mandate and rule fields from the imported schema', () => {
		const model = dataModel(schema);
		const properties = schema.properties as Record<string, unknown>;
		expect(model.mandate.map((f) => f.name)).toEqual(Object.keys(properties));
		expect(model.mandate.find((f) => f.name === 'default')).toEqual({ name: 'default', type: '"deny"', optional: false });
		expect(model.mandate.find((f) => f.name === 'rules')?.type).toBe('Rule[]');
		expect(model.mandate.find((f) => f.name === 'expires')).toEqual({ name: 'expires', type: 'date-time', optional: true });
		expect(model.rule.map((f) => f.name)).toEqual(['id', 'resource', 'actions', 'decision', 'conditions', 'constraints', 'approval', 'allow_critical']);
		expect(model.rule.find((f) => f.name === 'decision')?.type).toBe('allow|ask|deny');
		expect(model.rules).toEqual({ min: 0, max: '200' });
		expect(() => dataModel({ properties: {} })).toThrow(/rules array/);
	});
});

describe('caseCounts', () => {
	it('assigns the conformance files to the classes of section 8.1', () => {
		const n = (k: number) => ({ cases: Array.from({ length: k }, () => ({})) });
		const counts = caseCounts({
			cases: n(3),
			invalid: n(2),
			digest: n(1),
			selection: n(4),
			signed: n(5),
			succession: n(6),
			audit: { logs: [{}, {}, { keys: 'conformance/keys/test-keys.json' }] }
		});
		expect(counts).toEqual({ evaluator: 6, selection: 4, signatures: 11, audit: 2, 'audit-anchored': 1 });
	});
	it('fails on a malformed file', () => {
		const ok = { cases: [] };
		const files = { cases: ok, invalid: ok, digest: ok, selection: ok, signed: ok, succession: ok, audit: { logs: [] } };
		expect(() => caseCounts({ ...files, audit: {} })).toThrow(/audit-v0.json has no "logs"/);
		expect(() => caseCounts({ ...files, invalid: null })).toThrow(/invalid-v0.json has no "cases"/);
	});
	it('lists the six classes of the specification', () => {
		const text = readFileSync(join(RELEASE, 'SPEC-v0.md'), 'utf8');
		const section = text.slice(text.indexOf('### 8.1'), text.indexOf('### 8.2'));
		const classes = [...section.matchAll(/^\| `([a-z-]+)` \|/gm)].map((match) => match[1]);
		expect(classes).toEqual([...CONFORMANCE_CLASSES]);
	});
});

describe('downloads', () => {
	it('shortens a SHA-256 to eight and four hex digits', () => {
		expect(shortHash(`3f9a1c7e${'0'.repeat(52)}c21e`)).toBe('3f9a1c7e…c21e');
		expect(() => shortHash('abc')).toThrow(/SHA-256/);
	});
	it('formats sizes in kilobytes for the locale', () => {
		expect(kilobytes(14 * 1024, 'en')).toBe('14');
		expect(kilobytes(1536, 'en')).toBe('1.5');
		expect(kilobytes(1536, 'de')).toBe('1,5');
		expect(kilobytes(30_000, 'en')).toBe('29');
		expect(() => kilobytes(-1, 'en')).toThrow(/invalid size/);
	});
});

describe('conformanceCommands', () => {
	it('installs the test tool at the imported tag', () => {
		const [install, exec, http] = conformanceCommands(spec.repository, spec.latest.tag);
		expect(install?.command).toBe(`go install github.com/mandate-spec/mandate-spec/cmd/mandate-conformance@${spec.latest.tag}`);
		expect(exec?.command).toContain('-exec ./your-harness');
		expect(http?.command).toContain('-authzen');
	});
	it('accepts only GitHub repositories and release tags', () => {
		expect(modulePath('https://github.com/a/b.git')).toBe('github.com/a/b');
		expect(() => modulePath('https://example.org/a/b')).toThrow(/GitHub/);
		expect(() => conformanceCommands(spec.repository, 'main; rm -rf /')).toThrow(/tag/);
	});
	it('matches the usage of the test tool in the release', () => {
		const usage = readFileSync(join(RELEASE, 'internal', 'harness', 'cli.go'), 'utf8');
		for (const flag of ['-report', '-exec', '-authzen', '-control']) expect(usage).toContain(flag);
		expect(readFileSync(join(RELEASE, 'README.md'), 'utf8')).toContain('go install github.com/mandate-spec/mandate-spec/cmd/mandate-conformance@');
	});
});

describe('implementData', () => {
	it('computes size and SHA-256 from the served files', () => {
		const data = implementData(ROOT, spec.latest.tag);
		expect(data.downloads.map((d) => d.href)).toEqual(DOWNLOADS.map((d) => `/${d.path}`));
		for (const d of data.downloads) {
			const bytes = readFileSync(join(ROOT, '.generated', 'static', d.href.slice(1)));
			expect(d.bytes).toBe(bytes.length);
			expect(d.sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
		}
		const mandate = spec.schemas.find((s) => s.path === 'mandate/v0/mandate.schema.json');
		expect(data.downloads[0]?.sha256).toBe(mandate?.sha256);
		expect(data.categories).toBeGreaterThan(0);
		expect(data.counts.evaluator).toBeGreaterThan(0);
		expect(data.counts['audit-anchored']).toBeGreaterThan(0);
	});
});
