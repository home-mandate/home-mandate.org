// The simulated request: what the PEP would pass to the evaluation (SPEC-v0 section 4).
// The point in time is a day of a fixed reference week at a clock time in the
// household time zone, written as an RFC 3339 timestamp with that zone's offset.
import type { Request } from './engine.ts';
import { isCategory, parameterInfo, parametersOf } from './vocab.ts';
import { vocabulary } from './engine.ts';

export const HOUSEHOLD_ZONE = 'Europe/Berlin';
/** Monday of the reference week, inside the validity of the example mandates. */
export const REFERENCE_MONDAY = '2026-10-12';
/** Days of the week, Monday first (index 0). */
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
/** Default value of a parameter without a range, in displayed units (a room temperature). */
const DEFAULT_DISPLAYED = 21;

export interface RequestInput {
	category: string;
	action: string;
	/** Empty: the resource has no area. */
	area: string;
	/** Empty: the default identifier of the category. */
	entityId: string;
	/** The directory marks the resource as critical. */
	critical: boolean;
	/** 0 = Monday. */
	day: number;
	/** "HH:MM" */
	time: string;
	/** Values per parameter name, in the unit of the vocabulary. */
	parameters: Readonly<Record<string, number>>;
}

/** Identifier of a resource of the category when none is given. */
export function defaultEntityId(category: string): string {
	return `${category}.example`;
}

/** The date of a day of the reference week, "2026-10-14" for Wednesday. */
export function referenceDate(day: number): string {
	const date = new Date(`${REFERENCE_MONDAY}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + day);
	return date.toISOString().slice(0, 10);
}

/** UTC offset of a zone at an instant, as "+02:00". */
export function offsetAt(ms: number, zone: string): string {
	const name = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
		.formatToParts(new Date(ms))
		.find((p) => p.type === 'timeZoneName')?.value;
	const match = /^GMT([+-]\d{2}:\d{2})$/.exec(name ?? '');
	return match?.[1] ?? '+00:00';
}

function offsetMinutes(offset: string): number {
	const sign = offset.startsWith('-') ? -1 : 1;
	return sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(4, 6)));
}

/** RFC 3339 timestamp of a local date and clock time in a zone. */
export function localTimestamp(date: string, time: string, zone: string): string {
	const local = Date.parse(`${date}T${time}:00Z`);
	// The offset at the guessed instant, then again at the corrected one (DST edges).
	const first = offsetAt(local, zone);
	const offset = offsetAt(local - offsetMinutes(first) * 60_000, zone);
	return `${date}T${time}:00${offset}`;
}

export function requestTime(day: number, time: string, zone = HOUSEHOLD_ZONE): string {
	return localTimestamp(referenceDate(day), time, zone);
}

/** Default value of a parameter in the unit of the vocabulary: the middle of its range. */
export function defaultParameter(category: string, action: string, name: string): number {
	const raw = vocabulary[category]?.actions[action]?.parameters?.[name];
	const info = parameterInfo(name, raw ?? {});
	if (info.minimum !== undefined && info.maximum !== undefined) return Math.round((info.minimum + info.maximum) / 2);
	return DEFAULT_DISPLAYED * info.scale;
}

/** Parameters the request carries: those the action has, with the given or default value. */
export function requestParameters(input: RequestInput): Record<string, number> {
	const out: Record<string, number> = {};
	for (const p of parametersOf(input.category, input.action)) {
		out[p.name] = input.parameters[p.name] ?? defaultParameter(input.category, input.action, p.name);
	}
	return out;
}

export function buildRequest(input: RequestInput, zone = HOUSEHOLD_ZONE): Request {
	const resource: Request['resource'] = {
		entity_id: input.entityId.trim() === '' ? defaultEntityId(input.category) : input.entityId.trim(),
		category: input.category
	};
	if (input.area.trim() !== '') resource.area = input.area.trim();
	if (input.critical) resource.critical = true;
	const request: Request = { resource, action: input.action, time: requestTime(input.day, input.time, zone), timezone: zone };
	const parameters = isCategory(input.category) ? requestParameters(input) : {};
	if (Object.keys(parameters).length > 0) request.parameters = parameters;
	return request;
}
