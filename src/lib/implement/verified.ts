// The conformance classes of an implementation that a checked report backs (see
// scripts/import-conformance.ts); every other declared class is "declared".
import type { ConformanceClass } from '$lib/content/implementations';
import { conformance } from '$lib/generated/conformance';

export interface VerifiedConformance {
	/** Where the run is published. */
	run: string;
	/** Classes a report shows as passed, with their case counts. */
	classes: Partial<Record<string, { cases: number; passed: number }>>;
}

export type VerifiedList = Readonly<Record<string, VerifiedConformance>>;

/** The checked reports of this build. */
export const VERIFIED: VerifiedList = conformance;

export function isPassed(verified: VerifiedList, name: string, cls: ConformanceClass): boolean {
	return verified[name]?.classes[cls] !== undefined;
}

export function conformanceRun(verified: VerifiedList, name: string): string | undefined {
	return verified[name]?.run;
}
