// Labels for the critical actions of the vocabulary. The list itself comes
// from vocabulary/v0.json; a critical action a later vocabulary adds without a
// translated label is still shown, under its identifier.
import type { CriticalAction } from './vocabulary';

export function criticalKey(c: Pick<CriticalAction, 'category' | 'action'>): string {
	return `how_crit_${c.category}_${c.action}`;
}

export function criticalLabel(c: CriticalAction, lookup: (key: string) => string | undefined): string {
	return lookup(criticalKey(c)) ?? c.id;
}
