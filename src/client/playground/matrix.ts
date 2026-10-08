// The overview: every category of the vocabulary against every action, each cell the
// result of the evaluation for the current request's day, time, area and values.
import { evaluate, type Mandate, type Result } from '../../lib/playground/engine.ts';
import { buildRequest, type RequestInput } from '../../lib/playground/request.ts';
import { ACTIONS, CATEGORIES, hasAction } from '../../lib/playground/vocab.ts';

export interface Cell {
	category: string;
	action: string;
	/** null: the category has no such action ("not available"). */
	result: Result | null;
}

export interface Matrix {
	columns: readonly string[];
	rows: { category: string; cells: Cell[] }[];
}

export function computeMatrix(mandate: Mandate | null, base: RequestInput): Matrix {
	const rows = CATEGORIES.map((category) => ({
		category,
		cells: ACTIONS.map((action): Cell => {
			if (!hasAction(category, action)) return { category, action, result: null };
			const request = buildRequest({ ...base, category, action, entityId: '', critical: false });
			return { category, action, result: evaluate(mandate, request) };
		})
	}));
	return { columns: ACTIONS, rows };
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'home' | 'end';

const STEPS: Record<Exclude<Direction, 'home' | 'end'>, readonly [number, number]> = {
	up: [-1, 0],
	down: [1, 0],
	left: [0, -1],
	right: [0, 1]
};

/**
 * The next available cell from (row, col) in a direction, skipping "not available"
 * cells; the same cell if there is none. Home and End go to the first and last
 * available cell of the row.
 */
export function moveInMatrix(available: readonly (readonly boolean[])[], row: number, col: number, direction: Direction): [number, number] {
	const ok = (r: number, c: number): boolean => available[r]?.[c] === true;
	const width = available[0]?.length ?? 0;
	if (direction === 'home' || direction === 'end') {
		const order = [...Array(width).keys()];
		if (direction === 'end') order.reverse();
		const c = order.find((i) => ok(row, i));
		return c === undefined ? [row, col] : [row, c];
	}
	const [dr, dc] = STEPS[direction];
	if (dc !== 0) {
		for (let c = col + dc; c >= 0 && c < width; c += dc) if (ok(row, c)) return [row, c];
		return [row, col];
	}
	// Up and down: the nearest available cell in the next row that has one.
	for (let r = row + dr; r >= 0 && r < available.length; r += dr) {
		if (ok(r, col)) return [r, col];
		for (let d = 1; d < width; d += 1) {
			if (ok(r, col - d)) return [r, col - d];
			if (ok(r, col + d)) return [r, col + d];
		}
	}
	return [row, col];
}
