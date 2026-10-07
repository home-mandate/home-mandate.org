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

/**
 * Link target for a page in the current language. Only site pages get the
 * language prefix; files (/mandate/v0/mandate.schema.json), anchors and
 * external URLs stay as they are.
 */
export function localHref(target: string, tag: string): string {
	if (!target.startsWith('/') || target.startsWith('//')) return target;
	const [path = '', hash] = target.split('#');
	if (/\.[a-z0-9]+$/i.test(path)) return target;
	const localized = pathIn(path, tag);
	return hash === undefined ? localized : `${localized}#${hash}`;
}
