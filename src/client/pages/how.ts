// /how-it-works/: path of a request (radio group), mandate views (tabs) and
// the hash chain demo. Everything is readable without this script.
import { initChain, initPath } from '../lib/how.ts';
import { initTabs } from '../lib/tabs.ts';

for (const root of document.querySelectorAll<HTMLElement>('[data-how-path]')) initPath(root);
for (const list of document.querySelectorAll<HTMLElement>('[data-how-tabs] [role="tablist"]')) initTabs(list, document);
for (const root of document.querySelectorAll<HTMLElement>('[data-how-chain]')) initChain(root);
