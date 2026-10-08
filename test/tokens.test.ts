import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { systemThemeCss } from '../scripts/lib/tokens.ts';

describe('systemThemeCss', () => {
	it('applies the dark tokens when the system prefers dark and light was not chosen', () => {
		const css = systemThemeCss(readFileSync('src/styles/tokens.css', 'utf8'));
		expect(css).toContain('@media (prefers-color-scheme: dark)');
		expect(css).toContain(":root:not([data-ms-theme='light'])");
		expect(css).toContain('--ms-bg: #0F0E47;');
		expect(css).not.toContain('--ms-bg: #F5F5FA;');
	});

	it('fails when the dark block is missing', () => {
		expect(() => systemThemeCss(':root { --ms-bg: #fff; }')).toThrow(/dark/);
	});
});
