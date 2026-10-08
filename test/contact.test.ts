import { describe, expect, it } from 'vitest';
import {
	MAX_MESSAGE,
	cleanText,
	countLinks,
	counterLevel,
	length,
	messageLength,
	normalizeMessage,
	resultOf,
	validEmail,
	validate
} from '../src/lib/contact/validate';

const ok = { name: '', email: 'kim@example.org', message: 'Hello', privacy: true };

describe('validate', () => {
	it('accepts a minimal valid form (name is optional)', () => {
		expect(validate(ok)).toEqual({});
	});
	it('reports every missing required field', () => {
		expect(validate({ name: '', email: ' ', message: '  \n ', privacy: false })).toEqual({
			email: 'email_missing',
			message: 'message_missing',
			privacy: 'privacy_missing'
		});
	});
	it('limits the name to 100 characters after trimming', () => {
		expect(validate({ ...ok, name: `  ${'a'.repeat(100)}  ` })).toEqual({});
		expect(validate({ ...ok, name: 'a'.repeat(101) }).name).toBe('name_long');
		expect(validate({ ...ok, name: '😀'.repeat(100) })).toEqual({});
	});
	it('rejects line breaks and control characters in the name', () => {
		expect(validate({ ...ok, name: 'Kim\nBcc: x' }).name).toBe('name_chars');
		expect(validate({ ...ok, name: 'Kim\u202Eevil' }).name).toBe('name_chars');
	});
	it('limits the message to 5000 characters, counted as code points', () => {
		expect(validate({ ...ok, message: 'a'.repeat(MAX_MESSAGE) })).toEqual({});
		expect(validate({ ...ok, message: 'a'.repeat(MAX_MESSAGE + 1) }).message).toBe('message_long');
		expect(validate({ ...ok, message: '😀'.repeat(MAX_MESSAGE) })).toEqual({});
		expect(validate({ ...ok, message: `\n\n${'a'.repeat(MAX_MESSAGE)}\n` })).toEqual({});
	});
	it('allows line breaks and tabs in the message but no other control characters', () => {
		expect(validate({ ...ok, message: 'a\r\nb\tc' })).toEqual({});
		expect(validate({ ...ok, message: 'a\u0000b' }).message).toBe('message_chars');
		expect(validate({ ...ok, message: 'a\u2028b' }).message).toBe('message_chars');
	});
	it('allows at most five links', () => {
		const links = (n: number) => Array.from({ length: n }, (_, i) => `https://e${i}.org`).join(' ');
		expect(validate({ ...ok, message: links(5) })).toEqual({});
		expect(validate({ ...ok, message: `${links(5)} HTTP://x.org` }).message).toBe('message_links');
	});
	it('reports a bad e-mail format', () => {
		expect(validate({ ...ok, email: 'kim@example' }).email).toBe('email_format');
	});
});

describe('validEmail', () => {
	it.each(['kim@example.org', 'a.b+tag@sub.example.co', 'x_y-z@a-b.de', 'A@B.CD'])('accepts %s', (e) => {
		expect(validEmail(e)).toBe(true);
	});
	it.each([
		'kim@example',
		'kim@example.o',
		'Kim <kim@example.org>',
		'kim@exa_mple.org',
		'k?m@example.org',
		'k&bcc=x@example.org',
		'kim@example.org/x',
		'.kim@example.org',
		'kim.@example.org',
		'k..im@example.org',
		'kim@example..org',
		'kïm@example.org',
		`${'a'.repeat(250)}@x.org`
	])('rejects %s', (e) => {
		expect(validEmail(e)).toBe(false);
	});
});

describe('cleanText', () => {
	it('allows joiners and directional marks', () => {
		expect(cleanText('a\u200Cb\u200Dc\u200Ed\u200Fe', false)).toBe(true);
	});
	it.each(['\u202A', '\u2066', '\uFEFF', '\uFE0F', '\u{E0100}', '\u034F', '\u3164', '\u2800', '\uE000', '\u0085', '\uD800'])(
		'rejects U+%s',
		(c) => {
			expect(cleanText(`a${c}b`, true)).toBe(false);
		}
	);
	it('only allows line feed and tab in multiline text', () => {
		expect(cleanText('a\nb', false)).toBe(false);
		expect(cleanText('a\nb\tc', true)).toBe(true);
	});
});

describe('helpers', () => {
	it('normalizes line breaks, spaces and outer white space like the server', () => {
		expect(normalizeMessage('\u00A0 a\r\nb\rc\u2003 ')).toBe('a\nb\nc');
		expect(normalizeMessage('\uFEFFa')).toBe('\uFEFFa');
	});
	it('counts code points and links', () => {
		expect(length('a😀')).toBe(2);
		expect(countLinks('http://a https://b HTTPS://c')).toBe(3);
	});
	it('counts a message as the server stores it, without outer white space', () => {
		expect(messageLength('  a😀 \r\n')).toBe(2);
		expect(messageLength('a\r\nb')).toBe(3);
		expect(messageLength(' \n\t ')).toBe(0);
	});
	it('does not call a message too long because of outer white space', () => {
		const text = `${'a'.repeat(MAX_MESSAGE)}${' '.repeat(20)}`;
		expect(messageLength(text)).toBe(MAX_MESSAGE);
		expect(validate({ ...ok, message: text }).message).toBeUndefined();
		expect(counterLevel(messageLength(text))).toBe('warn');
		expect(messageLength(`${'a'.repeat(MAX_MESSAGE + 1)} `)).toBe(MAX_MESSAGE + 1);
	});
	it('chooses the counter colour', () => {
		expect(counterLevel(0)).toBe('ok');
		expect(counterLevel(4499)).toBe('ok');
		expect(counterLevel(4500)).toBe('warn');
		expect(counterLevel(5000)).toBe('warn');
		expect(counterLevel(5001)).toBe('over');
	});
});

describe('resultOf', () => {
	const origin = 'https://home-mandate.org';
	it.each([
		['https://home-mandate.org/contact/sent/', 'sent'],
		['https://home-mandate.org/de/contact/failed/', 'failed'],
		['https://home-mandate.org/contact/limit/', 'limit'],
		['https://home-mandate.org/pt-BR/contact/invalid/', 'invalid']
	])('reads %s', (url, result) => {
		expect(resultOf(url, 200, origin)).toBe(result);
	});
	it('treats other addresses and origins as failure', () => {
		expect(resultOf('https://evil.example/contact/sent/', 200, origin)).toBe('failed');
		expect(resultOf('https://home-mandate.org/contact', 403, origin)).toBe('failed');
		expect(resultOf('https://home-mandate.org/contact/sent/x', 200, origin)).toBe('failed');
		expect(resultOf('', 500, origin)).toBe('failed');
	});
	it('maps a 429 from the proxy to the rate limit', () => {
		expect(resultOf('https://home-mandate.org/contact', 429, origin)).toBe('limit');
		expect(resultOf('', 429, origin)).toBe('limit');
	});
});
