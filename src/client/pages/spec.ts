// Specification reader: marks the section in view in the table of contents,
// the breadcrumbs and the phone bar, closes the phone table of contents after
// a jump and opens the print dialog. The page is complete without this.
import { activeIndex } from '../lib/active-section.ts';

// Reading line below the top of the viewport (clears the sticky phone bar).
const READING_LINE = 96;

interface Section {
	id: string;
	heading: HTMLElement;
	number: string;
	text: string;
}

function sections(doc: Document): Section[] {
	const seen = new Set<string>();
	const out: Section[] = [];
	for (const link of doc.querySelectorAll<HTMLAnchorElement>('[data-spec-toc] a[data-toc-target]')) {
		const id = link.dataset.tocTarget ?? '';
		const heading = doc.getElementById(id);
		if (seen.has(id) || !heading) continue;
		seen.add(id);
		const number = link.querySelector('.num')?.textContent ?? '';
		const text = link.querySelector('.text')?.textContent ?? '';
		out.push({ id, heading, number, text });
	}
	return out;
}

function initActiveSection(doc: Document): void {
	const all = sections(doc);
	if (all.length === 0) return;
	const links = [...doc.querySelectorAll<HTMLAnchorElement>('[data-spec-toc] a[data-toc-target]')];
	const titles = [...doc.querySelectorAll<HTMLElement>('[data-spec-current]')];
	const numbers = [...doc.querySelectorAll<HTMLElement>('[data-spec-current-num]')];
	let current = '';

	const update = (): void => {
		const section = all[activeIndex(all.map((s) => s.heading.getBoundingClientRect().top), READING_LINE)];
		if (!section || section.id === current) return;
		current = section.id;
		for (const link of links) {
			if (link.dataset.tocTarget === section.id) link.setAttribute('aria-current', 'location');
			else link.removeAttribute('aria-current');
		}
		for (const title of titles) title.textContent = section.text;
		for (const number of numbers) number.textContent = section.number === '' ? '' : `${section.number} `;
	};

	let pending = false;
	const schedule = (): void => {
		if (pending) return;
		pending = true;
		requestAnimationFrame(() => {
			pending = false;
			update();
		});
	};
	const observer = new IntersectionObserver(schedule, { rootMargin: `-${READING_LINE}px 0px 0px 0px`, threshold: [0, 1] });
	for (const s of all) observer.observe(s.heading);
	window.addEventListener('hashchange', schedule);
	update();
}

function initPhoneContents(doc: Document): void {
	const sheet = doc.querySelector<HTMLDetailsElement>('details.toc-sheet');
	if (!sheet) return;
	sheet.addEventListener('click', (event) => {
		if ((event.target as Element).closest('a')) sheet.open = false;
	});
}

function initPrint(doc: Document): void {
	for (const button of doc.querySelectorAll<HTMLButtonElement>('[data-spec-print]')) {
		button.addEventListener('click', () => window.print());
	}
}

initActiveSection(document);
initPhoneContents(document);
initPrint(document);
