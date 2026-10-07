// Client-side checks of the contact form. They mirror validate.go of the
// contact-relay service (limits, e-mail pattern, character rules, link count),
// so a message that passes here is accepted by the server. No $lib imports:
// the browser script (src/client/pages/contact.ts) bundles this file directly.

export const MAX_NAME = 100;
export const MAX_EMAIL = 254;
export const MAX_MESSAGE = 5000;
export const WARN_MESSAGE = 4500;
export const MAX_LINKS = 5;

// Same pattern as emailRE in validate.go: plain ASCII addresses only.
const EMAIL_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
// Go's strings.TrimSpace trims unicode.IsSpace, which (unlike JS trim) leaves U+FEFF.
const GO_SPACE = '\\t\\n\\v\\f\\r \\u0085\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000';
const GO_TRIM = new RegExp(`^[${GO_SPACE}]+|[${GO_SPACE}]+$`, 'g');
// Control, format, private-use, line/paragraph separators, lone surrogates.
const FORBIDDEN = /[\p{Cc}\p{Cf}\p{Co}\p{Zl}\p{Zp}\p{Cs}]/u;
// ZWNJ, ZWJ, LRM, RLM are allowed (some scripts need them).
const ALLOWED_FORMAT = /[\u200C-\u200F]/gu;
// Characters that render as nothing (variation selectors, CGJ, Hangul fillers, braille blank).
const INVISIBLE = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}\u034F\u115F\u1160\u3164\uFFA0\u2800]/u;

export type Field = 'name' | 'email' | 'message' | 'privacy';
export type Problem =
	| 'name_long'
	| 'name_chars'
	| 'email_missing'
	| 'email_format'
	| 'message_missing'
	| 'message_long'
	| 'message_chars'
	| 'message_links'
	| 'privacy_missing';

export interface FormValues {
	name: string;
	email: string;
	message: string;
	privacy: boolean;
}

/** Number of characters (code points) as the server counts them. */
export function length(text: string): number {
	return [...text].length;
}

function goTrim(text: string): string {
	return text.replace(GO_TRIM, '');
}

/** No-break and other space separators become a plain space (plainSpaces in Go). */
function plainSpaces(text: string): string {
	return text.replace(/(?! )\p{Zs}/gu, ' ');
}

/** Message text as the server stores it: line breaks normalized, trimmed. */
export function normalizeMessage(text: string): string {
	return goTrim(plainSpaces(text.replace(/\r\n?/g, '\n')));
}

/** cleanText in Go: rejects control/format/invisible characters. */
export function cleanText(text: string, multiline: boolean): boolean {
	const rest = (multiline ? text.replace(/[\n\t]/g, '') : text).replace(ALLOWED_FORMAT, '');
	return !FORBIDDEN.test(rest) && !INVISIBLE.test(rest);
}

/** validEmail in Go: the pattern plus net/mail's dot-atom rules for the local part. */
export function validEmail(email: string): boolean {
	if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return false;
	const local = email.slice(0, email.indexOf('@'));
	return !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');
}

export function countLinks(text: string): number {
	const lower = text.toLowerCase();
	return lower.split('http://').length - 1 + (lower.split('https://').length - 1);
}

/** The first problem of each field, in form order. Empty when the server would accept the fields. */
export function validate(values: FormValues): Partial<Record<Field, Problem>> {
	const problems: Partial<Record<Field, Problem>> = {};
	const name = goTrim(plainSpaces(values.name));
	if (length(name) > MAX_NAME) problems.name = 'name_long';
	else if (!cleanText(name, false)) problems.name = 'name_chars';

	const email = goTrim(values.email);
	if (email === '') problems.email = 'email_missing';
	else if (!validEmail(email)) problems.email = 'email_format';

	const message = normalizeMessage(values.message);
	if (message === '') problems.message = 'message_missing';
	else if (length(message) > MAX_MESSAGE) problems.message = 'message_long';
	else if (!cleanText(message, true)) problems.message = 'message_chars';
	else if (countLinks(message) > MAX_LINKS) problems.message = 'message_links';

	if (!values.privacy) problems.privacy = 'privacy_missing';
	return problems;
}

/** Counter colour: muted, ask from WARN_MESSAGE, deny above MAX_MESSAGE. */
export function counterLevel(count: number): 'ok' | 'warn' | 'over' {
	if (count > MAX_MESSAGE) return 'over';
	return count >= WARN_MESSAGE ? 'warn' : 'ok';
}

export type Result = 'sent' | 'failed' | 'limit' | 'invalid';
const RESULT_PATH = /^(?:\/[a-z]{2,3}(?:-[A-Za-z0-9]+)?)?\/contact\/(sent|failed|limit|invalid)\/$/;

/**
 * Outcome of a submission from the final response of fetch (after the 303).
 * Only result pages on our own origin count; anything else is a failure,
 * a 429 straight from the proxy is the rate limit.
 */
export function resultOf(finalUrl: string, status: number, origin: string): Result {
	let url: URL;
	try {
		url = new URL(finalUrl);
	} catch {
		return status === 429 ? 'limit' : 'failed';
	}
	const match = url.origin === origin ? RESULT_PATH.exec(url.pathname) : null;
	if (match?.[1]) return match[1] as Result;
	return status === 429 ? 'limit' : 'failed';
}
