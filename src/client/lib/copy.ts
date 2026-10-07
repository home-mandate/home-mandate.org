// Copy buttons: <button data-copy="text"> or data-copy-target="#id" (copies the
// element's text). Shows the "copied" state for two seconds; the status text
// lives in an aria-live region inside the button's group.

export const COPIED_MS = 2000;

export function textToCopy(button: HTMLElement, doc: Document): string | undefined {
	if (button.dataset.copy !== undefined) return button.dataset.copy;
	const selector = button.dataset.copyTarget;
	if (!selector?.startsWith('#')) return undefined;
	return doc.getElementById(selector.slice(1))?.textContent ?? undefined;
}

export function initCopy(doc: Document): void {
	for (const button of doc.querySelectorAll<HTMLButtonElement>('[data-copy], [data-copy-target]')) {
		button.addEventListener('click', async () => {
			const text = textToCopy(button, doc);
			if (text === undefined) return;
			try {
				await navigator.clipboard.writeText(text);
			} catch {
				return;
			}
			button.dataset.copied = 'true';
			const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
			if (status) status.textContent = status.dataset.copyStatus ?? '';
			setTimeout(() => {
				delete button.dataset.copied;
				if (status) status.textContent = '';
			}, COPIED_MS);
		});
	}
}
