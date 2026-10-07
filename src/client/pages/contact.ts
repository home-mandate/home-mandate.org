// Contact form: client-side checks (the same rules as the server), ALTCHA,
// sending with fetch and showing the outcome. Without JavaScript the page
// shows the e-mail address instead of the form (.js-only / .no-js-only).
import { altchaCheckbox, altchaStrings, createAltcha, type AltchaState, type AltchaWidget } from '../lib/altcha.ts';
import {
	MAX_MESSAGE,
	counterLevel,
	length,
	resultOf,
	validate,
	type Field,
	type Problem,
	type Result
} from '../../lib/contact/validate.ts';

type ErrorKey = Field | 'altcha';
const FIELDS: ErrorKey[] = ['name', 'email', 'message', 'privacy', 'altcha'];
const BANNERS = ['summary', 'failed', 'limit', 'invalid'] as const;
type BannerKind = (typeof BANNERS)[number];

function required<T extends Element>(root: ParentNode, selector: string): T {
	const el = root.querySelector<T>(selector);
	if (!el) throw new Error(`contact form: ${selector} missing`);
	return el;
}

function init(form: HTMLFormElement): void {
	const area = form.parentElement ?? document.body;
	const slot = required<HTMLElement>(form, '[data-altcha-slot]');
	const texts = required<HTMLTemplateElement>(form, 'template[data-texts]').content;
	const text = (key: string): string => texts.querySelector(`[data-text="${key}"]`)?.textContent ?? '';
	const strings = altchaStrings(slot);
	const status = required<HTMLElement>(form, '[data-status]');
	const submit = required<HTMLButtonElement>(form, 'button[type="submit"]');
	const submitLabel = required<HTMLElement>(submit, '[data-submit-label]');
	const sendLabel = submitLabel.textContent ?? '';
	const counter = required<HTMLElement>(form, '#c-message-count');
	const countValue = required<HTMLElement>(counter, '[data-count]');
	const summaryList = required<HTMLElement>(area, '[data-summary-list]');
	const input = (name: string) => required<HTMLInputElement | HTMLTextAreaElement>(form, `[name="${name}"]`);
	const name = input('name');
	const email = input('email');
	const message = input('message');
	const privacy = input('privacy') as HTMLInputElement;
	const numbers = new Intl.NumberFormat(document.documentElement.lang || 'en');

	const widget: AltchaWidget = createAltcha(slot, form.dataset.worker ?? '');
	let altchaState: AltchaState = 'unverified';
	let submitted = false;
	// The ALTCHA error shows only after a submit that found the check unfinished.
	let altchaAsked = false;
	let busy = false;

	const controlOf = (key: ErrorKey): HTMLElement | null =>
		key === 'altcha' ? altchaCheckbox(widget) : ({ name, email, message, privacy } as Record<Field, HTMLElement>)[key];

	function problemText(problem: Problem | 'altcha'): string {
		if (problem !== 'message_long') return text(problem);
		return text(problem).replace('{count}', numbers.format(length(message.value) - MAX_MESSAGE));
	}

	/** Current problems: the field rules, plus ALTCHA once the form was submitted. */
	function problems(): Partial<Record<ErrorKey, Problem | 'altcha'>> {
		const found: Partial<Record<ErrorKey, Problem | 'altcha'>> = validate({
			name: name.value,
			email: email.value,
			message: message.value,
			privacy: privacy.checked
		});
		if (altchaAsked && altchaState !== 'verified') found.altcha = 'altcha';
		return found;
	}

	function setError(key: ErrorKey, problem: Problem | 'altcha' | undefined): void {
		const box = required<HTMLElement>(form, `#c-${key}-err`);
		const label = required<HTMLElement>(box, '[data-error-text]');
		label.textContent = problem ? problemText(problem) : '';
		box.hidden = !problem;
		const control = controlOf(key);
		if (!control) return;
		if (problem) control.setAttribute('aria-invalid', 'true');
		else control.removeAttribute('aria-invalid');
		if (key === 'altcha') control.setAttribute('aria-describedby', box.id);
	}

	/** Field errors appear after the first submit; a too long message shows at once. */
	function render(): Partial<Record<ErrorKey, Problem | 'altcha'>> {
		const found = problems();
		for (const key of FIELDS) {
			const show = submitted || (key === 'message' && found.message === 'message_long');
			setError(key, show ? found[key] : undefined);
		}
		if (submitted) renderSummary(found);
		return found;
	}

	function renderSummary(found: Partial<Record<ErrorKey, Problem | 'altcha'>>): void {
		const keys = FIELDS.filter((key) => found[key]);
		const items = keys.map((key) => ({ key, text: problemText(found[key] as Problem | 'altcha') }));
		// Rebuild only on change: a link replaced between mousedown and click never gets the click.
		const signature = JSON.stringify(items);
		if (summaryList.dataset.signature !== signature) {
			summaryList.dataset.signature = signature;
			summaryList.replaceChildren(
				...items.map(({ key, text: message }) => {
					const item = document.createElement('li');
					const link = document.createElement('a');
					link.href = `#${controlOf(key)?.id ?? ''}`;
					link.dataset.field = key;
					link.textContent = message;
					item.append(link);
					return item;
				})
			);
		}
		if (keys.length === 0) banner('summary').hidden = true;
	}

	function banner(kind: BannerKind): HTMLElement {
		return required<HTMLElement>(area, `[data-banner="${kind}"]`);
	}

	function showBanner(kind: BannerKind | null): HTMLElement | null {
		for (const other of BANNERS) banner(other).hidden = other !== kind;
		return kind ? banner(kind) : null;
	}

	function updateCounter(): void {
		const count = length(message.value);
		countValue.textContent = numbers.format(count);
		counter.dataset.level = counterLevel(count);
	}

	function focusFirstProblem(found: Partial<Record<ErrorKey, unknown>>): boolean {
		const first = FIELDS.find((key) => found[key]);
		const control = first ? controlOf(first) : null;
		control?.focus();
		return control !== null;
	}

	function setBusy(on: boolean): void {
		busy = on;
		form.setAttribute('aria-busy', String(on));
		for (const el of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('input, textarea, button')) {
			if (el.type !== 'hidden') el.disabled = on;
		}
		submitLabel.textContent = on ? text('sending') : sendLabel;
		status.textContent = on ? text('sending') : '';
	}

	function formBody(): URLSearchParams {
		const body = new URLSearchParams();
		for (const [key, value] of new FormData(form)) {
			if (typeof value === 'string') body.append(key, value);
		}
		return body;
	}

	async function send(): Promise<void> {
		const body = formBody();
		setBusy(true);
		let result: Result;
		let target = '';
		try {
			const response = await fetch(form.getAttribute('action') ?? '/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body,
				redirect: 'follow',
				credentials: 'same-origin',
				cache: 'no-store'
			});
			result = resultOf(response.url, response.status, location.origin);
			target = response.url;
		} catch {
			result = 'failed';
		}
		if (result === 'sent') {
			location.assign(target);
			return;
		}
		setBusy(false);
		altchaAsked = false;
		// Each challenge is valid for one submission only.
		widget.reset();
		if (result !== 'limit') void widget.verify();
		const shown = showBanner(result);
		if (result === 'invalid' && focusFirstProblem(render())) return;
		shown?.focus();
	}

	widget.addEventListener('statechange', (ev) => {
		altchaState = ((ev as CustomEvent<{ state: AltchaState }>).detail?.state ?? 'unverified') as AltchaState;
		if (altchaState === 'verified') altchaAsked = false;
		const announce: Partial<Record<AltchaState, string>> = {
			verifying: strings.verifying,
			verified: strings.verified,
			error: strings.error,
			expired: strings.expired
		};
		if (!busy) status.textContent = announce[altchaState] ?? '';
		if (submitted) render();
	});

	summaryList.addEventListener('click', (ev) => {
		const link = (ev.target as Element).closest<HTMLAnchorElement>('a[data-field]');
		if (!link) return;
		ev.preventDefault();
		controlOf(link.dataset.field as ErrorKey)?.focus();
	});

	form.addEventListener('input', () => {
		updateCounter();
		render();
	});
	form.addEventListener('change', () => render());

	form.addEventListener('submit', (ev) => {
		ev.preventDefault();
		if (busy) return;
		submitted = true;
		altchaAsked = altchaState !== 'verified';
		showBanner(null);
		const found = render();
		if (Object.keys(found).length > 0) {
			if (found.altcha && altchaState !== 'verifying') void widget.verify();
			banner('summary').hidden = false;
			focusFirstProblem(found);
			return;
		}
		void send();
	});

	updateCounter();
}

const form = document.querySelector<HTMLFormElement>('form[data-contact-form]');
if (form) init(form);
