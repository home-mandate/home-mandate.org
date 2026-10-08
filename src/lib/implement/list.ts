// Filtering the implementation list by kind. Shared by the page (counts on the
// pills, rendered at build time) and the browser script (which rows to show).
import type { Implementation, ImplementationKind } from '../content/implementations';

export const KIND_FILTERS = ['all', 'guard', 'integration', 'library', 'tool'] as const;
export type KindFilter = (typeof KIND_FILTERS)[number];

export function isKindFilter(value: unknown): value is KindFilter {
	return typeof value === 'string' && (KIND_FILTERS as readonly string[]).includes(value);
}

/** Whether an entry with these kinds is shown under the filter. */
export function matchesFilter(kinds: readonly string[], filter: KindFilter): boolean {
	return filter === 'all' || kinds.includes(filter);
}

/** Number of entries per filter; an entry with several kinds counts for each. */
export function kindCounts(list: readonly Pick<Implementation, 'kinds'>[]): Record<KindFilter, number> {
	const counts = Object.fromEntries(KIND_FILTERS.map((f) => [f, 0])) as Record<KindFilter, number>;
	for (const item of list) {
		for (const filter of KIND_FILTERS) {
			if (matchesFilter(item.kinds, filter)) counts[filter] += 1;
		}
	}
	return counts;
}

/** data-kinds attribute value: "library tool" */
export function kindsAttribute(kinds: readonly ImplementationKind[]): string {
	return kinds.join(' ');
}

/** How many of these entries the filter shows. */
export function shownCount(entries: readonly (readonly string[])[], filter: KindFilter): number {
	return entries.filter((kinds) => matchesFilter(kinds, filter)).length;
}

/** Fills "{count} of {total} shown" (already translated, placeholders kept). */
export function statusText(template: string, count: number, total: number): string {
	return template.replaceAll('{count}', String(count)).replaceAll('{total}', String(total));
}

/** Parses a data-kinds attribute back into its kinds. */
export function parseKinds(attribute: string | null | undefined): string[] {
	return (attribute ?? '').split(' ').filter((k) => k !== '');
}
