// Showing the problems of the contact form: the error under each field (with
// aria-invalid on its control) and the linked list in the error summary.
import { MAX_MESSAGE, messageLength, type Field, type Problem } from '../../lib/contact/validate.ts';
import { required, setInvalid } from '../lib/dom.ts';
import { banner } from './banners.ts';
import type { ContactElements } from './elements.ts';

export type ErrorKey = Field | 'altcha';
export type Shown = Problem | 'altcha';
export type Found = Partial<Record<ErrorKey, Shown>>;
/** Form order: the summary lists and focus picks problems in this order. */
export const FIELDS: readonly ErrorKey[] = ['name', 'email', 'message', 'privacy', 'altcha'];

export interface ErrorView {
	els: ContactElements;
	numbers: Intl.NumberFormat;
	/** The control a problem belongs to (the ALTCHA checkbox for 'altcha'). */
	controlOf(key: ErrorKey): HTMLElement | null;
}

export function problemText(view: ErrorView, problem: Shown): string {
	const text = view.els.text(problem);
	if (problem !== 'message_long') return text;
	// Counted like the validation: the normalized (trimmed) message.
	return text.replace('{count}', view.numbers.format(messageLength(view.els.message.value) - MAX_MESSAGE));
}

export function setError(view: ErrorView, key: ErrorKey, problem: Shown | undefined): void {
	const box = required(`#c-${key}-err`, view.els.form);
	required('[data-error-text]', box).textContent = problem ? problemText(view, problem) : '';
	box.hidden = !problem;
	const control = view.controlOf(key);
	if (!control) return;
	setInvalid(control, Boolean(problem));
	if (key === 'altcha') control.setAttribute('aria-describedby', box.id);
}

/** Field errors appear after the first submit; a too long message shows at once. */
export function renderErrors(view: ErrorView, found: Found, submitted: boolean): void {
	for (const key of FIELDS) {
		const show = submitted || (key === 'message' && found.message === 'message_long');
		setError(view, key, show ? found[key] : undefined);
	}
	if (submitted) renderSummary(view, found);
}

function summaryItem(view: ErrorView, key: ErrorKey, text: string): HTMLLIElement {
	const item = document.createElement('li');
	const link = document.createElement('a');
	link.href = `#${view.controlOf(key)?.id ?? ''}`;
	link.dataset.field = key;
	link.textContent = text;
	item.append(link);
	return item;
}

export function renderSummary(view: ErrorView, found: Found): void {
	const list = view.els.summaryList;
	const keys = FIELDS.filter((key) => found[key]);
	const items = keys.map((key) => ({ key, text: problemText(view, found[key] as Shown) }));
	// Rebuild only on change: a link replaced between mousedown and click never gets the click.
	const signature = JSON.stringify(items);
	if (list.dataset.signature !== signature) {
		list.dataset.signature = signature;
		list.replaceChildren(...items.map(({ key, text }) => summaryItem(view, key, text)));
	}
	if (keys.length === 0) banner(view.els.area, 'summary').hidden = true;
}

/** Focuses the control of the first problem; false if there is none to focus. */
export function focusFirstProblem(view: ErrorView, found: Partial<Record<ErrorKey, unknown>>): boolean {
	const first = FIELDS.find((key) => found[key]);
	const control = first ? view.controlOf(first) : null;
	control?.focus();
	return control !== null;
}
