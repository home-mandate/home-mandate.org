import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseSpec } from '../src/lib/spec/markdown';
import { diagramFor } from '../src/lib/spec/diagrams';

const ctx = { repository: 'https://github.com/home-mandate/spec', tag: 'v0.1.0-rc.2', file: 'SPEC-v0.md' };
// The Mermaid block of SPEC-v0 section 1.1, as the marked lexer returns it.
const OVERVIEW = readFileSync(new URL('./fixtures/spec-overview.mmd', import.meta.url), 'utf8').replace(/\n$/, '');
const fenced = (source: string, lang = 'mermaid'): string => `### 1.1 Overview (informative)\n\n\`\`\`${lang}\n${source}\n\`\`\`\n`;

describe('diagramFor', () => {
	it('knows the overview of section 1.1', () => {
		expect(diagramFor(OVERVIEW)).toBe('overview');
	});

	it('stops the build for a diagram the site does not draw', () => {
		expect(() => diagramFor('flowchart LR\n  A --> B')).toThrow(/unknown Mermaid diagram \(sha256 [0-9a-f]{64}\)/);
	});

	it('stops the build when the overview changes, even by one character', () => {
		expect(() => diagramFor(OVERVIEW.replace('Audit log', 'Audit logs'))).toThrow(/unknown Mermaid diagram/);
	});
});

describe('parseSpec with Mermaid', () => {
	it('turns the overview into a diagram block instead of code', () => {
		const doc = parseSpec(fenced(OVERVIEW), ctx);
		expect(doc.blocks.map((b) => b.type)).toEqual(['heading', 'diagram']);
		expect(doc.blocks[1]).toEqual({ type: 'diagram', id: 'overview' });
	});

	it('refuses an unknown Mermaid block', () => {
		expect(() => parseSpec(fenced('sequenceDiagram\n  A->>B: hi'), ctx)).toThrow(/unknown Mermaid diagram/);
	});

	it('leaves other code blocks literal', () => {
		const doc = parseSpec(fenced('flowchart LR', 'text'), ctx);
		expect(doc.blocks[1]).toEqual({ type: 'code', lang: 'text', text: 'flowchart LR' });
	});
});
