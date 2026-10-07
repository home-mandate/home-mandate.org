// Legal texts (privacy policy, imprint). German is legally binding; English is
// a translation; every other language shows the English text. They are not
// part of the language packs: volunteers do not translate legal texts.
import imprintDe from './imprint-de.json';
import imprintEn from './imprint-en.json';
import privacyDe from './privacy-de.json';
import privacyEn from './privacy-en.json';

export type LegalBlock =
	| { h2: string }
	| { h3: string }
	| { p: string; caps?: boolean }
	| { ul: string[] }
	| { toc: string }
	| { legal: [string, string][] }
	| { callout: string; title: string; text: string };

export interface LegalText {
	title: string;
	intro: string;
	blocks: LegalBlock[];
}

const TEXTS = {
	privacy: { de: privacyDe, en: privacyEn },
	imprint: { de: imprintDe, en: imprintEn }
} as Record<'privacy' | 'imprint', Record<'de' | 'en', LegalText>>;

/** The text and its language (the page marks it with lang= when it differs from the UI). */
export function legalText(page: 'privacy' | 'imprint', locale: string): { lang: 'de' | 'en'; text: LegalText } {
	const lang = locale === 'de' ? 'de' : 'en';
	return { lang, text: TEXTS[page][lang] };
}

/** Anchor of a heading: lower case, digits and letters (incl. umlauts) joined by "-". */
export function headingId(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/ß/g, 'ss')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
