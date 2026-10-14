// Mermaid diagrams of the specification. The site renders no Mermaid: it draws
// each diagram as a Svelte component (src/lib/components/diagrams/) and knows
// it by the SHA-256 of its source. A diagram the site does not know, or one
// whose source changed, stops the build, so the drawing can never say
// something other than the specification.
import { createHash } from 'node:crypto';
import type { DiagramId } from './types';

const KNOWN: Record<string, DiagramId> = {
	// SPEC-v0 section 1.1: agent, implementation, platform and human.
	'0ebab25a22032380b21d7743ff4a7e34f8687b13aa5bcea84509b2a85a9ce239': 'overview'
};

/** The component for a Mermaid source of the specification, or an error. */
export function diagramFor(source: string): DiagramId {
	const sha256 = createHash('sha256').update(source).digest('hex');
	const id = KNOWN[sha256];
	if (id) return id;
	throw new Error(
		`SPEC-v0.md: unknown Mermaid diagram (sha256 ${sha256}). Draw it in src/lib/components/diagrams/ and add its hash to src/lib/spec/diagrams.ts.`
	);
}
