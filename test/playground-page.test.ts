import { describe, expect, it } from 'vitest';
import { analyse } from '../src/client/playground/analyse.ts';
import { EXAMPLE_FILES, emptyMandate, isExampleId } from '../src/lib/playground/examples.ts';
import { formatDoc } from '../src/lib/playground/model.ts';
import { playgroundTexts } from '../src/lib/content/pages/playground.ts';
import { texts } from './playground-fixtures.ts';

describe('playground texts for the browser', () => {
	it('contains every playground message without its prefix, placeholders kept', () => {
		const out = playgroundTexts();
		expect(Object.keys(out).sort()).toEqual(Object.keys(texts('en')).sort());
		expect(out.title).toBe('Playground');
		expect(out.reason_rule_allow).toBe('Rule “{id}” applies: “{action}” for {device} is allowed.');
	});
});

describe('examples', () => {
	it('starts "build your own" from a valid mandate without rules', () => {
		const { mandate, problem } = analyse(formatDoc(emptyMandate('My agent')));
		expect(problem).toBeNull();
		expect(mandate?.rules).toEqual([]);
	});
	it('knows its examples', () => {
		expect(Object.values(EXAMPLE_FILES)).toEqual(['voice-assistant', 'energy-agent', 'shopping-agent']);
		expect(isExampleId('build')).toBe(true);
		expect(isExampleId('other')).toBe(false);
	});
});

describe('analyse', () => {
	it('keeps the JSON object of an invalid mandate for the editor', () => {
		const result = analyse('{"rules": []}');
		expect(result.doc).toEqual({ rules: [] });
		expect(result.mandate).toBeNull();
		expect(result.problem?.key).toBe('err_missing');
		expect(analyse('[1]').doc).toBeNull();
	});
});
