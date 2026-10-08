// Fixed facts about the site and links into the specification repository.
import { spec } from '$lib/generated/spec';

export const SITE_URL = 'https://home-mandate.org';
export const SITE_REPOSITORY = 'https://github.com/home-mandate/home-mandate.org';
/** Where implementations are listed; additions come as pull requests against this file. */
export const IMPLEMENTATIONS_FILE_URL = `${SITE_REPOSITORY}/blob/main/src/lib/content/implementations.ts`;
export const TRANSLATING_URL = `${SITE_REPOSITORY}/blob/main/TRANSLATING.md`;
export const CONTACT_EMAIL = 'contact@home-mandate.org';

/** Link to a file (optionally a heading) of the specification at the imported release. */
export function specUrl(file = '', anchor = ''): string {
	const base = `${spec.repository}/blob/${spec.latest.tag}/${file}`;
	return anchor === '' ? base : `${base}#${anchor}`;
}

export const SPEC_REPOSITORY = spec.repository;
export const SECURITY_URL = `${spec.repository}/security/advisories/new`;
