// Tabs of the phone layout (Rules / Test / Overview / JSON): one panel at a time,
// chosen by data-tab on the playground root. Keys and selection come from the
// shared tabs (../../lib/tabs.ts). The panels are tab panels only while the tab bar
// is shown (phone width); on wider screens every panel is visible and keeps its
// own heading as its label.
import { required } from '../../lib/dom.ts';
import { initTabs } from '../../lib/tabs.ts';

/** Gives the panels the tabpanel role and the tab as label, or restores their own. */
function linkPanels(tabs: HTMLElement[], doc: Document, original: Map<HTMLElement, string | null>, active: boolean): void {
	for (const tab of tabs) {
		const panel = doc.getElementById(tab.getAttribute('aria-controls') ?? '');
		if (!panel) continue;
		if (!original.has(panel)) original.set(panel, panel.getAttribute('aria-labelledby'));
		const label = active ? tab.id : original.get(panel);
		if (active) panel.setAttribute('role', 'tabpanel');
		else panel.removeAttribute('role');
		if (label) panel.setAttribute('aria-labelledby', label);
		else panel.removeAttribute('aria-labelledby');
	}
}

/** Wires the tabs and returns the function that shows one panel by its id. */
export function initPhoneTabs(root: HTMLElement, phone: MediaQueryList, doc: Document = document): (id: string, focus?: boolean) => void {
	const list = required('[role="tablist"]', root);
	const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
	const select = initTabs(list, doc, (tab) => {
		root.dataset.tab = tab.dataset.tabTarget ?? 'rules';
	});
	const original = new Map<HTMLElement, string | null>();
	const sync = (): void => linkPanels(tabs, doc, original, phone.matches);
	phone.addEventListener('change', sync);
	sync();
	return (id, focus = false) => select(Math.max(tabs.findIndex((tab) => tab.dataset.tabTarget === id), 0), focus);
}
