// Fixed facts about the site and links into the specification repository.
import { spec } from '$lib/generated/spec';

export const SITE_URL = 'https://mandate-spec.org';
export const SITE_REPOSITORY = 'https://github.com/mandate-spec/mandate-spec.org';

/** Link to a file (optionally a heading) of the specification at the imported release. */
export function specUrl(file = '', anchor = ''): string {
	const base = `${spec.repository}/blob/${spec.latest.tag}/${file}`;
	return anchor === '' ? base : `${base}#${anchor}`;
}

export const SPEC_REPOSITORY = spec.repository;
export const SECURITY_URL = `${spec.repository}/security/advisories/new`;
