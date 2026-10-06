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
// line and paragraph separators: never in text shown to humans.
const FORBIDDEN = /[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Zl}\p{Zp}]/u;
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

export function checkMessages(
	tag: string,
	base: Record<string, unknown>,
	messages: Record<string, unknown>
): MessageCheck {
	const errors: string[] = [];
	const missing: string[] = [];
	for (const [key, value] of Object.entries(messages)) {
		if (key === '$schema') continue;
		const where = `${tag}/${key}`;
		if (!(key in base)) {
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
	}
	for (const key of Object.keys(base)) {
		if (key === '$schema' || key in messages) continue;
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
