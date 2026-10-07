// Behaviour shared by every page. Pages render complete HTML without
// JavaScript; this only adds what cannot work without it.
import { initCopy } from './lib/copy.ts';
import { initDisclosures } from './lib/disclosure.ts';
import { applyTheme, isTheme, localStore, readTheme, storeTheme } from './lib/theme.ts';

function initTheme(doc: Document): void {
	const inputs = [...doc.querySelectorAll<HTMLInputElement>('input[data-theme-choice]')];
	const sync = (theme: string): void => {
		for (const input of inputs) input.checked = input.value === theme;
	};
	sync(readTheme(localStore()));
	for (const input of inputs) {
		input.addEventListener('change', () => {
			if (!input.checked || !isTheme(input.value)) return;
			applyTheme(doc.documentElement, input.value);
			storeTheme(localStore(), input.value);
			sync(input.value);
		});
	}
}

/** FAQ and other anchored <details>: open the one the address points to. */
function openTarget(doc: Document): void {
	const id = decodeURIComponent(doc.location.hash.slice(1));
	if (id === '') return;
	const target = doc.getElementById(id);
	const details = target?.closest('details') ?? (target instanceof HTMLDetailsElement ? target : null);
	if (details) details.open = true;
}

initTheme(document);
initDisclosures(document);
initCopy(document);
openTarget(document);
window.addEventListener('hashchange', () => openTarget(document));
