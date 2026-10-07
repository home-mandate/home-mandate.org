// Step 6: the mandate as editable JSON with line numbers, a valid/invalid badge, the
// reason in plain language, copy and download.
import type { Problem } from '../problems.ts';
import { tx, type Texts } from '../../../lib/playground/texts.ts';
import { append, h, icon } from './dom.ts';

export const COPIED_MS = 2000;

export interface JsonElements {
	textarea: HTMLTextAreaElement;
	gutter: HTMLElement;
	badge: HTMLElement;
	problem: HTMLElement;
}

/** Puts a text into the editor (unless it is what the editor already holds). */
export function setEditorText(els: JsonElements, text: string): void {
	if (els.textarea.value !== text) els.textarea.value = text;
}

/** Line numbers; the textarea grows with its text (rows), so nothing scrolls inside it. */
export function renderGutter(els: JsonElements, errorLine: number | undefined): void {
	const value = els.textarea.value;
	const lines = value.split('\n').length - (value.endsWith('\n') ? 1 : 0);
	els.textarea.rows = Math.max(lines, 4);
	const numbers = Array.from({ length: lines }, (_, i) => h('span', { class: i + 1 === errorLine ? 'pg-err-line' : undefined }, String(i + 1)));
	els.gutter.replaceChildren(...numbers);
}

function problemText(texts: Texts, problem: Problem): string {
	const where: string[] = [];
	if (problem.line !== undefined) where.push(tx(texts, 'line', { line: problem.line }));
	if (problem.rule) {
		where.push(problem.rule.id ? tx(texts, 'rule_ref', { number: problem.rule.number, id: problem.rule.id }) : tx(texts, 'rule_ref_no_id', { number: problem.rule.number }));
	}
	return where.join(' · ');
}

export function renderValidity(els: JsonElements, texts: Texts, problem: Problem | null, goToRule: (index: number) => void): void {
	const valid = problem === null;
	els.badge.dataset.valid = String(valid);
	els.badge.replaceChildren(icon(valid ? 'check' : 'warning', 14, 2.2), tx(texts, valid ? 'valid' : 'invalid'));
	els.textarea.toggleAttribute('aria-invalid', !valid);
	if (valid) {
		els.problem.hidden = true;
		els.problem.replaceChildren();
		return;
	}
	const where = problemText(texts, problem);
	const rule = problem.rule;
	els.problem.hidden = false;
	els.problem.replaceChildren();
	append(
		els.problem,
		h('strong', {}, icon('warning', 18, 1.9), tx(texts, 'invalid_title')),
		where ? h('span', { class: 'pg-where' }, where) : null,
		h('span', {}, tx(texts, problem.key, problem.vars)),
		h('span', { class: 'pg-detail' }, `${tx(texts, 'detail')}: `, h('code', {}, problem.detail)),
		rule ? h('button', { type: 'button', class: 'pg-link-btn', onclick: () => goToRule(rule.number - 1) }, tx(texts, 'go_to_rule')) : null
	);
}

export async function copyText(text: string, status: HTMLElement, texts: Texts): Promise<void> {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		return;
	}
	status.textContent = tx(texts, 'copied');
	setTimeout(() => {
		status.textContent = '';
	}, COPIED_MS);
}

/** Copy button: copies, then shows "Copied" for COPIED_MS (also announced). */
export function initCopyButton(button: HTMLButtonElement, status: HTMLElement, texts: Texts, text: () => string): void {
	const label = button.querySelector('span');
	button.addEventListener('click', async () => {
		await copyText(text(), status, texts);
		button.dataset.copied = 'true';
		if (label) label.textContent = tx(texts, 'copied');
		setTimeout(() => {
			delete button.dataset.copied;
			if (label) label.textContent = tx(texts, 'copy');
		}, COPIED_MS);
	});
}

/** Saves the text as a file: a blob URL on a temporary link with download. */
export function download(text: string, name: string): void {
	const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
	const link = h('a', { href: url, download: name, hidden: true });
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}
