// Light/dark choice. The only thing the site stores in the browser: the key
// "ms-theme" in localStorage, and only after someone picks light or dark.
// "system" (the default) removes the key again. No cookies.

export type Theme = 'light' | 'dark' | 'system';

export const THEME_KEY = 'ms-theme';
export const THEMES: readonly Theme[] = ['light', 'dark', 'system'];

/** Stored choice; anything unexpected, or storage that cannot be read, means "system". */
export function readTheme(storage: Pick<Storage, 'getItem'> | undefined): Theme {
	try {
		const value = storage?.getItem(THEME_KEY);
		return value === 'light' || value === 'dark' ? value : 'system';
	} catch {
		return 'system';
	}
}

/** Remembers an explicit choice; "system" forgets it. Returns false if storage is blocked. */
export function storeTheme(storage: Pick<Storage, 'setItem' | 'removeItem'> | undefined, theme: Theme): boolean {
	try {
		if (!storage) return false;
		if (theme === 'system') storage.removeItem(THEME_KEY);
		else storage.setItem(THEME_KEY, theme);
		return true;
	} catch {
		return false;
	}
}

/** data-ms-theme on <html>: set for light/dark, absent for system (CSS follows prefers-color-scheme). */
export function applyTheme(root: HTMLElement, theme: Theme): void {
	if (theme === 'system') delete root.dataset.msTheme;
	else root.dataset.msTheme = theme;
}

export function isTheme(value: unknown): value is Theme {
	return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** localStorage, or undefined where even touching it throws (blocked site data). */
export function localStore(): Storage | undefined {
	try {
		return window.localStorage;
	} catch {
		return undefined;
	}
}
