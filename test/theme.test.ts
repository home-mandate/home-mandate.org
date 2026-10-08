import { describe, expect, it } from 'vitest';
import { THEME_KEY, applyTheme, isTheme, readTheme, storeTheme } from '../src/client/lib/theme.ts';

function memory(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		data,
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		removeItem: (k: string) => void data.delete(k)
	};
}

const blocked = {
	getItem: () => {
		throw new Error('SecurityError');
	},
	setItem: () => {
		throw new Error('SecurityError');
	},
	removeItem: () => {
		throw new Error('SecurityError');
	}
};

describe('readTheme', () => {
	it('returns a stored light or dark choice', () => {
		expect(readTheme(memory({ [THEME_KEY]: 'dark' }))).toBe('dark');
		expect(readTheme(memory({ [THEME_KEY]: 'light' }))).toBe('light');
	});

	it('falls back to system for nothing, garbage, missing or blocked storage', () => {
		expect(readTheme(memory())).toBe('system');
		expect(readTheme(memory({ [THEME_KEY]: '<script>' }))).toBe('system');
		expect(readTheme(undefined)).toBe('system');
		expect(readTheme(blocked)).toBe('system');
	});
});

describe('storeTheme', () => {
	it('stores light and dark under the one allowed key', () => {
		const s = memory();
		expect(storeTheme(s, 'dark')).toBe(true);
		expect([...s.data]).toEqual([[THEME_KEY, 'dark']]);
	});

	it('removes the key again for system', () => {
		const s = memory({ [THEME_KEY]: 'light' });
		storeTheme(s, 'system');
		expect(s.data.size).toBe(0);
	});

	it('reports blocked or missing storage instead of throwing', () => {
		expect(storeTheme(blocked, 'dark')).toBe(false);
		expect(storeTheme(undefined, 'dark')).toBe(false);
	});
});

describe('applyTheme', () => {
	it('sets data-ms-theme for an explicit choice and removes it for system', () => {
		const root = { dataset: {} as DOMStringMap } as HTMLElement;
		applyTheme(root, 'dark');
		expect(root.dataset.msTheme).toBe('dark');
		applyTheme(root, 'system');
		expect(root.dataset.msTheme).toBeUndefined();
	});
});

it('isTheme accepts only the three themes', () => {
	expect(isTheme('system')).toBe(true);
	expect(isTheme('blue')).toBe(false);
	expect(isTheme(undefined)).toBe(false);
});
