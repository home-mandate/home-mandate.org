// WAI-ARIA tabs (automatic activation): arrow keys move between tabs, Home and
// End jump to the first and last. The panels are complete HTML; without
// JavaScript every panel is shown, one after the other.

/** The tab index a key leads to, or undefined if the key does not move. */
export function nextTab(key: string, index: number, count: number, rtl = false): number | undefined {
	if (count <= 0) return undefined;
	const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
	const back = rtl ? 'ArrowRight' : 'ArrowLeft';
	if (key === forward) return (index + 1) % count;
	if (key === back) return (index - 1 + count) % count;
	if (key === 'Home') return 0;
	if (key === 'End') return count - 1;
	return undefined;
}

/** Selects one tab: aria-selected, roving tabindex, data-active on its panel. */
export function selectTab(tabs: HTMLElement[], index: number, doc: Document): void {
	tabs.forEach((tab, i) => {
		const active = i === index;
		tab.setAttribute('aria-selected', String(active));
		tab.tabIndex = active ? 0 : -1;
		const panel = doc.getElementById(tab.getAttribute('aria-controls') ?? '');
		panel?.toggleAttribute('data-active', active);
	});
}

export function initTabs(list: HTMLElement, doc: Document): void {
	const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
	tabs.forEach((tab, i) => {
		tab.addEventListener('click', () => selectTab(tabs, i, doc));
		tab.addEventListener('keydown', (event) => {
			const next = nextTab(event.key, i, tabs.length, getComputedStyle(list).direction === 'rtl');
			if (next === undefined) return;
			event.preventDefault();
			selectTab(tabs, next, doc);
			tabs[next]?.focus();
		});
	});
}
