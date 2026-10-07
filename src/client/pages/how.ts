// /how-it-works/: path of a request (radio group), mandate views (tabs) and
// the hash chain demo. Everything is readable without this script.
import { initChain, initPath } from '../lib/how.ts';
import { initTabs } from '../lib/tabs.ts';

for (const root of document.querySelectorAll<HTMLElement>('[data-how-path]')) initPath(root);
// Without JavaScript both views are plain sections; with it they become tab panels.
for (const panel of document.querySelectorAll<HTMLElement>('[data-how-tabs] [data-tabpanel-for]')) {
	panel.setAttribute('role', 'tabpanel');
	panel.setAttribute('aria-labelledby', panel.dataset.tabpanelFor ?? '');
	panel.tabIndex = 0;
}
for (const list of document.querySelectorAll<HTMLElement>('[data-how-tabs] [role="tablist"]')) initTabs(list, document);
for (const root of document.querySelectorAll<HTMLElement>('[data-how-chain]')) initChain(root);
