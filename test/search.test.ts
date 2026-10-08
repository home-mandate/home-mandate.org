import { expect, it } from 'vitest';
import { fold, matches } from '../src/client/lib/search.ts';

it('fold ignores case and accents', () => {
	expect(fold('Kritische AKTIONEN, Größe')).toBe('kritische aktionen, große');
});

it('every word must match, empty queries match nothing', () => {
	expect(matches('kritische aktion', 'Kritische Aktionen im Vokabular')).toBe(true);
	expect(matches('kritisch spielplatz', 'Kritische Aktionen')).toBe(false);
	expect(matches('   ', 'anything')).toBe(false);
});
