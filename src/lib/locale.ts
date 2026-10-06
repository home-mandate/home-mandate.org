// Language helpers on top of the Paraglide runtime.
import { languages, type Language } from '$lib/generated/languages';
import { deLocalizeHref, localizeHref } from '$lib/paraglide/runtime';
import { SITE_URL } from '$lib/site';

export type { Language };
export { languages };

/** Path of the current page without its language prefix, e.g. /de/imprint/ -> /imprint/. */
export function basePath(pathname: string): string {
	return deLocalizeHref(pathname);
}

/** The same page in another language, as a path. */
export function pathIn(pathname: string, tag: string): string {
	return localizeHref(basePath(pathname), { locale: tag as never });
}

/** Absolute URL of the same page in another language (hreflang, canonical). */
export function urlIn(pathname: string, tag: string): string {
	return `${SITE_URL}${pathIn(pathname, tag)}`;
}

export function language(tag: string): Language | undefined {
	return languages.find((l) => l.tag === tag);
}
