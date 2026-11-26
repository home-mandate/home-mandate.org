// Mermaid sequence diagrams of a specification, read into data that the site
// draws itself (src/lib/components/spec/SequenceDiagram.svelte). Only the
// subset the specifications use is accepted: participants with an alias,
// messages (->> solid, -->> dashed) and notes over one or two participants.
// Anything else stops the build, so the drawing never says less than the text.

export interface SequenceStep {
	kind: 'message' | 'note';
	/** Indexes into participants; for a note the first and last participant it spans. */
	from: number;
	to: number;
	dashed: boolean;
	text: string;
}

export interface Sequence {
	participants: string[];
	steps: SequenceStep[];
}

export const MAX_PARTICIPANTS = 8;
const PARTICIPANT = /^participant\s+(\w+)\s+as\s+(.+)$/;
const MESSAGE = /^(\w+)\s*(-->>|->>)\s*(\w+)\s*:\s*(.+)$/;
const NOTE = /^Note\s+over\s+(\w+)(?:\s*,\s*(\w+))?\s*:\s*(.+)$/;

/** Mermaid entity codes (#lt; #gt; #amp; #quot; #35;) as characters. */
function entities(text: string): string {
	return text
		.replace(/#lt;/g, '<')
		.replace(/#gt;/g, '>')
		.replace(/#quot;/g, '"')
		.replace(/#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/#amp;/g, '&')
		.trim();
}

/** The sequence of a Mermaid source, undefined when it is no sequenceDiagram. */
export function parseSequence(source: string): Sequence | undefined {
	const lines = source
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l !== '');
	if (lines[0] !== 'sequenceDiagram') return undefined;
	const aliases = new Map<string, number>();
	const participants: string[] = [];
	const steps: SequenceStep[] = [];
	const index = (alias: string, line: string): number => {
		const i = aliases.get(alias);
		if (i === undefined) throw new Error(`Mermaid sequence: unknown participant ${alias} in "${line}"`);
		return i;
	};
	for (const line of lines.slice(1)) {
		const p = PARTICIPANT.exec(line);
		if (p) {
			if (steps.length > 0) throw new Error(`Mermaid sequence: participant after the first message: "${line}"`);
			aliases.set(p[1] as string, participants.length);
			participants.push(entities(p[2] as string));
			continue;
		}
		const msg = MESSAGE.exec(line);
		if (msg) {
			steps.push({ kind: 'message', from: index(msg[1] as string, line), to: index(msg[3] as string, line), dashed: msg[2] === '-->>', text: entities(msg[4] as string) });
			continue;
		}
		const note = NOTE.exec(line);
		if (note) {
			const a = index(note[1] as string, line);
			const b = note[2] === undefined ? a : index(note[2], line);
			steps.push({ kind: 'note', from: Math.min(a, b), to: Math.max(a, b), dashed: false, text: entities(note[3] as string) });
			continue;
		}
		throw new Error(`Mermaid sequence: unsupported line "${line}". Extend src/lib/spec/sequence.ts or draw the diagram in src/lib/components/diagrams/.`);
	}
	if (participants.length < 2 || steps.length === 0) throw new Error('Mermaid sequence: needs at least two participants and one step');
	// SequenceDiagram.svelte has classes for up to eight columns.
	if (participants.length > MAX_PARTICIPANTS) throw new Error(`Mermaid sequence: more than ${MAX_PARTICIPANTS} participants`);
	return { participants, steps };
}
