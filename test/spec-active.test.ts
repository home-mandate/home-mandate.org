import { describe, expect, it } from 'vitest';
import { activeIndex } from '../src/client/lib/active-section';

describe('activeIndex', () => {
	it('takes the first section before any heading reached the reading line', () => {
		expect(activeIndex([300, 900, 1500], 96)).toBe(0);
	});
	it('takes the last heading that passed the reading line', () => {
		expect(activeIndex([-800, -200, 50, 700], 96)).toBe(2);
		expect(activeIndex([-800, -200, 96, 700], 96)).toBe(2);
	});
	it('takes the last section at the end of the text', () => {
		expect(activeIndex([-900, -500, -100], 96)).toBe(2);
	});
	it('handles an empty list', () => {
		expect(activeIndex([], 96)).toBe(0);
	});
});
