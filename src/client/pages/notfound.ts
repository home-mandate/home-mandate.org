// 404 page: filters the prerendered list of pages while typing.
import { matches } from '../lib/search.ts';

const input = document.querySelector<HTMLInputElement>('#site-search');
const items = [...document.querySelectorAll<HTMLLIElement>('[data-search]')];
const list = document.querySelector<HTMLElement>('#search-results');
const status = document.querySelector<HTMLElement>('#search-status');

/** Prerendered texts for 0, 1 and n results; the n form holds the example number 2. */
function statusText(count: number): string {
	if (!status) return '';
	if (count === 0) return status.dataset.none ?? '';
	if (count === 1) return status.dataset.one ?? '';
	return (status.dataset.other ?? '').replace(/\d+/, String(count));
}

input?.addEventListener('input', () => {
	const query = input.value.trim();
	let count = 0;
	for (const item of items) {
		const hit = matches(query, item.dataset.search ?? '');
		item.hidden = !hit;
		if (hit) count++;
	}
	if (list) list.hidden = query === '';
	if (status) status.textContent = query === '' ? '' : statusText(count);
});
