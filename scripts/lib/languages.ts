// Language packs: languages/<tag>/{meta.json,messages.json}.
// Validation is strict because translations arrive as pull requests from
// volunteers and end up in every page of the site.
import { parse as parseIcu, type Token } from '@messageformat/parser';

export type Direction = 'ltr' | 'rtl';

export interface LanguageMeta {
	name: string;
	dir: Direction;
	translators: string[];
}

export interface MessageCheck {
	errors: string[];
	missing: string[];
}

/** Keys with these prefixes must be translated before a language is published. */
export const REQUIRED_PREFIXES = ['site_', 'nav_', 'footer_', 'lang_', 'home_', 'common_'] as const;

const LANGUAGE_TAG = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$/;
const MAX_NAME = 40;
const META_KEYS = new Set(['name', 'dir', 'translators']);
// Control, format (incl. bidi overrides and isolates), private use, surrogates,
// line and paragraph separators: never in text shown to humans. Exceptions that
// scripts need for correct spelling: ZWNJ and ZWJ (Persian, Indic) and the
// directional marks LRM and RLM (U+200C to U+200F).
const FORBIDDEN = /(?![\u200C-\u200F])[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Zl}\p{Zp}]/u;
const HTML = /<\s*\/?\s*[a-zA-Z!?]/;

export function isLanguageTag(tag: string): boolean {
	return LANGUAGE_TAG.test(tag);
}

function checkText(value: string, where: string): string | undefined {
	if (FORBIDDEN.test(value)) return `${where}: forbidden code point (control or format character)`;
	if (HTML.test(value)) return `${where}: HTML is not allowed`;
	return undefined;
}

export function parseMeta(raw: unknown): LanguageMeta {
	if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
		throw new Error('meta.json must be an object');
	}
	const meta = raw as Record<string, unknown>;
	for (const key of Object.keys(meta)) {
		if (!META_KEYS.has(key)) throw new Error(`meta.json: unknown field "${key}"`);
	}
	const { name, dir, translators = [] } = meta;
	if (typeof name !== 'string' || name.trim() === '' || [...name].length > MAX_NAME) {
		throw new Error(`meta.json: name must be 1 to ${MAX_NAME} characters`);
	}
	const nameProblem = checkText(name, 'meta.json name');
	if (nameProblem) throw new Error(nameProblem);
	if (dir !== 'ltr' && dir !== 'rtl') throw new Error('meta.json: dir must be "ltr" or "rtl"');
	if (!Array.isArray(translators) || translators.some((t) => typeof t !== 'string' || t.length > 80)) {
		throw new Error('meta.json: translators must be a list of names');
	}
	for (const t of translators as string[]) {
		const problem = checkText(t, 'meta.json translators');
		if (problem) throw new Error(problem);
	}
	return { name, dir, translators: translators as string[] };
}

/** Sorted, unique ICU argument names of a message. */
export function placeholders(message: string): string[] {
	const names = new Set<string>();
	const visit = (tokens: Token[]): void => {
		for (const token of tokens) {
			if (token.type === 'argument' || token.type === 'function') names.add(token.arg);
			if (token.type === 'plural' || token.type === 'select' || token.type === 'selectordinal') {
				names.add(token.arg);
				for (const c of token.cases) visit(c.tokens);
			}
		}
	};
	visit(parseIcu(message));
	return [...names].sort();
}

function isRequired(key: string): boolean {
	return REQUIRED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function checkMessages(
	tag: string,
	base: Record<string, unknown>,
	messages: Record<string, unknown>
): MessageCheck {
	const errors: string[] = [];
	const missing: string[] = [];
	if (!isPlainObject(messages)) return { errors: [`${tag}/messages.json: must be a JSON object`], missing };
	for (const [key, value] of Object.entries(messages)) {
		if (key === '$schema') continue;
		const where = `${tag}/${key}`;
		if (!Object.hasOwn(base, key)) {
			errors.push(`${where}: unknown key (not in en)`);
			continue;
		}
		if (typeof value !== 'string') {
			errors.push(`${where}: value must be a string`);
			continue;
		}
		const problem = checkText(value, where);
		if (problem) {
			errors.push(problem);
			continue;
		}
		let own: string[];
		try {
			own = placeholders(value);
		} catch (e) {
			errors.push(`${where}: invalid ICU message (${(e as Error).message})`);
			continue;
		}
		const expected = placeholders(String(base[key]));
		if (own.join(',') !== expected.join(',')) {
			errors.push(`${where}: placeholders {${own.join('}, {')}} differ from en {${expected.join('}, {')}}`);
		}
		const ownLinks = linkTargets(value).join(' ');
		const baseLinks = linkTargets(String(base[key])).join(' ');
		if (ownLinks !== baseLinks) errors.push(`${where}: links [..](${ownLinks}) differ from en [..](${baseLinks})`);
	}
	for (const key of Object.keys(base)) {
		if (key === '$schema' || Object.hasOwn(messages, key)) continue;
		if (isRequired(key)) errors.push(`${tag}/${key}: required key is missing`);
		else missing.push(key);
	}
	return { errors, missing };
}

export function mergeWithBase(
	base: Record<string, unknown>,
	messages: Record<string, unknown>
): Record<string, unknown> {
	const merged: Record<string, unknown> = { ...base, ...messages };
	delete merged.$schema;
	return merged;
}

// Inline links in messages are written [text](target). Translations must keep
// exactly the link targets of the English text: a language pack cannot add
// links to other sites.
const LINK = /\[[^\]]*\]\(([^)\s]*)\)/g;

/**
 * Sorted link targets of a message. Sorted, not in order: a translation may
 * reorder a sentence and with it the links. Which text goes with which link
 * is checked by reading the translation in review.
 */
export function linkTargets(message: string): string[] {
	return [...message.matchAll(LINK)].map((m) => m[1] ?? '').sort();
}

export interface PackFile {
	name: string;
	content: unknown;
}

/** One catalogue from messages.json and pages/*.json; a key may appear only once. */
export function combineFiles(tag: string, files: PackFile[]): { messages: Record<string, unknown>; errors: string[] } {
	const messages: Record<string, unknown> = {};
	const seen = new Map<string, string>();
	const errors: string[] = [];
	for (const file of files) {
		if (!isPlainObject(file.content)) {
			errors.push(`${tag}/${file.name}: must be a JSON object`);
			continue;
		}
		for (const [key, value] of Object.entries(file.content)) {
			if (key === '$schema') continue;
			const other = seen.get(key);
			if (other !== undefined) {
				errors.push(`${tag}/${file.name}: key ${key} is already defined in ${other}`);
				continue;
			}
			seen.set(key, file.name);
			messages[key] = value;
		}
	}
	return { messages, errors };
}

/** Share of the English keys a language translates, in whole percent (rounded down). */
export function coverage(base: Record<string, unknown>, messages: Record<string, unknown>): number {
	const keys = Object.keys(base).filter((k) => k !== '$schema');
	if (keys.length === 0) return 100;
	const done = keys.filter((k) => Object.hasOwn(messages, k)).length;
	return Math.floor((done * 100) / keys.length);
}
