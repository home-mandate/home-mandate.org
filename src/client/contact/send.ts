// Sending the contact form with fetch: the relay answers with a 303 to a result
// page, whose address tells the outcome (resultOf).
import { resultOf, type Result } from '../../lib/contact/validate.ts';
import type { ContactElements } from './elements.ts';

export interface Sent {
	result: Result;
	/** The result page fetch ended on (where "sent" navigates to). */
	target: string;
}

/** The fields as sent; read before setBusy, since disabled controls are left out of FormData. */
export function formBody(form: HTMLFormElement): URLSearchParams {
	const body = new URLSearchParams();
	for (const [key, value] of new FormData(form)) {
		if (typeof value === 'string') body.append(key, value);
	}
	return body;
}

/** Posts the form's fields; a network error counts as 'failed'. */
export async function post(form: HTMLFormElement, body: URLSearchParams): Promise<Sent> {
	try {
		const response = await fetch(form.getAttribute('action') ?? '/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
			redirect: 'follow',
			credentials: 'same-origin',
			cache: 'no-store'
		});
		return { result: resultOf(response.url, response.status, location.origin), target: response.url };
	} catch {
		return { result: 'failed', target: '' };
	}
}

/** While sending: every control disabled, aria-busy, "Sending" on the button and announced. */
export function setBusy(els: ContactElements, on: boolean): void {
	els.form.setAttribute('aria-busy', String(on));
	for (const el of els.form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('input, textarea, button')) {
		if (el.type !== 'hidden') el.disabled = on;
	}
	els.submitLabel.textContent = on ? els.text('sending') : els.sendLabel;
	els.status.textContent = on ? els.text('sending') : '';
}
