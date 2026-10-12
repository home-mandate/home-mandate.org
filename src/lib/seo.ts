// What search engines and link previews read besides the page itself:
// schema.org data (JSON-LD) and the Open Graph locale and share image.
import { SITE_URL } from './site';

type Ld = Record<string, unknown>;

const ORGANIZATION: Ld = {
	'@type': 'Organization',
	name: 'Home-Mandate',
	url: `${SITE_URL}/`,
	sameAs: ['https://github.com/home-mandate']
};
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

/** A release of the specification; its text is English only. */
export function specLd(spec: { title: string; url: string; version: string; date?: string }): Ld {
	return {
		'@type': 'TechArticle',
		headline: spec.title,
		url: spec.url,
		version: spec.version,
		...(spec.date ? { datePublished: spec.date } : {}),
		inLanguage: 'en',
		license: SPEC_LICENSE,
		publisher: ORGANIZATION
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
