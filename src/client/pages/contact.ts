// Contact form: client-side checks (the same rules as the server), ALTCHA,
// sending with fetch and showing the outcome. Without JavaScript the page
// shows the e-mail address instead of the form (.js-only / .no-js-only).
// The pieces live in ../contact/: elements, banners, error display, sending.
import { altchaCheckbox, altchaStrings, createAltcha, type AltchaState, type AltchaWidget } from '../lib/altcha.ts';
import { counterLevel, messageLength, validate, type Field } from '../../lib/contact/validate.ts';
import { banner, showBanner } from '../contact/banners.ts';
import { findElements, type ContactElements } from '../contact/elements.ts';
import { focusFirstProblem, renderErrors, type ErrorKey, type ErrorView, type Found } from '../contact/errors.ts';
import { formBody, post, setBusy } from '../contact/send.ts';

interface Contact {
	els: ContactElements;
	widget: AltchaWidget;
	/** Announcements of the ALTCHA states. */
	strings: ReturnType<typeof altchaStrings>;
	view: ErrorView;
	altchaState: AltchaState;
	submitted: boolean;
	/** The ALTCHA error shows only after a submit that found the check unfinished. */
	altchaAsked: boolean;
	busy: boolean;
}

function create(form: HTMLFormElement): Contact {
	const els = findElements(form);
	const strings = altchaStrings(els.altchaSlot);
	const widget = createAltcha(els.altchaSlot, form.dataset.worker ?? '');
	const fields: Record<Field, HTMLElement> = { name: els.name, email: els.email, message: els.message, privacy: els.privacy };
	const view: ErrorView = {
		els,
		numbers: new Intl.NumberFormat(document.documentElement.lang || 'en'),
		controlOf: (key) => (key === 'altcha' ? altchaCheckbox(widget) : fields[key])
	};
	return { els, widget, strings, view, altchaState: 'unverified', submitted: false, altchaAsked: false, busy: false };
}

/** Current problems: the field rules, plus ALTCHA once the form was submitted. */
function problems(c: Contact): Found {
	const { name, email, message, privacy } = c.els;
	const found: Found = validate({ name: name.value, email: email.value, message: message.value, privacy: privacy.checked });
	if (c.altchaAsked && c.altchaState !== 'verified') found.altcha = 'altcha';
	return found;
}

function render(c: Contact): Found {
	const found = problems(c);
	renderErrors(c.view, found, c.submitted);
	return found;
}

/** The counter counts what validation counts: the normalized (trimmed) message. */
function updateCounter(c: Contact): void {
	const count = messageLength(c.els.message.value);
	c.els.countValue.textContent = c.view.numbers.format(count);
	c.els.counter.dataset.level = counterLevel(count);
}

function setSending(c: Contact, on: boolean): void {
	c.busy = on;
	setBusy(c.els, on);
}

async function send(c: Contact): Promise<void> {
	const body = formBody(c.els.form);
	setSending(c, true);
	const { result, target } = await post(c.els.form, body);
	if (result === 'sent') {
		location.assign(target);
		return;
	}
	setSending(c, false);
	c.altchaAsked = false;
	// Each challenge is valid for one submission only.
	c.widget.reset();
	if (result !== 'limit') void c.widget.verify();
	const shown = showBanner(c.els.area, result);
	if (result === 'invalid' && focusFirstProblem(c.view, render(c))) return;
	shown?.focus();
}

function onAltchaState(c: Contact, state: AltchaState): void {
	c.altchaState = state;
	if (state === 'verified') c.altchaAsked = false;
	const { strings } = c;
	const announce: Partial<Record<AltchaState, string>> = {
		verifying: strings.verifying,
		verified: strings.verified,
		error: strings.error,
		expired: strings.expired
	};
	if (!c.busy) c.els.status.textContent = announce[state] ?? '';
	if (c.submitted) render(c);
}

function onSubmit(c: Contact): void {
	if (c.busy) return;
	c.submitted = true;
	c.altchaAsked = c.altchaState !== 'verified';
	showBanner(c.els.area, null);
	const found = render(c);
	if (Object.keys(found).length === 0) {
		void send(c);
		return;
	}
	if (found.altcha && c.altchaState !== 'verifying') void c.widget.verify();
	banner(c.els.area, 'summary').hidden = false;
	focusFirstProblem(c.view, found);
}

function init(form: HTMLFormElement): void {
	const c = create(form);
	c.widget.addEventListener('statechange', (ev) => {
		onAltchaState(c, ((ev as CustomEvent<{ state: AltchaState }>).detail?.state ?? 'unverified') as AltchaState);
	});
	c.els.summaryList.addEventListener('click', (ev) => {
		const link = (ev.target as Element).closest<HTMLAnchorElement>('a[data-field]');
		if (!link) return;
		ev.preventDefault();
		c.view.controlOf(link.dataset.field as ErrorKey)?.focus();
	});
	form.addEventListener('input', () => {
		updateCounter(c);
		render(c);
	});
	form.addEventListener('change', () => render(c));
	form.addEventListener('submit', (ev) => {
		ev.preventDefault();
		onSubmit(c);
	});
	updateCounter(c);
}

const form = document.querySelector<HTMLFormElement>('form[data-contact-form]');
if (form) init(form);
