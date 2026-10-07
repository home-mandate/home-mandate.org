import { expect, it } from 'vitest';
import { groupByInitial, initial } from '../src/lib/content/glossary.ts';

it('initial ignores accents and puts other scripts under #', () => {
	expect(initial('Ähnlich')).toBe('A');
	expect(initial('élan')).toBe('E');
	expect(initial('*')).toBe('#');
	expect(initial('Агент')).toBe('#');
});

it('groups sorted terms by initial', () => {
	const groups = groupByInitial(
		[
			{ term: 'Regel', item: 1 },
			{ term: 'Agent', item: 2 },
			{ term: 'Audit-Log', item: 3 }
		],
		'de'
	);
	expect(groups.map((g) => [g.letter, g.entries.map((e) => e.term)])).toEqual([
		['A', ['Agent', 'Audit-Log']],
		['R', ['Regel']]
	]);
});
