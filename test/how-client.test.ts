import { expect, it } from 'vitest';
import { toggleTampered } from '../src/client/lib/how.ts';
import { DEFAULT_PATH, isPath, PATHS } from '../src/lib/how/path.ts';
import { nextTab } from '../src/client/lib/tabs.ts';

it('moves between tabs with arrow keys, Home and End, wrapping around', () => {
	expect(nextTab('ArrowRight', 0, 2)).toBe(1);
	expect(nextTab('ArrowRight', 1, 2)).toBe(0);
	expect(nextTab('ArrowLeft', 0, 2)).toBe(1);
	expect(nextTab('Home', 1, 2)).toBe(0);
	expect(nextTab('End', 0, 3)).toBe(2);
	expect(nextTab('Enter', 0, 2)).toBeUndefined();
	expect(nextTab('ArrowRight', 0, 0)).toBeUndefined();
});

it('swaps the arrow keys in right-to-left layouts', () => {
	expect(nextTab('ArrowLeft', 0, 2, true)).toBe(1);
	expect(nextTab('ArrowRight', 0, 3, true)).toBe(2);
});

it('knows the three paths and starts with ask', () => {
	expect(PATHS).toEqual(['allow', 'ask', 'deny']);
	expect(DEFAULT_PATH).toBe('ask');
	expect(isPath('deny')).toBe(true);
	expect(isPath('maybe')).toBe(false);
	expect(isPath(undefined)).toBe(false);
});

it('toggles the tampered state of the chain', () => {
	const attrs = new Set<string>();
	const root = {
		hasAttribute: (name: string) => attrs.has(name),
		toggleAttribute: (name: string, on: boolean) => (on ? attrs.add(name) : attrs.delete(name), on)
	} as unknown as HTMLElement;
	expect(toggleTampered(root)).toBe(true);
	expect(attrs.has('data-tampered')).toBe(true);
	expect(toggleTampered(root)).toBe(false);
	expect(attrs.has('data-tampered')).toBe(false);
});
