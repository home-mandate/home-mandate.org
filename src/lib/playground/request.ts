// The simulated request: what the PEP would pass to the evaluation (SPEC-v0 section 4).
// The point in time is a day of a fixed reference week at a clock time in the
// household time zone, written as an RFC 3339 timestamp with that zone's offset.
import type { ParameterValue, Request } from './engine.ts';
import { isCategory, parameterInfo, parametersOf, type ParameterInfo } from './vocab.ts';
import { vocabulary } from './engine.ts';

export const HOUSEHOLD_ZONE = 'Europe/Berlin';
/** Monday of the reference week, inside the validity of the example mandates. */
export const REFERENCE_MONDAY = '2026-10-12';
/** Days of the week, Monday first (index 0). */
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
/** Default value of a parameter without a range, in displayed units: a room temperature. */
const DEFAULT_DISPLAYED: Readonly<Record<string, number>> = { 'degree Celsius': 21, 'degree Fahrenheit': 70 };
const DEFAULT_OTHER = 21;

export interface RequestInput {
	category: string;
	action: string;
	/**
	 * The areas of the resource as typed, separated by commas or spaces (SPEC-v0
	 * section 3.4: its room and every location above it). Empty: no area.
	 */
	areas: string;
	/** Empty: the default identifier of the category. */
	entityId: string;
	/** The directory marks the resource as critical. */
	critical: boolean;
	/** 0 = Monday. */
	day: number;
	/** "HH:MM" */
	time: string;
	/** Values per parameter name: integers in the unit of the vocabulary, or strings. */
	parameters: Readonly<Record<string, ParameterValue>>;
	/**
	 * The parameter the request carries when the action has one per unit
	 * (temperature in °C or °F, SPEC-v0 section 4.5). Missing or not one of
	 * the action's: the first.
	 */
	parameter?: string;
}

/**
 * The set of areas a request carries: the typed identifiers in their order. Duplicates
 * stay, so that the evaluation reports the request as invalid, as a PEP would.
 */
export function parseAreas(text: string): string[] {
	return text.split(/[\s,]+/).filter((a) => a !== '');
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

/**
 * Default value of a parameter: the first permitted value of a string, the middle of the
 * range of an integer in the unit of the vocabulary, otherwise a room temperature.
 */
export function defaultParameter(category: string, action: string, name: string): ParameterValue {
	const raw = vocabulary[category]?.actions[action]?.parameters?.[name];
	const info = parameterInfo(name, raw ?? {});
	if (info.type === 'string') return info.values?.[0] ?? '';
	if (info.minimum !== undefined && info.maximum !== undefined) return Math.round((info.minimum + info.maximum) / 2);
	return (DEFAULT_DISPLAYED[info.unit] ?? DEFAULT_OTHER) * info.scale;
}

/**
 * The parameter a request for the action carries. The vocabulary gives an action
 * several parameters only for one quantity in several units, and a PEP derives
 * exactly one of them (SPEC-v0 section 4.5): the chosen one, otherwise the first.
 */
export function chosenParameter(category: string, action: string, name?: string): ParameterInfo | undefined {
	const params = parametersOf(category, action);
	return params.find((p) => p.name === name) ?? params[0];
}

/** Parameters the request carries: the chosen one of the action, with the given or default value. */
export function requestParameters(input: RequestInput): Record<string, ParameterValue> {
	const p = chosenParameter(input.category, input.action, input.parameter);
	if (!p) return {};
	return { [p.name]: input.parameters[p.name] ?? defaultParameter(input.category, input.action, p.name) };
}

export function buildRequest(input: RequestInput, zone = HOUSEHOLD_ZONE): Request {
	const resource: Request['resource'] = {
		entity_id: input.entityId.trim() === '' ? defaultEntityId(input.category) : input.entityId.trim(),
		category: input.category
	};
	const areas = parseAreas(input.areas);
	if (areas.length > 0) resource.areas = areas;
	if (input.critical) resource.critical = true;
	const request: Request = { resource, action: input.action, time: requestTime(input.day, input.time, zone), timezone: zone };
	const parameters = isCategory(input.category) ? requestParameters(input) : {};
	if (Object.keys(parameters).length > 0) request.parameters = parameters;
	return request;
}
