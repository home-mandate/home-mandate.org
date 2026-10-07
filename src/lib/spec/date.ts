// Release dates (YYYY-MM-DD) as text in the language of the page.

/** "5 October 2026" / "5. Oktober 2026"; English uses day-month order like the design. */
export function formatDate(date: string, locale: string): string {
	const tag = locale === 'en' ? 'en-GB' : locale;
	return new Intl.DateTimeFormat(tag, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

/** RFC 3339 timestamp at midnight UTC of the date (Atom needs a full timestamp). */
export function atomDate(date: string): string {
	return `${date}T00:00:00Z`;
}
