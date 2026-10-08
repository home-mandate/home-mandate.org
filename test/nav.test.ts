import { expect, it } from 'vitest';
import { activeNav } from '../src/lib/nav.ts';

it('marks the section of the current page', () => {
	expect(activeNav('/why/')).toBe('why');
	expect(activeNav('/spec/v0/')).toBe('spec');
	expect(activeNav('/implementations/')).toBe('implement');
	expect(activeNav('/')).toBeUndefined();
	expect(activeNav('/privacy/')).toBeUndefined();
});
