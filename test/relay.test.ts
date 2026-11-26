import { describe, expect, it } from 'vitest';
import { linkToText } from '../src/lib/relay/errors';
import { relayErrors } from '../src/lib/relay/source.server';
import { parseSpec } from '../src/lib/spec/markdown';
import { MAX_PARTICIPANTS, parseSequence } from '../src/lib/spec/sequence';

const ctx = { repository: 'https://github.com/home-mandate/relay-spec', tag: 'v0.1.0', file: 'RELAY-v0.md' };

describe('parseSequence', () => {
	it('returns undefined for a diagram that is no sequence', () => {
		expect(parseSequence('flowchart LR\n  A --> B')).toBeUndefined();
	});

	it('reads participants, solid and dashed messages and a note over two participants', () => {
		const seq = parseSequence(
			['sequenceDiagram', '  participant G as Gateway', '  participant R as Relay', '  G->>R: hello', '  R-->>G: hello-ack', '  Note over G,R: TLS ends here'].join('\n')
		);
		expect(seq).toEqual({
			participants: ['Gateway', 'Relay'],
			steps: [
				{ kind: 'message', from: 0, to: 1, dashed: false, text: 'hello' },
				{ kind: 'message', from: 1, to: 0, dashed: true, text: 'hello-ack' },
				{ kind: 'note', from: 0, to: 1, dashed: false, text: 'TLS ends here' }
			]
		});
	});

	it('turns Mermaid entity codes into characters', () => {
		const seq = parseSequence('sequenceDiagram\n  participant A as Agent\n  participant R as Relay\n  A->>R: TLS to https://#lt;id#gt;/mcp');
		expect(seq?.steps[0]?.text).toBe('TLS to https://<id>/mcp');
	});

	it('stops the build for a line it does not understand', () => {
		expect(() => parseSequence('sequenceDiagram\n  participant A as Agent\n  participant R as Relay\n  loop every hour')).toThrow(/unsupported line/);
	});

	it('stops the build for an unknown participant', () => {
		expect(() => parseSequence('sequenceDiagram\n  participant A as Agent\n  A->>B: hi')).toThrow(/unknown participant B/);
	});

	it('stops the build for more participants than the drawing has columns', () => {
		const many = Array.from({ length: MAX_PARTICIPANTS + 1 }, (_, i) => `  participant P${i} as P${i}`);
		expect(() => parseSequence(['sequenceDiagram', ...many, '  P0->>P1: hi'].join('\n'))).toThrow(/more than 8 participants/);
	});
});

describe('relayErrors', () => {
	const table = (rows: string) => parseSpec(`# T\n\n| Error | Status | Meaning | Gateway |\n|---|---|---|---|\n${rows}\n`, ctx).blocks;

	it('reads every row of the table of errors', () => {
		const errors = relayErrors(table('| `malformed` | 400 | bad request | reports a defect (see [5.1](#51-x)) |'));
		expect(errors).toHaveLength(1);
		expect(errors[0]).toMatchObject({ name: 'malformed', status: 400, meaning: [{ type: 'text', text: 'bad request' }] });
		// Section links point into the text of the Relay Specification.
		expect(JSON.stringify(errors[0]?.gateway)).toContain('"/relay/v0/#51-x"');
	});

	it('stops the build when the table is missing', () => {
		expect(() => relayErrors(parseSpec('# T\n\nno table\n', ctx).blocks)).toThrow(/table of errors/);
	});

	it('stops the build for a row without a name or status', () => {
		expect(() => relayErrors(table('| Bad Name | 400 | x | y |'))).toThrow(/unexpected row/);
		expect(() => relayErrors(table('| `ok` | four hundred | x | y |'))).toThrow(/unexpected row/);
	});
});

describe('linkToText', () => {
	it('keeps external links and rewrites anchors, also inside emphasis', () => {
		const out = linkToText([
			{ type: 'link', href: 'https://example.org', external: true, children: [{ type: 'text', text: 'e' }] },
			{ type: 'strong', children: [{ type: 'link', href: '#4-tunnel', external: false, children: [{ type: 'text', text: '4' }] }] }
		]);
		expect(out[0]).toMatchObject({ href: 'https://example.org' });
		expect(out[1]).toMatchObject({ children: [{ href: '/relay/v0/#4-tunnel' }] });
	});
});
