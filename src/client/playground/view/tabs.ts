// Tabs of the phone layout (Rules / Test / Overview / JSON): one panel at a time,
// chosen by data-tab on the playground root; arrow keys, Home and End move.
const TABS = ['rules', 'test', 'overview', 'json'] as const;

/** Wires the tabs and returns the function that shows one. */
export function initTabs(root: HTMLElement): (id: string, focus?: boolean) => void {
	const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
	const show = (id: string, focus = false): void => {
		root.dataset.tab = id;
		for (const tab of tabs) {
			const active = tab.dataset.tabTarget === id;
			tab.setAttribute('aria-selected', String(active));
			tab.tabIndex = active ? 0 : -1;
			if (active && focus) tab.focus();
		}
	};
	for (const tab of tabs) {
		tab.addEventListener('click', () => show(tab.dataset.tabTarget ?? 'rules'));
		tab.addEventListener('keydown', (event) => {
			const i = TABS.indexOf((tab.dataset.tabTarget ?? 'rules') as (typeof TABS)[number]);
			const rtl = document.documentElement.dir === 'rtl';
			const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, Home: -i, End: TABS.length - 1 - i }[event.key];
			if (step === undefined) return;
			event.preventDefault();
			show(TABS[(i + step + TABS.length) % TABS.length] ?? 'rules', true);
		});
	}
	return show;
}
