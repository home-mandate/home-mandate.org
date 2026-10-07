// Copy buttons: <button data-copy="text"> or data-copy-target="#id" (copies the
// element's text, or the current value of a form field). The outcome shows on
// the button for a while: data-copied after success, data-copy-failed when the
// Clipboard API is missing or refuses. The status text lives in an aria-live
// region inside the button's group: data-copy-status (copied) and
// data-copy-failed-status (failed) hold the two texts.

export const COPIED_MS = 2000;
/** A failure stays longer: the reader has to do something about it. */
export const FAILED_MS = 6000;

export type CopyOutcome = 'copied' | 'failed';

export function textToCopy(button: HTMLElement, doc: Document): string | undefined {
	if (button.dataset.copy !== undefined) return button.dataset.copy;
	const selector = button.dataset.copyTarget;
	if (!selector?.startsWith('#')) return undefined;
	const target = doc.getElementById(selector.slice(1));
	if (!target) return undefined;
	// A form field's text is its value; its content is only the initial text.
	if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return (target as HTMLTextAreaElement).value;
	return target.textContent ?? undefined;
}

/** Writes the text to the clipboard; 'failed' without a Clipboard API or when it refuses. */
export async function writeClipboard(text: string, clipboard: Pick<Clipboard, 'writeText'> | undefined): Promise<CopyOutcome> {
	if (!clipboard) return 'failed';
	try {
		await clipboard.writeText(text);
		return 'copied';
	} catch {
		return 'failed';
	}
}

/** The status text of an outcome, from the data attributes of the live region. */
export function statusText(status: Pick<HTMLElement, 'dataset'>, outcome: CopyOutcome): string {
	return (outcome === 'copied' ? status.dataset.copyStatus : status.dataset.copyFailedStatus) ?? '';
}

const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

/** Shows the outcome on the button and in its status region, then returns to idle. */
export function showOutcome(button: HTMLElement, outcome: CopyOutcome): void {
	const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
	clearTimeout(timers.get(button));
	delete button.dataset.copied;
	delete button.dataset.copyFailed;
	button.dataset[outcome === 'copied' ? 'copied' : 'copyFailed'] = 'true';
	if (status) status.textContent = statusText(status, outcome);
	const reset = (): void => {
		delete button.dataset.copied;
		delete button.dataset.copyFailed;
		if (status) status.textContent = '';
	};
	timers.set(button, setTimeout(reset, outcome === 'copied' ? COPIED_MS : FAILED_MS));
}

export function initCopy(doc: Document): void {
	for (const button of doc.querySelectorAll<HTMLButtonElement>('[data-copy], [data-copy-target]')) {
		button.addEventListener('click', async () => {
			const text = textToCopy(button, doc);
			if (text === undefined) return;
			showOutcome(button, await writeClipboard(text, navigator.clipboard));
		});
	}
}
