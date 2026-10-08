import { describe, expect, it } from 'vitest';
import {
	checkMessages,
	combineFiles,
	coverage,
	linkTargets,
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
		[{ name: 'Deu\u202Etsch', dir: 'ltr' }, 'code point']
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
	it.each(['2066', '202E', '0007', '2028', 'E000', 'FEFF'])('rejects the invisible character U+%s', (hex) => {
		const ch = String.fromCodePoint(parseInt(hex, 16));
		expect(checkMessages('de', base, { ...base, home_title: `KI${ch}x` }).errors.join()).toMatch(/code point/);
	});
	it.each([
		['ZWNJ (Persian)', '200C'],
		['ZWJ (Indic)', '200D'],
		['LRM', '200E'],
		['RLM', '200F']
	])('allows %s, which some scripts need for correct spelling', (_name, hex) => {
		const ch = String.fromCodePoint(parseInt(hex, 16));
		expect(checkMessages('fa', base, { ...base, home_title: `a${ch}b` }).errors).toEqual([]);
	});
	it.each(['constructor', 'toString', '__proto__', 'hasOwnProperty'])('rejects the inherited name %s as unknown key', (key) => {
		const messages = JSON.parse(`{"${key}": "x", "nav_home": "Start", "home_title": "T", "footer_license": "Text {text} · Code {code}"}`);
		expect(checkMessages('de', base, messages).errors.join()).toMatch(new RegExp(`${key}.*unknown`));
	});
	it.each([null, [], 'text', 3])('rejects a messages file that is not an object (%j)', (raw) => {
		expect(checkMessages('de', base, raw as never).errors.join()).toMatch(/object/);
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

describe('linkTargets', () => {
	it('finds inline link targets, sorted', () => {
		expect(linkTargets('See [b](/b/) and [a](https://x.org/a)')).toEqual(['/b/', 'https://x.org/a']);
		expect(linkTargets('no links')).toEqual([]);
	});
});

describe('checkMessages with links', () => {
	const linked = { ...base, home_more: 'Read [the spec](/spec/v0/).' };
	it('accepts the same targets with translated text', () => {
		expect(checkMessages('de', linked, { ...linked, home_more: 'Lies [die Spec](/spec/v0/).' }).errors).toEqual([]);
	});
	it('rejects added or changed targets', () => {
		const result = checkMessages('de', linked, { ...linked, home_more: 'Lies [das](https://evil.example/).' });
		expect(result.errors.join()).toMatch(/home_more: links/);
	});
});

describe('combineFiles', () => {
	it('merges files and ignores $schema', () => {
		const result = combineFiles('en', [
			{ name: 'messages.json', content: { $schema: 'x', a: '1' } },
			{ name: 'pages/faq.json', content: { b: '2' } }
		]);
		expect(result).toEqual({ messages: { a: '1', b: '2' }, errors: [] });
	});
	it('rejects duplicate keys and non-objects', () => {
		const result = combineFiles('en', [
			{ name: 'messages.json', content: { a: '1' } },
			{ name: 'pages/x.json', content: { a: '2' } },
			{ name: 'pages/y.json', content: [] }
		]);
		expect(result.errors).toEqual([
			'en/pages/x.json: key a is already defined in messages.json',
			'en/pages/y.json: must be a JSON object'
		]);
	});
});

describe('coverage', () => {
	it('counts translated keys in whole percent', () => {
		expect(coverage({ a: '', b: '', c: '' }, { a: 'x' })).toBe(33);
		expect(coverage({ $schema: '', a: '' }, { a: 'x' })).toBe(100);
		expect(coverage({}, {})).toBe(100);
	});
});
