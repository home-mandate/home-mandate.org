// One mandate text, read three ways: as JSON (what the rule editor shows), as a mandate
// of the specification (what the evaluation gets, null if invalid) and, if invalid, why.
import { MandateError, parseMandate, type Mandate } from './engine.ts';
import { isObject, type JsonObject } from './model.ts';
import { explainProblem, type Problem } from './problems.ts';

export interface Analysis {
	text: string;
	/** The text as a JSON object; null if it is not one. */
	doc: JsonObject | null;
	/** The valid mandate; null if the text is not a valid mandate. */
	mandate: Mandate | null;
	problem: Problem | null;
}

function parseObject(text: string): JsonObject | null {
	try {
		const value: unknown = JSON.parse(text);
		return isObject(value) ? value : null;
	} catch {
		return null;
	}
}

export function analyse(text: string): Analysis {
	const doc = parseObject(text);
	try {
		return { text, doc, mandate: parseMandate(text), problem: null };
	} catch (e) {
		if (!(e instanceof MandateError)) throw e;
		return { text, doc, mandate: null, problem: explainProblem(text, e, doc) };
	}
}
