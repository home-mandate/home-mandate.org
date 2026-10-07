// Step 5: the overview as a table with row and column headers. Cells are buttons with
// one tab stop for the whole table (roving tabindex); arrow keys, Home and End move.
import type { Cell, Direction, Matrix } from '../matrix.ts';
import { moveInMatrix } from '../matrix.ts';
import { actionLabel, categoryLabel, tx, type Texts } from '../../../lib/playground/texts.ts';
import { chip, h, icon, isIconName } from './dom.ts';

export interface MatrixContext {
	texts: Texts;
	selected: { category: string; action: string };
	select(category: string, action: string): void;
}

const KEYS: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Home: 'home', End: 'end' };

function cellLabel(texts: Texts, category: string, action: string, decision: string, ruleId: string | undefined): string {
	const vars = { device: categoryLabel(texts, category), action: actionLabel(texts, action), decision: tx(texts, `decision_${decision}`) };
	return ruleId ? tx(texts, 'cell_rule', { ...vars, id: ruleId }) : tx(texts, 'cell_default', { ...vars, reason: tx(texts, 'cell_default_reason') });
}

function matrixHead(texts: Texts, matrix: Matrix): HTMLElement {
	return h(
		'thead',
		{},
		h(
			'tr',
			{},
			h('th', { scope: 'col', class: 'pg-corner' }, h('span', { class: 'visually-hidden' }, tx(texts, 'matrix_corner'))),
			...matrix.columns.map((a) => h('th', { scope: 'col' }, actionLabel(texts, a)))
		)
	);
}

function matrixCell(ctx: MatrixContext, cell: Cell, r: number, c: number): HTMLElement {
	const { texts } = ctx;
	if (!cell.result) return h('td', {}, h('span', { class: 'pg-na-dot' }), h('span', { class: 'visually-hidden' }, tx(texts, 'legend_na')));
	const selected = cell.category === ctx.selected.category && cell.action === ctx.selected.action;
	const label = cellLabel(texts, cell.category, cell.action, cell.result.decision, cell.result.rule_id);
	return h(
		'td',
		{},
		h(
			'button',
			{
				type: 'button',
				class: 'pg-cell',
				'data-row': r,
				'data-col': c,
				tabindex: '-1',
				'aria-label': label,
				'aria-pressed': selected ? 'true' : 'false',
				title: label,
				onclick: () => ctx.select(cell.category, cell.action)
			},
			chip(cell.result.decision, 'icon', true)
		)
	);
}

function matrixBody(ctx: MatrixContext, matrix: Matrix): HTMLElement {
	const { texts } = ctx;
	return h(
		'tbody',
		{},
		...matrix.rows.map((row, r) =>
			h(
				'tr',
				{},
				h('th', { scope: 'row' }, isIconName(row.category) ? icon(row.category, 16) : null, h('span', {}, categoryLabel(texts, row.category))),
				...row.cells.map((cell, c) => matrixCell(ctx, cell, r, c))
			)
		)
	);
}

/** Arrow keys, Home and End move the single tab stop between the cells that exist. */
function wireKeys(table: HTMLElement, matrix: Matrix): void {
	const rtl = document.documentElement.dir === 'rtl';
	const available = matrix.rows.map((row) => row.cells.map((cell) => cell.result !== null));
	table.addEventListener('keydown', (event) => {
		const target = event.target as HTMLElement;
		let direction = KEYS[event.key];
		if (!direction || !target.matches('button.pg-cell')) return;
		if (rtl && (direction === 'left' || direction === 'right')) direction = direction === 'left' ? 'right' : 'left';
		event.preventDefault();
		const [r, c] = moveInMatrix(available, Number(target.dataset.row), Number(target.dataset.col), direction);
		const next = table.querySelector<HTMLButtonElement>(`button[data-row="${r}"][data-col="${c}"]`);
		if (!next || next === target) return;
		target.setAttribute('tabindex', '-1');
		next.setAttribute('tabindex', '0');
		next.focus();
	});
}

export function renderMatrix(container: HTMLElement, matrix: Matrix, ctx: MatrixContext): void {
	const hadFocus = container.contains(document.activeElement);
	const caption = h('caption', { class: 'visually-hidden' }, tx(ctx.texts, 'matrix_caption'));
	const table = h('table', { class: 'pg-matrix' }, caption, matrixHead(ctx.texts, matrix), matrixBody(ctx, matrix));
	const buttons = [...table.querySelectorAll<HTMLButtonElement>('button.pg-cell')];
	const current = buttons.find((b) => b.getAttribute('aria-pressed') === 'true') ?? buttons[0];
	current?.setAttribute('tabindex', '0');
	wireKeys(table, matrix);
	container.replaceChildren(table);
	if (hadFocus) current?.focus();
}
