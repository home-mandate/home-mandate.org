// Enhancements for <details> popovers (language list, mobile menu). They work
// without JavaScript; this adds Escape, closing on outside clicks, one open at
// a time and, for the full-screen menu, keeping keyboard focus inside.

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function summaryOf(details: HTMLDetailsElement): HTMLElement | null {
	return details.querySelector(':scope > summary');
}

/**
 * Elements Tab reaches inside the open details, summary first. Of a radio
 * group only the checked button is a tab stop, like the browser does it.
 */
export function focusables(details: HTMLDetailsElement): HTMLElement[] {
	return [...details.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
		(el) =>
			(el.closest('details:not([open])') === null || el.parentElement === details) &&
			!(el instanceof HTMLInputElement && el.type === 'radio' && !el.checked)
	);
}

export function initDisclosures(doc: Document): void {
	const all = [...doc.querySelectorAll<HTMLDetailsElement>('details[data-popover]')];
	const root = doc.documentElement;

	for (const details of all) {
		details.addEventListener('toggle', () => {
			if (details.open) for (const other of all) if (other !== details && !other.contains(details)) other.open = false;
			if (details.dataset.popover === 'menu') root.classList.toggle('menu-open', details.open);
		});
		details.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && details.open) {
				event.stopPropagation();
				details.open = false;
				summaryOf(details)?.focus();
				return;
			}
			if (event.key !== 'Tab' || details.dataset.popover !== 'menu' || !details.open) return;
			const items = focusables(details);
			const first = items[0];
			const last = items[items.length - 1];
			if (!first || !last) return;
			if (event.shiftKey && doc.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && doc.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		});
	}

	doc.addEventListener('click', (event) => {
		const target = event.target as Node;
		for (const details of all) if (details.open && !details.contains(target)) details.open = false;
	});
}
