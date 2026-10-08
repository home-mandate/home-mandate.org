// Step 4: the decision of the evaluation, why, which rules apply and, for a critical
// action, what that means. Also the short result line of the phone layout.
import type { Mandate, Request, Result } from '../../../lib/playground/engine.ts';
import { formatTimeout, matchingRules, reasonText, requestIsCritical, requestPhrase } from '../explain.ts';
import { joinOr, tx, type Texts } from '../../../lib/playground/texts.ts';
import { chip, h, icon } from './dom.ts';

export function renderResult(container: HTMLElement, texts: Texts, mandate: Mandate | null, request: Request, result: Result): void {
	const matches = matchingRules(mandate, request, result);
	const list = matches.length
		? h(
				'ul',
				{ class: 'pg-matches' },
				...matches.map((match) =>
					h(
						'li',
						{ class: `pg-match pg-role-${match.role}` },
						h('code', {}, match.id),
						h('span', { class: 'pg-role' }, tx(texts, `role_${match.role}`)),
						chip(match.decision)
					)
				)
			)
		: h('p', { class: 'pg-none' }, tx(texts, 'none_matched'));
	const approval = result.decision === 'ask' && result.approval
		? h('p', { class: 'pg-approval' }, tx(texts, 'approval', { approvers: joinOr(texts, result.approval.approvers), timeout: formatTimeout(texts, result.approval.timeout) }))
		: null;
	const critical = requestIsCritical(request)
		? h(
				'div',
				{ class: 'pg-critical-note' },
				icon('critical', 20),
				h('div', {}, h('strong', {}, tx(texts, 'critical_title')), h('p', {}, tx(texts, 'critical_body')))
			)
		: null;
	container.replaceChildren(
		h('div', { class: 'pg-verdict' }, chip(result.decision, 'xl'), h('h3', { class: 'pg-verdict-head' }, tx(texts, `head_${result.decision}`))),
		h('p', { class: 'pg-reason', 'data-reason': result.reason }, reasonText(texts, result, request, mandate)),
		...(approval ? [approval] : []),
		h('h4', { class: 'pg-eyebrow' }, tx(texts, 'matched')),
		list,
		...(critical ? [critical] : [])
	);
}

/** "locks · unlock · Wed 19:00" */
export function shortRequest(texts: Texts, request: Request, day: string, time: string): string {
	const { action, device } = requestPhrase(texts, request);
	return `${device} · ${action} · ${tx(texts, `day_short_${day}`)} ${time}`;
}

export function renderLine(textEl: HTMLElement, chipEl: HTMLElement, text: string, result: Result): void {
	textEl.textContent = text;
	chipEl.replaceChildren(chip(result.decision));
}
