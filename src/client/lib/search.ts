// Search on the 404 page: matches the typed words against page titles and
// descriptions, ignoring case and accents. All words must match.

export function fold(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase();
}

export function matches(query: string, haystack: string): boolean {
	const words = fold(query).split(/\s+/).filter(Boolean);
	if (words.length === 0) return false;
	const text = fold(haystack);
	return words.every((word) => text.includes(word));
}
