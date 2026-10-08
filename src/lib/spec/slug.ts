// Heading anchors exactly as GitHub makes them, so that links into the
// specification work the same on GitHub and on this site
// (e.g. "## 3. Data model" -> #3-data-model).

// Everything GitHub keeps: letters, marks, numbers, connector punctuation
// (underscore), hyphen and space. All other characters are removed.
const REMOVE = /[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu;

/** Slug of one heading text, without de-duplication. */
export function slugify(text: string): string {
	return text.toLowerCase().replace(REMOVE, '').replace(/ /g, '-');
}

/** Slugs of a whole document: repeated headings get -1, -2, ... like on GitHub. */
export function createSlugger(): (text: string) => string {
	const seen = new Map<string, number>();
	return (text) => {
		const base = slugify(text);
		let slug = base;
		let count = seen.get(base) ?? 0;
		while (seen.has(slug)) slug = `${base}-${++count}`;
		seen.set(base, count);
		seen.set(slug, 0);
		return slug;
	};
}
