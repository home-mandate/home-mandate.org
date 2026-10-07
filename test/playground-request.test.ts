import { describe, expect, it } from 'vitest';
import { evaluate, parseMandate } from '../src/client/playground/engine.ts';
import { computeMatrix, moveInMatrix } from '../src/client/playground/matrix.ts';
import {
	buildRequest,
	defaultParameter,
	localTimestamp,
	offsetAt,
	referenceDate,
	requestTime,
	type RequestInput
} from '../src/client/playground/request.ts';
import { formatUnit, fromUnit, toUnit } from '../src/client/playground/units.ts';
import { ACTIONS, CATEGORIES, actionsOf, commonParameters, criticalSomewhere, parameterInfo, parametersOf } from '../src/client/playground/vocab.ts';
import { example } from './playground-fixtures.ts';

const input: RequestInput = {
	category: 'lock',
	action: 'unlock',
	area: '',
	entityId: '',
	critical: false,
	day: 2,
	time: '19:00',
	parameters: {}
};

describe('request time', () => {
	it('uses the reference week, Monday first', () => {
		expect(referenceDate(0)).toBe('2026-10-12');
		expect(referenceDate(6)).toBe('2026-10-18');
	});
	it('writes the household offset (summer time in the reference week)', () => {
		expect(requestTime(2, '19:00')).toBe('2026-10-14T19:00:00+02:00');
		expect(localTimestamp('2026-12-01', '08:30', 'Europe/Berlin')).toBe('2026-12-01T08:30:00+01:00');
		expect(localTimestamp('2026-07-01', '08:30', 'America/New_York')).toBe('2026-07-01T08:30:00-04:00');
		expect(localTimestamp('2026-07-01', '08:30', 'UTC')).toBe('2026-07-01T08:30:00+00:00');
	});
	it('handles the day summer time ends', () => {
		// 25 October 2026: 02:00-03:00 happens twice in Berlin; after it the offset is +01:00.
		expect(localTimestamp('2026-10-25', '12:00', 'Europe/Berlin')).toBe('2026-10-25T12:00:00+01:00');
		expect(offsetAt(Date.parse('2026-10-25T00:30:00Z'), 'Europe/Berlin')).toBe('+02:00');
	});
	it('evaluates to the local clock time it shows', () => {
		const mandate = parseMandate(example('energy-agent'));
		const wallbox = (time: string) =>
			evaluate(mandate, buildRequest({ ...input, category: 'other', action: 'set', entityId: 'number.wallbox_ladestrom', time })).decision;
		expect(wallbox('05:59')).toBe('deny');
		expect(wallbox('06:00')).toBe('allow');
		expect(wallbox('21:59')).toBe('allow');
		expect(wallbox('22:00')).toBe('deny');
	});
});

describe('buildRequest', () => {
	it('fills the default device id and leaves out empty fields', () => {
		expect(buildRequest(input)).toEqual({
			resource: { entity_id: 'lock.example', category: 'lock' },
			action: 'unlock',
			time: '2026-10-14T19:00:00+02:00',
			timezone: 'Europe/Berlin'
		});
	});
	it('passes area, device id and the critical marking', () => {
		const request = buildRequest({ ...input, area: ' hall ', entityId: ' lock.front ', critical: true });
		expect(request.resource).toEqual({ entity_id: 'lock.front', category: 'lock', area: 'hall', critical: true });
	});
	it('carries the parameters of the action, with defaults', () => {
		expect(buildRequest({ ...input, category: 'climate', action: 'set_temperature' }).parameters).toEqual({ temperature: 2100 });
		expect(buildRequest({ ...input, category: 'light', action: 'set', parameters: { brightness: 80, volume: 3 } }).parameters).toEqual({ brightness: 80 });
		expect(buildRequest({ ...input, category: 'acme:robot', action: 'go' }).parameters).toBeUndefined();
		expect(defaultParameter('cover', 'set_position', 'position')).toBe(50);
	});
});

describe('units', () => {
	it('converts decimal text exactly', () => {
		expect(toUnit('21.55', 100)).toBe(2155);
		expect(toUnit('21,5', 100)).toBe(2150);
		expect(toUnit('-3', 100)).toBe(-300);
		expect(toUnit('.5', 100)).toBe(50);
		expect(toUnit('21.555', 100)).toBeNaN();
		expect(toUnit('abc', 1)).toBeNaN();
		expect(toUnit('', 1)).toBeNaN();
		expect(toUnit('40', 1)).toBe(40);
	});
	it('shows values in displayed units', () => {
		expect(fromUnit(2150, 100)).toBe('21.5');
		expect(fromUnit(2100, 100)).toBe('21');
		expect(fromUnit(5, 100)).toBe('0.05');
		expect(fromUnit(-250, 100)).toBe('-2.5');
		expect(fromUnit(40, 1)).toBe('40');
		expect(formatUnit(2150, 100, 'de')).toBe('21,5');
	});
});

describe('vocabulary helpers', () => {
	it('lists categories and actions of the specification', () => {
		expect(CATEGORIES).toHaveLength(13);
		expect(ACTIONS).toContain('set_temperature');
		expect(actionsOf('acme:robot')).toEqual([]);
		expect(actionsOf(undefined)).toBe(ACTIONS);
	});
	it('knows parameters and their scale', () => {
		expect(parametersOf('climate', 'set_temperature')).toEqual([{ name: 'temperature', unit: 'degree Celsius', scale: 100 }]);
		expect(parametersOf(undefined, 'set')).toEqual([{ name: 'brightness', unit: 'percent', scale: 1, minimum: 0, maximum: 100 }]);
		expect(commonParameters('light', ['set', 'read'])).toEqual([]);
		expect(commonParameters('light', ['*'])).toEqual([]);
		expect(parameterInfo('x', {})).toEqual({ name: 'x', unit: '', scale: 1 });
	});
	it('knows critical actions', () => {
		expect(criticalSomewhere(undefined, 'unlock')).toBe(true);
		expect(criticalSomewhere('light', 'set')).toBe(false);
		expect(criticalSomewhere('other', 'set')).toBe(true);
	});
});

describe('overview matrix', () => {
	const mandate = parseMandate(example('voice-assistant'));
	const matrix = computeMatrix(mandate, input);
	const cell = (category: string, action: string) =>
		matrix.rows.find((r) => r.category === category)?.cells.find((c) => c.action === action)?.result;

	it('has every category and action of the vocabulary', () => {
		expect(matrix.rows).toHaveLength(13);
		expect(matrix.columns).toEqual(ACTIONS);
	});
	it('evaluates each cell with the specification', () => {
		expect(cell('lock', 'unlock')).toMatchObject({ decision: 'ask', rule_id: 'r-locks' });
		expect(cell('camera', 'read')).toMatchObject({ decision: 'deny', rule_id: 'r-no-cameras' });
		expect(cell('sensor', 'read')).toMatchObject({ decision: 'allow', rule_id: 'r-read-all' });
		expect(cell('scene', 'activate')).toMatchObject({ decision: 'deny', reason: 'no_match' });
		expect(cell('climate', 'set_temperature')).toMatchObject({ decision: 'allow', rule_id: 'r-climate' });
	});
	it('marks actions a category does not have', () => {
		expect(cell('sensor', 'unlock')).toBeNull();
	});
	it('shows an invalid mandate as deny everywhere', () => {
		const invalid = computeMatrix(null, input);
		expect(invalid.rows.flatMap((r) => r.cells).every((c) => c.result === null || c.result.reason === 'invalid_mandate')).toBe(true);
	});
});

describe('moving in the matrix', () => {
	// 3 rows; false = not available.
	const grid = [
		[true, false, true, false],
		[false, false, false, false],
		[true, true, false, true]
	];
	it('moves sideways past unavailable cells and stops at the edge', () => {
		expect(moveInMatrix(grid, 0, 0, 'right')).toEqual([0, 2]);
		expect(moveInMatrix(grid, 0, 2, 'right')).toEqual([0, 2]);
		expect(moveInMatrix(grid, 2, 3, 'left')).toEqual([2, 1]);
	});
	it('moves up and down to the nearest available cell, skipping empty rows', () => {
		expect(moveInMatrix(grid, 0, 2, 'down')).toEqual([2, 1]);
		expect(moveInMatrix(grid, 2, 0, 'up')).toEqual([0, 0]);
		expect(moveInMatrix(grid, 0, 0, 'up')).toEqual([0, 0]);
		expect(moveInMatrix(grid, 2, 3, 'down')).toEqual([2, 3]);
	});
	it('goes to the first and last cell of the row', () => {
		expect(moveInMatrix(grid, 2, 1, 'home')).toEqual([2, 0]);
		expect(moveInMatrix(grid, 2, 1, 'end')).toEqual([2, 3]);
		expect(moveInMatrix(grid, 1, 1, 'end')).toEqual([1, 1]);
	});
});
