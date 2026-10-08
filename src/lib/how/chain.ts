// The audit log excerpt on the "How it works" page: four decision entries for
// the example mandate, hash-chained as in SPEC-v0 section 9.4, and the same
// log after someone edited entry 2. Computed at build time with real SHA-256.
import type { K } from '$lib/content/types';
import { digest, type Json } from './digest';
import type { Approval, Decision, Mandate } from './mandate-check';

export const AUDIT_TYPE = 'https://home-mandate.org/audit/v0';
/** Index of the entry the "change entry 2" button edits. */
export const TAMPERED = 1;

type Unlinked = { [key: string]: Json } & { seq: number };
type Entry = Unlinked & { prev: string | null };

interface Request {
	id: string;
	at: string;
	entity: { entity_id: string; category: string; area?: string };
	action: string;
	parameters?: Record<string, number>;
	decision: Decision;
	rule: string;
	what: K;
}

const DAY = '2026-10-12';
const REQUESTS: Request[] = [
	{ id: '01a13111-6c20-7101-8a01-00005eed0101', at: '19:02', entity: { entity_id: 'light.living_room', category: 'light', area: 'living_room' }, action: 'turn_on', decision: 'allow', rule: 'r-lights', what: 'how_log_1' },
	{ id: '01a13114-3940-7102-9a02-00005eed0102', at: '19:05', entity: { entity_id: 'alarm.house', category: 'alarm' }, action: 'disarm', decision: 'deny', rule: 'r-no-alarm', what: 'how_log_2' },
	{ id: '01a13115-2420-7103-aa03-00005eed0103', at: '19:06', entity: { entity_id: 'lock.front_door', category: 'lock', area: 'hall' }, action: 'unlock', decision: 'ask', rule: 'r-locks', what: 'how_log_3' },
	{ id: '01a13116-0e80-7104-ba04-00005eed0104', at: '19:07', entity: { entity_id: 'climate.living_room', category: 'climate', area: 'living_room' }, action: 'set_temperature', parameters: { temperature: 2100 }, decision: 'allow', rule: 'r-climate', what: 'how_log_4' }
];

function time(at: string, seconds = '00'): string {
	return `${DAY}T${at}:${seconds}+02:00`;
}

/** Outcome fields of a decision entry (SPEC-v0 section 9.1). */
function outcome(r: Request, approval: Approval): Record<string, Json> {
	if (r.decision === 'deny') return { result: { status: 'denied', denied_by: 'mandate' } };
	if (r.decision === 'allow') return { result: { status: 'executed' } };
	return { approval: { outcome: 'approved', by: approval.approvers[0]!, at: time(r.at, '40') }, result: { status: 'executed' } };
}

/** A decision entry without prev; prev is added when the chain is built. */
export function decisionEntry(r: Request, seq: number, mandate: Mandate, mandateDigest: string): Unlinked {
	const request: Record<string, Json> = { time: time(r.at), timezone: 'Europe/Berlin', resource: r.entity, action: r.action };
	if (r.parameters) request.parameters = r.parameters;
	// Approval settings: those of the rule, otherwise the mandate's (SPEC-v0 section 4.1).
	const approval = mandate.rules.find((x) => x.id === r.rule)?.approval ?? mandate.approval;
	const evaluation: Record<string, Json> = { decision: r.decision, reason: 'rule', rule_id: r.rule };
	if (r.decision === 'ask') evaluation.approval_timeout = approval.timeout;
	return {
		type: AUDIT_TYPE,
		id: r.id,
		seq,
		recorded_at: time(r.at, r.decision === 'ask' ? '40' : '01'),
		event: 'decision',
		principal: mandate.principal,
		agent: { client_id: mandate.agent.client_id },
		request,
		mandate: { id: mandate.id, digest: mandateDigest },
		evaluation,
		...outcome(r, approval)
	};
}

/** Links each entry to its predecessor: prev = digest of the entry before (null for seq 1). */
export async function chain(entries: Unlinked[]): Promise<Entry[]> {
	const out: Entry[] = [];
	let prev: string | null = null;
	for (const entry of entries) {
		const linked: Entry = { ...entry, prev };
		out.push(linked);
		prev = await digest(linked);
	}
	return out;
}

/**
 * Verification per SPEC-v0 section 9.4 (start and chain; the schema is not
 * checked here): the seq of the first entry that breaks the chain, or
 * undefined if the log is intact.
 */
export async function brokenAt(entries: Entry[]): Promise<number | undefined> {
	const first = entries[0];
	if (first && (first.seq !== 1 || first.prev !== null)) return first.seq;
	for (let i = 1; i < entries.length; i++) {
		const before = entries[i - 1]!;
		const entry = entries[i]!;
		if (entry.seq !== before.seq + 1 || entry.prev !== (await digest(before))) return entry.seq;
	}
	return undefined;
}

/** Entry 2 as someone might edit it afterwards: the denied disarm becomes "allowed". */
export function tamper(entry: Entry): Entry {
	return {
		...entry,
		evaluation: { decision: 'allow', reason: 'rule', rule_id: 'r-no-alarm' },
		result: { status: 'executed' }
	};
}

export interface EntryView {
	n: number;
	time: string;
	what: K;
	decision: Decision;
	prev: string | null;
	digest: string;
	/** Does prev match the digest of the entry before? (always true for the first) */
	linked: boolean;
	changed: { decision: Decision; digest: string; linked: boolean; edited: boolean };
}

export interface ChainView {
	entries: EntryView[];
	brokenAt: { intact: number | undefined; changed: number | undefined };
	/** The intact log in the exchange format (JSON Lines). */
	jsonl: string;
}

export async function buildChain(mandate: Mandate): Promise<ChainView> {
	const mandateDigest = await digest(mandate as unknown as Json);
	const intact = await chain(REQUESTS.map((r, i) => decisionEntry(r, i + 1, mandate, mandateDigest)));
	const changed = intact.map((e, i) => (i === TAMPERED ? tamper(e) : e));
	const intactDigests = await Promise.all(intact.map((e) => digest(e)));
	const changedDigests = await Promise.all(changed.map((e) => digest(e)));
	const entries = intact.map((entry, i): EntryView => {
		const r = REQUESTS[i]!;
		const edited = changed[i]!;
		return {
			n: entry.seq,
			time: r.at,
			what: r.what,
			decision: r.decision,
			prev: entry.prev,
			digest: intactDigests[i]!,
			linked: i === 0 || entry.prev === intactDigests[i - 1],
			changed: {
				decision: (edited.evaluation as { decision: Decision }).decision,
				digest: changedDigests[i]!,
				linked: i === 0 || entry.prev === changedDigests[i - 1],
				edited: i === TAMPERED
			}
		};
	});
	return {
		entries,
		brokenAt: { intact: await brokenAt(intact), changed: await brokenAt(changed) },
		jsonl: intact.map((e) => JSON.stringify(e)).join('\n')
	};
}
