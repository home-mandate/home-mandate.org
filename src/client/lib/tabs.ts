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

/** Called after a tab was selected, with the tab and its index. */
export type OnSelect = (tab: HTMLElement, index: number) => void;

/**
 * Wires the tabs of a tablist and returns the function that selects one by index
 * (and focuses it on request). onSelect lets a page react, e.g. by switching layout.
 */
export function initTabs(list: HTMLElement, doc: Document, onSelect?: OnSelect): (index: number, focus?: boolean) => void {
	const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
	const select = (index: number, focus = false): void => {
		const tab = tabs[index];
		if (!tab) return;
		selectTab(tabs, index, doc);
		onSelect?.(tab, index);
		if (focus) tab.focus();
	};
	tabs.forEach((tab, i) => {
		tab.addEventListener('click', () => select(i));
		tab.addEventListener('keydown', (event) => {
			const next = nextTab(event.key, i, tabs.length, getComputedStyle(list).direction === 'rtl');
			if (next === undefined) return;
			event.preventDefault();
			select(next, true);
		});
	});
	return select;
}
