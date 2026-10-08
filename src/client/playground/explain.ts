// The result of the evaluation in plain language: heading, reason (one text per reason
// code of SPEC-v0 section 4.1) and which rules match. Which rules match is asked of the
// evaluation itself, one rule at a time; nothing here decides anything.
import { evaluate, isCritical, type Mandate, type Request, type Result, type Rule } from '../../lib/playground/engine.ts';
import { HOUSEHOLD_ZONE } from '../../lib/playground/request.ts';
import { actionLabel, categoryLabel, joinOr, tx, type Texts } from '../../lib/playground/texts.ts';

export type Role = 'decides' | 'outvoted' | 'also' | 'limits';

export interface Match {
	id: string;
	decision: Rule['decision'];
	role: Role;
}

const STRICTNESS = { allow: 0, ask: 1, deny: 2 } as const;
/** Reasons after which the evaluation compares rules (SPEC-v0 section 4, steps 2 to 5). */
const RULE_REASONS = new Set(['rule', 'critical_demotion', 'no_match']);

function matchesAlone(mandate: Mandate, rule: Rule, request: Request): boolean {
	const reason = evaluate({ ...mandate, rules: [rule] }, request).reason;
	return reason === 'rule' || reason === 'critical_demotion';
}

/** Matching rules in document order, and rules that only miss because of their limits. */
export function matchingRules(mandate: Mandate | null, request: Request, result: Result): Match[] {
	if (!mandate || !RULE_REASONS.has(result.reason)) return [];
	const out: Match[] = [];
	for (const rule of mandate.rules) {
		if (matchesAlone(mandate, rule, request)) {
			const role: Role =
				rule.id === result.rule_id ? 'decides' : STRICTNESS[rule.decision] < STRICTNESS[result.decision] ? 'outvoted' : 'also';
			out.push({ id: rule.id, decision: rule.decision, role });
		} else if (rule.constraints.length > 0 && matchesAlone(mandate, { ...rule, constraints: [] }, request)) {
			out.push({ id: rule.id, decision: rule.decision, role: 'limits' });
		}
	}
	return out;
}

export function requestIsCritical(request: Request): boolean {
	return isCritical(request.resource, request.action);
}

/** "“unlock” on locks in area “hall”" for the reason texts. */
export function requestPhrase(texts: Texts, request: Request): { action: string; device: string } {
	const category = request.resource.category ?? '';
	let device = categoryLabel(texts, category);
	if (request.resource.area !== undefined) device += tx(texts, 'desc_area_also', { area: request.resource.area });
	return { action: actionLabel(texts, request.action), device };
}

/** The reason of the result in plain language. */
export function reasonText(texts: Texts, result: Result, request: Request, mandate: Mandate | null): string {
	const vars: Record<string, string> = { ...requestPhrase(texts, request), id: result.rule_id ?? '' };
	if (result.reason === 'rule') {
		const approvers = result.approval?.approvers ?? [];
		vars.who = approvers.length > 0 ? tx(texts, 'desc_who', { approvers: joinOr(texts, approvers) }) : '';
		return tx(texts, `reason_rule_${result.decision}`, vars);
	}
	if (result.reason === 'not_yet_valid' || result.reason === 'expired') {
		vars.from = mandateTime(mandate, 'from');
		vars.until = mandateTime(mandate, 'until');
	}
	return tx(texts, `reason_${result.reason}`, vars);
}

function mandateTime(mandate: Mandate | null, which: 'from' | 'until'): string {
	const instant = which === 'from' ? mandate?.validFrom : mandate?.expires;
	if (!instant) return '';
	// ISO date (en-CA writes YYYY-MM-DD) in the household time zone.
	const format = new Intl.DateTimeFormat('en-CA', { timeZone: HOUSEHOLD_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
	return format.format(new Date(Number(instant.ns / 1_000_000n)));
}

/** Timeout "PT1M30S" as "1 min 30 s". */
export function formatTimeout(texts: Texts, timeout: string): string {
	const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(timeout);
	if (!m) return timeout;
	const parts: string[] = [];
	if (m[1]) parts.push(tx(texts, 'unit_h', { n: Number(m[1]) }));
	if (m[2]) parts.push(tx(texts, 'unit_min', { n: Number(m[2]) }));
	if (m[3]) parts.push(tx(texts, 'unit_s', { n: Number(m[3]) }));
	return parts.length > 0 ? parts.join(' ') : timeout;
}
