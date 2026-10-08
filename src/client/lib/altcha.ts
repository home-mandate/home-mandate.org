// ALTCHA proof-of-work widget, "external" build: no injected styles (the page
// links altcha.css as a file) and no bundled workers. The only algorithm
// registered is the one our server issues, PBKDF2/SHA-256; it is solved with
// WebCrypto in a worker loaded from our own origin (CSP worker-src 'self'):
// no blob: or data: workers, no WebAssembly.
import 'altcha/external';

export type AltchaState = 'unverified' | 'verifying' | 'verified' | 'error' | 'expired' | 'code';

export interface AltchaWidget extends HTMLElement {
	reset(): void;
	verify(): Promise<unknown>;
	getState(): AltchaState;
}

interface AltchaGlobal {
	algorithms: Map<string, () => Worker>;
	defaults: { set(values: Record<string, unknown>): void };
	i18n: { set(language: string, strings: Record<string, string>): void };
}

const ALGORITHM = 'PBKDF2/SHA-256';
const WORKER_PATH = /^\/js\/[\w.-]+\.js$/;

function escapeHtml(text: string): string {
	return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Creates the widget inside the slot. Settings are fixed before the element
 * exists: no logo link, no interaction recording ("human interaction
 * signature"), no cookie; the payload goes into a hidden input "altcha".
 */
export function createAltcha(slot: HTMLElement, workerUrl: string): AltchaWidget {
	if (!WORKER_PATH.test(workerUrl)) throw new Error('ALTCHA worker must be a script of this site');
	const altcha = (globalThis as unknown as { $altcha: AltchaGlobal }).$altcha;
	altcha.algorithms.clear();
	altcha.algorithms.set(ALGORITHM, () => new Worker(workerUrl, { type: 'module', name: 'altcha' }));
	altcha.defaults.set({ hideLogo: true, humanInteractionSignature: false, setCookie: null, verifyUrl: '' });

	const language = slot.dataset.language ?? 'en';
	const strings = JSON.parse(slot.dataset.strings ?? '{}') as Record<string, string>;
	// The widget renders the footer as HTML; our text is plain.
	altcha.i18n.set(language, { ...strings, footer: escapeHtml(strings.footer ?? '') });

	const widget = document.createElement('altcha-widget') as AltchaWidget;
	widget.setAttribute('challenge', slot.dataset.challenge ?? '');
	widget.setAttribute('auto', 'onfocus');
	widget.setAttribute('language', language);
	widget.setAttribute('name', 'altcha');
	slot.append(widget);
	return widget;
}

/** The widget's own checkbox (focus target, error description). */
export function altchaCheckbox(widget: AltchaWidget): HTMLInputElement | null {
	return widget.querySelector('input[type="checkbox"]');
}

export function altchaStrings(slot: HTMLElement): Record<string, string> {
	return JSON.parse(slot.dataset.strings ?? '{}') as Record<string, string>;
}
