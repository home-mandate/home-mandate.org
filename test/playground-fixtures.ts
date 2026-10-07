// Shared inputs of the playground tests: the texts of a language pack (as the page
// passes them to the browser) and files of the imported specification.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spec } from '../src/lib/generated/spec.ts';
import type { Texts } from '../src/lib/playground/texts.ts';
import type { JsonObject } from '../src/lib/playground/model.ts';

const ROOT = join(import.meta.dirname, '..');
export const SPEC_DIR = join(ROOT, '.spec-cache', spec.latest.tag);

export function texts(tag: 'en' | 'de'): Texts {
	const raw = JSON.parse(readFileSync(join(ROOT, 'languages', tag, 'pages', 'playground.json'), 'utf8')) as Record<string, string>;
	return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.replace(/^playground_/, ''), v]));
}

export function specText(path: string): string {
	return readFileSync(join(SPEC_DIR, path), 'utf8');
}

export function example(name: 'voice-assistant' | 'energy-agent' | 'shopping-agent'): string {
	return specText(`examples/${name}.json`);
}

export function exampleDoc(name: 'voice-assistant' | 'energy-agent' | 'shopping-agent'): JsonObject {
	return JSON.parse(example(name)) as JsonObject;
}
