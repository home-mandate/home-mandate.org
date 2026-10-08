import { describe, expect, it } from 'vitest';
import { identifierSchemas, isOfficialRepository, publishedFiles, schemaTarget, sha256, verifyManifest } from '../scripts/lib/spec.ts';

const enc = (s: string) => Buffer.from(s, 'utf8');

describe('sha256', () => {
	it('hashes bytes as lower-case hex', () => {
		expect(sha256(enc('abc'))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
	});
});

describe('verifyManifest', () => {
	const files = new Map([
		['schema/a.json', enc('a')],
		['vocabulary/v0.json', enc('v')]
	]);
	const manifest = {
		files: [
			{ path: 'schema/a.json', sha256: sha256(enc('a')) },
			{ path: 'vocabulary/v0.json', sha256: sha256(enc('v')) }
		]
	};
	it('accepts matching files', () => {
		expect(verifyManifest(files, manifest)).toEqual([]);
	});
	it('reports a changed file', () => {
		const changed = new Map(files).set('schema/a.json', enc('b'));
		expect(verifyManifest(changed, manifest).join()).toMatch(/schema\/a.json.*SHA-256/);
	});
	it('reports a missing file', () => {
		const missing = new Map([...files].filter(([p]) => p !== 'vocabulary/v0.json'));
		expect(verifyManifest(missing, manifest).join()).toMatch(/vocabulary\/v0.json.*missing/);
	});
	it('rejects a malformed manifest', () => {
		expect(verifyManifest(files, { files: 'x' } as never).join()).toMatch(/manifest/);
	});
});

describe('schemaTarget', () => {
	it('maps an $id to its path on the site', () => {
		expect(schemaTarget({ $id: 'https://home-mandate.org/mandate/v0/mandate.schema.json' })).toBe(
			'mandate/v0/mandate.schema.json'
		);
	});
	it('ignores files without $id', () => {
		expect(schemaTarget({ type: 'object' })).toBeUndefined();
	});
	it.each([
		'https://example.org/mandate/v0/mandate.schema.json',
		'https://home-mandate.org/../x.schema.json',
		'https://home-mandate.org/mandate/v0/../../etc.schema.json',
		'https://home-mandate.org/mandate.schema.json',
		'https://home-mandate.org/Mandate/v0/x.schema.json',
		'https://home-mandate.org/mandate/v0/x.json',
		'http://home-mandate.org/mandate/v0/x.schema.json'
	])('rejects %s', (id) => {
		expect(() => schemaTarget({ $id: id })).toThrow();
	});
});

describe('identifierSchemas', () => {
	it('gives an identifier directory its only schema', () => {
		expect(
			identifierSchemas([
				'mandate/v0/mandate.schema.json',
				'audit/v0/audit.schema.json',
				'conformance/v0/a.schema.json',
				'conformance/v0/b.schema.json'
			])
		).toEqual(
			new Map([
				['mandate/v0', 'mandate/v0/mandate.schema.json'],
				['audit/v0', 'audit/v0/audit.schema.json']
			])
		);
	});
});

describe('isOfficialRepository', () => {
	it('accepts only the official repository', () => {
		expect(isOfficialRepository('https://github.com/home-mandate/spec.git')).toBe(true);
		expect(isOfficialRepository('https://github.com/evil/spec.git')).toBe(false);
		expect(isOfficialRepository('--upload-pack=x')).toBe(false);
	});
});

describe('publishedFiles', () => {
	it('publishes only manifest entries from the schema and vocabulary trees', () => {
		const manifest = {
			files: [
				{ path: 'schema/mandate-v0.schema.json', sha256: 'x' },
				{ path: 'conformance/schema/cases-v0.schema.json', sha256: 'x' },
				{ path: 'vocabulary/v0.json', sha256: 'x' },
				{ path: 'conformance/cases-v0.json', sha256: 'x' },
				{ path: 'examples/voice-assistant.json', sha256: 'x' }
			]
		};
		expect(publishedFiles(manifest)).toEqual([
			'schema/mandate-v0.schema.json',
			'conformance/schema/cases-v0.schema.json',
			'vocabulary/v0.json'
		]);
	});
});
