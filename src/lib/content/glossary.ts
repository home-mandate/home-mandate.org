// A–Z index of the glossary in the reader's language.

export interface Entry<T> {
	term: string;
	item: T;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** First letter without accents, upper case; '#' for anything outside A–Z. */
export function initial(term: string): string {
	const first = term.normalize('NFD').replace(/\p{M}/gu, '').charAt(0).toUpperCase();
	return LETTERS.includes(first) ? first : '#';
}

/** Entries sorted by term (locale-aware) and grouped by initial. */
export function groupByInitial<T>(entries: Entry<T>[], locale: string): { letter: string; entries: Entry<T>[] }[] {
	const sorted = [...entries].sort((a, b) => a.term.localeCompare(b.term, locale));
	const groups = new Map<string, Entry<T>[]>();
	for (const entry of sorted) {
		const letter = initial(entry.term);
		groups.set(letter, [...(groups.get(letter) ?? []), entry]);
	}
	return [...groups].map(([letter, list]) => ({ letter, entries: list }));
}

export const ALPHABET = LETTERS;
