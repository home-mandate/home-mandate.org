// /implementations/: the kind filter. Without JavaScript the pills stay hidden
// and every entry is shown; with it, the pills show or hide the table rows and
// the cards (the same entries, for wide and narrow screens), and a live region
// says how many entries are shown.
import { isKindFilter, matchesFilter, parseKinds, shownCount, statusText, type KindFilter } from '../../lib/implement/list.ts';

function applyFilter(doc: Document, filter: KindFilter): void {
	for (const entry of doc.querySelectorAll<HTMLElement>('[data-kinds]')) {
		entry.hidden = !matchesFilter(parseKinds(entry.dataset.kinds), filter);
	}
	const rows = [...doc.querySelectorAll<HTMLElement>('tbody [data-kinds]')].map((row) => parseKinds(row.dataset.kinds));
	const count = shownCount(rows, filter);
	for (const empty of doc.querySelectorAll<HTMLElement>('[data-empty]')) empty.hidden = count > 0;
	for (const button of doc.querySelectorAll<HTMLButtonElement>('button[data-filter]')) {
		button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
	}
	const status = doc.querySelector<HTMLElement>('[data-filter-status]');
	if (status) status.textContent = statusText(status.dataset.template ?? '', count, rows.length);
}

for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-filter]')) {
	button.addEventListener('click', () => {
		const filter = button.dataset.filter;
		if (isKindFilter(filter)) applyFilter(document, filter);
	});
}
