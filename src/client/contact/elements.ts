// The parts of the contact form the script works with, found once.
import { required } from '../lib/dom.ts';

export interface ContactElements {
	form: HTMLFormElement;
	/** The form's surroundings: banners and the error summary live there. */
	area: HTMLElement;
	altchaSlot: HTMLElement;
	status: HTMLElement;
	submitLabel: HTMLElement;
	sendLabel: string;
	counter: HTMLElement;
	countValue: HTMLElement;
	summaryList: HTMLElement;
	name: HTMLInputElement | HTMLTextAreaElement;
	email: HTMLInputElement | HTMLTextAreaElement;
	message: HTMLInputElement | HTMLTextAreaElement;
	privacy: HTMLInputElement;
	/** A text of the page from <template data-texts> (error messages, "sending"). */
	text(key: string): string;
}

export function findElements(form: HTMLFormElement): ContactElements {
	const area = form.parentElement ?? document.body;
	const texts = required<HTMLTemplateElement>('template[data-texts]', form).content;
	const submitLabel = required('[data-submit-label]', required('button[type="submit"]', form));
	const counter = required('#c-message-count', form);
	const input = (name: string) => required<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`, form);
	return {
		form,
		area,
		altchaSlot: required('[data-altcha-slot]', form),
		status: required('[data-status]', form),
		submitLabel,
		sendLabel: submitLabel.textContent ?? '',
		counter,
		countValue: required('[data-count]', counter),
		summaryList: required('[data-summary-list]', area),
		name: input('name'),
		email: input('email'),
		message: input('message'),
		privacy: input('privacy') as HTMLInputElement,
		text: (key) => texts.querySelector(`[data-text="${key}"]`)?.textContent ?? ''
	};
}
