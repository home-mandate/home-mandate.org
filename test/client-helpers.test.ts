import { describe, expect, it } from 'vitest';
import { statusText, writeClipboard } from '../src/client/lib/copy.ts';
import { setInvalid, withId } from '../src/client/lib/dom.ts';
import { duplicateKeyLine, lineOfPointer } from '../src/client/playground/locate.ts';
import { decimalPlaces } from '../src/lib/playground/units.ts';

/** Just enough of an element for the attribute helpers. */
function fakeElement(attrs: Record<string, string> = {}) {
	const map = new Map(Object.entries(attrs));
	return {
		map,
		getAttribute: (name: string) => map.get(name) ?? null,
		setAttribute: (name: string, value: string) => void map.set(name, value),
		removeAttribute: (name: string) => void map.delete(name)
	};
}

describe('withId', () => {
	it('adds an id once and keeps the others', () => {
		expect(withId('hint', 'err', true)).toBe('hint err');
		expect(withId('hint err', 'err', true)).toBe('hint err');
		expect(withId(null, 'err', true)).toBe('err');
	});
	it('removes an id and returns null when nothing is left', () => {
		expect(withId('hint  err', 'err', false)).toBe('hint');
		expect(withId('err', 'err', false)).toBeNull();
		expect(withId(null, 'err', false)).toBeNull();
	});
});

describe('setInvalid', () => {
	it('sets aria-invalid="true", never an empty value, and removes it again', () => {
		const control = fakeElement();
		setInvalid(control as unknown as Element, true);
		expect(control.map.get('aria-invalid')).toBe('true');
		setInvalid(control as unknown as Element, false);
		expect(control.map.has('aria-invalid')).toBe(false);
	});
	it('shows the error and links it with aria-describedby only while invalid', () => {
		const control = fakeElement({ 'aria-describedby': 'hint' });
		const error = { id: 'err', hidden: true } as HTMLElement;
		setInvalid(control as unknown as Element, true, error);
		expect(error.hidden).toBe(false);
		expect(control.map.get('aria-describedby')).toBe('hint err');
		setInvalid(control as unknown as Element, false, error);
		expect(error.hidden).toBe(true);
		expect(control.map.get('aria-describedby')).toBe('hint');
	});
	it('drops aria-describedby when the error was the only description', () => {
		const control = fakeElement();
		const error = { id: 'err', hidden: true } as HTMLElement;
		setInvalid(control as unknown as Element, true, error);
		setInvalid(control as unknown as Element, false, error);
		expect(control.map.has('aria-describedby')).toBe(false);
	});
});

describe('copy', () => {
	it('reports success when the clipboard takes the text', async () => {
		const written: string[] = [];
		const clipboard = { writeText: async (text: string) => void written.push(text) };
		expect(await writeClipboard('abc', clipboard)).toBe('copied');
		expect(written).toEqual(['abc']);
	});
	it('reports a failure without a Clipboard API or when it refuses', async () => {
		expect(await writeClipboard('abc', undefined)).toBe('failed');
		const refusing = { writeText: () => Promise.reject(new Error('NotAllowedError')) };
		expect(await writeClipboard('abc', refusing)).toBe('failed');
	});
	it('takes the status text of each outcome from the live region', () => {
		const status = { dataset: { copyStatus: 'Copied', copyFailedStatus: 'Could not copy.' } } as Pick<HTMLElement, 'dataset'>;
		expect(statusText(status, 'copied')).toBe('Copied');
		expect(statusText(status, 'failed')).toBe('Could not copy.');
		expect(statusText({ dataset: {} } as Pick<HTMLElement, 'dataset'>, 'failed')).toBe('');
	});
});

describe('decimalPlaces', () => {
	it('follows the scale of the vocabulary unit', () => {
		expect(decimalPlaces(1)).toBe(0);
		expect(decimalPlaces(10)).toBe(1);
		expect(decimalPlaces(100)).toBe(2);
	});
});

describe('locating values in the JSON text', () => {
	it('handles empty containers, nesting and escaped quotes', () => {
		const text = '{\n"a": {},\n"b": [],\n"c": [{"d": "x\\"y"}, [1, -2.5e3]],\n"e": null\n}';
		expect(lineOfPointer(text, '/a')).toBe(2);
		expect(lineOfPointer(text, '/b')).toBe(3);
		expect(lineOfPointer(text, '/c/0/d')).toBe(4);
		expect(lineOfPointer(text, '/c/1/1')).toBe(4);
		expect(lineOfPointer(text, '/e')).toBe(5);
		expect(lineOfPointer(text, '/a~1b')).toBe(1);
	});
	it('keeps what it found before a syntax error', () => {
		expect(lineOfPointer('{\n"a": 1\n"b": 2}', '/a')).toBe(2);
		expect(lineOfPointer('{\n"a": [1\n2]}', '/a/0')).toBe(2);
		expect(lineOfPointer('{\n"a" 1}', '/a')).toBe(1);
	});
	it('finds a repeated key in a nested object', () => {
		expect(duplicateKeyLine('{"r": [{"id": 1,\n"id": 2}]}')).toBe(2);
		expect(duplicateKeyLine('{"a": 1, "a"')).toBeUndefined();
	});
});
