// What search engines and link previews read besides the page itself:
// schema.org data (JSON-LD) and the Open Graph locale and share image.
import { SITE_REPOSITORY, SITE_URL, SPEC_REPOSITORY } from './site';

type Ld = Record<string, unknown>;

// One organisation behind site and specification; every block names it by @id.
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const ORGANIZATION: Ld = {
	'@type': 'Organization',
	'@id': ORGANIZATION_ID,
	name: 'Home-Mandate',
	url: `${SITE_URL}/`,
	logo: `${SITE_URL}/icons/icon-512.png`,
	sameAs: ['https://github.com/home-mandate', SPEC_REPOSITORY, SITE_REPOSITORY]
};
const WEBSITE: Ld = { '@type': 'WebSite', name: 'Home-Mandate', url: `${SITE_URL}/` };
const SPEC_LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
// Languages with their own share image under static/og/<tag>.png.
const OG_IMAGES = ['en', 'de'];
// Country for languages whose tag names none (Open Graph wants language_TERRITORY).
const OG_TERRITORY: Record<string, string> = { en: 'US' };

/**
 * A <script type="application/ld+json"> element. "<" is escaped, so no text
 * inside can end the element or open a comment; the CSP does not apply to
 * data blocks, the browser never runs them.
 */
export function jsonLdScript(data: Ld): string {
	const json = JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}

export function websiteLd(site: { name: string; description: string; url: string; locale: string }): Ld {
	return { '@type': 'WebSite', name: site.name, description: site.description, url: site.url, inLanguage: site.locale, publisher: ORGANIZATION };
}

export function faqPageLd(items: { q: string; a: string }[]): Ld {
	return {
		'@type': 'FAQPage',
		mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
	};
}

/**
 * A release of the specification; its text is English only. url is the page's
 * own address (also under /de/). A release does not change after its date.
 */
export function specLd(spec: { title: string; url: string; version: string; date?: string; description?: string; source?: string }): Ld {
	return {
		'@type': 'TechArticle',
		headline: spec.title,
		url: spec.url,
		version: spec.version,
		...(spec.description ? { description: spec.description } : {}),
		...(spec.date ? { datePublished: spec.date, dateModified: spec.date } : {}),
		inLanguage: 'en',
		license: SPEC_LICENSE,
		...(spec.source ? { isBasedOn: spec.source } : {}),
		isPartOf: WEBSITE,
		author: { '@id': ORGANIZATION_ID },
		publisher: ORGANIZATION
	};
}

/** The trail from the home page to the current page, as shown in breadcrumbs. */
export function breadcrumbLd(items: { name: string; url: string }[]): Ld {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url }))
	};
}

/** The glossary: every term with its code in the specification and its definition. */
export function definedTermSetLd(set: { name: string; url: string; locale: string; terms: { term: string; code: string; def: string }[] }): Ld {
	return {
		'@type': 'DefinedTermSet',
		name: set.name,
		url: set.url,
		inLanguage: set.locale,
		hasDefinedTerm: set.terms.map((t) => ({ '@type': 'DefinedTerm', name: t.term, termCode: t.code, description: t.def }))
	};
}

/** Open Graph locale of a language tag: de -> de_DE, pt-BR -> pt_BR. */
export function ogLocale(tag: string): string {
	const [language = tag, territory] = tag.split('-');
	return `${language}_${(territory ?? OG_TERRITORY[language] ?? language).toUpperCase()}`;
}

export function ogImage(tag: string): string {
	return `${SITE_URL}/og/${OG_IMAGES.includes(tag) ? tag : 'en'}.png`;
}
