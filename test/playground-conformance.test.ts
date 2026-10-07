// The playground agrees with the specification: the conformance cases of the imported
// specification run through src/client/playground/engine.ts, the very module the page
// script bundles for evaluation and validation.
import { describe, expect, it } from 'vitest';
import { evaluate, tryParseMandate, type Request } from '../src/client/playground/engine.ts';
import { specText } from './playground-fixtures.ts';

type Case = Record<string, unknown> & { id: string; why: string };

function cases(path: string): Case[] {
	return (JSON.parse(specText(path)) as { cases: Case[] }).cases;
}

function mandateText(c: Case): string {
	if (typeof c.mandate === 'string') return specText(c.mandate);
	return typeof c.mandate_raw === 'string' ? c.mandate_raw : JSON.stringify(c.mandate_inline);
}

describe('playground engine against the conformance cases', () => {
	const evaluation = cases('conformance/cases-v0.json');

	it('has cases to run', () => {
		expect(evaluation.length).toBeGreaterThan(100);
	});

	it.each(evaluation.map((c) => [c.id, c] as const))('evaluation case %s', (_id, c) => {
		const request = {
			resource: c.resource,
			action: c.action,
			parameters: c.parameters,
			time: c.time,
			timezone: c.timezone,
			revoked: c.revoked
		} as Request;
		const result = evaluate(tryParseMandate(mandateText(c)), request);
		expect(result.decision, c.why).toBe(c.expected);
		expect(result.reason, c.why).toBe(c.reason);
		expect(result.rule_id ?? null, c.why).toBe(c.rule_id ?? null);
		if (typeof c.approval_timeout === 'string') expect(result.approval?.timeout).toBe(c.approval_timeout);
	});

	it.each(cases('conformance/invalid-v0.json').map((c) => [c.id, c] as const))('invalid mandate %s is rejected', (_id, c) => {
		expect(tryParseMandate(mandateText(c)), c.why).toBeNull();
	});
});
