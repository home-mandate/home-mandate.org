import { describe, expect, it } from 'vitest';
import {
	checkMessages,
	isLanguageTag,
	mergeWithBase,
	parseMeta,
	placeholders,
	REQUIRED_PREFIXES
} from '../scripts/lib/languages.ts';

const base = {
	nav_home: 'Home',
	home_title: 'AI is coming home.',
	footer_license: 'Text {text} · Code {code}',
	page_extra: 'Optional text'
};

describe('isLanguageTag', () => {
	it.each(['en', 'de', 'pt-BR', 'zh-Hant', 'sr-Latn-RS', 'ast'])('accepts %s', (tag) => {
		expect(isLanguageTag(tag)).toBe(true);
	});
	it.each(['EN', 'de_DE', '', 'english', '../en', 'de-', 'x'])('rejects %s', (tag) => {
		expect(isLanguageTag(tag)).toBe(false);
	});
});

describe('parseMeta', () => {
	it('accepts a complete meta file', () => {
		expect(parseMeta({ name: 'Deutsch', dir: 'ltr', translators: ['A'] })).toEqual({
			name: 'Deutsch',
			dir: 'ltr',
			translators: ['A']
		});
	});
	it('defaults translators to an empty list', () => {
		expect(parseMeta({ name: 'العربية', dir: 'rtl' }).translators).toEqual([]);
	});
	it.each([
		[{ dir: 'ltr' }, 'name'],
		[{ name: '', dir: 'ltr' }, 'name'],
		[{ name: 'x'.repeat(41), dir: 'ltr' }, 'name'],
		[{ name: 'Deutsch', dir: 'up' }, 'dir'],
		[{ name: 'Deutsch', dir: 'ltr', translators: 'A' }, 'translators'],
		[{ name: 'Deutsch', dir: 'ltr', extra: 1 }, 'unknown'],
		[{ name: 'Deu‮tsch', dir: 'ltr' }, 'code point']
	])('rejects %j (%s)', (meta, needle) => {
		expect(() => parseMeta(meta)).toThrow(new RegExp(needle, 'i'));
	});
});

describe('placeholders', () => {
	it('finds ICU arguments', () => {
		expect(placeholders('Hi {name}, {count, plural, one {# x} other {# y}}')).toEqual(['count', 'name']);
	});
	it('returns an empty list for plain text', () => {
		expect(placeholders('plain')).toEqual([]);
	});
});

describe('checkMessages', () => {
	it('accepts a valid translation', () => {
		const result = checkMessages('de', base, { ...base, nav_home: 'Start' });
		expect(result.errors).toEqual([]);
		expect(result.missing).toEqual([]);
	});
	it('reports missing optional keys without error', () => {
		const { page_extra: _omit, ...partial } = base;
		const result = checkMessages('de', base, partial);
		expect(result.errors).toEqual([]);
		expect(result.missing).toEqual(['page_extra']);
	});
	it('rejects missing required keys', () => {
		const { home_title: _omit, ...partial } = base;
		const result = checkMessages('de', base, partial);
		expect(result.errors.join()).toMatch(/home_title.*required/);
	});
	it('rejects unknown keys', () => {
		expect(checkMessages('de', base, { ...base, nav_bogus: 'x' }).errors.join()).toMatch(/nav_bogus.*unknown/);
	});
	it('rejects different placeholders', () => {
		const result = checkMessages('de', base, { ...base, footer_license: 'Text {txt} · Code {code}' });
		expect(result.errors.join()).toMatch(/footer_license.*placeholder/);
	});
	it('rejects HTML', () => {
		expect(checkMessages('de', base, { ...base, home_title: '<b>KI</b>' }).errors.join()).toMatch(/HTML/);
	});
	it('rejects invisible control characters', () => {
		expect(checkMessages('de', base, { ...base, home_title: 'KI⁦x' }).errors.join()).toMatch(/code point/);
	});
	it('rejects non-string values', () => {
		expect(checkMessages('de', base, { ...base, home_title: 3 }).errors.join()).toMatch(/string/);
	});
	it('rejects invalid ICU syntax', () => {
		expect(checkMessages('de', base, { ...base, home_title: 'KI {kaputt' }).errors.join()).toMatch(/ICU/);
	});
	it('ignores the $schema key', () => {
		expect(checkMessages('de', base, { ...base, $schema: 'https://inlang.com/schema/inlang-message-format' }).errors).toEqual([]);
	});
	it('requires every required prefix to be known', () => {
		expect(REQUIRED_PREFIXES.length).toBeGreaterThan(0);
	});
});

describe('mergeWithBase', () => {
	it('fills missing keys from the base language', () => {
		expect(mergeWithBase(base, { nav_home: 'Start' })).toEqual({ ...base, nav_home: 'Start' });
	});
	it('drops the $schema key', () => {
		expect(mergeWithBase(base, { $schema: 'x' })).not.toHaveProperty('$schema');
	});
});
