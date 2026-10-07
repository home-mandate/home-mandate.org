// Data that must agree with the imported specification.
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { vocabulary } from '@mandate-spec/mandate-spec/browser';
import { IMPLEMENTATIONS } from '../src/lib/content/implementations.ts';
import { spec } from '../src/lib/generated/spec.ts';

const lock = JSON.parse(readFileSync('spec.lock.json', 'utf8')) as { versions: { tag: string }[] };

it('every implementation names a specification version the site imports', () => {
	const tags = lock.versions.map((v) => v.tag);
	for (const impl of IMPLEMENTATIONS) expect(tags, impl.name).toContain(impl.spec);
});

it('the playground evaluates with the vocabulary of the imported specification', () => {
	const file = JSON.parse(readFileSync(`.spec-cache/${spec.latest.tag}/vocabulary/v0.json`, 'utf8')) as {
		categories: Record<string, unknown>;
	};
	expect(JSON.parse(JSON.stringify(vocabulary))).toEqual(file.categories);
});
