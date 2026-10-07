// 404 page: filters the prerendered list of pages while typing.
import { matches } from '../lib/search.ts';

const input = document.querySelector<HTMLInputElement>('#site-search');
const items = [...document.querySelectorAll<HTMLLIElement>('[data-search]')];
const list = document.querySelector<HTMLElement>('#search-results');
const status = document.querySelector<HTMLElement>('#search-status');

// The page renders the status sentence for every possible number of hits.
const counts = [...document.querySelectorAll<HTMLLIElement>('#search-counts li')].map((li) => li.textContent ?? '');

function statusText(count: number): string {
	return counts[count] ?? '';
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
