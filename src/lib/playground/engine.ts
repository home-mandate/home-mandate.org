// The evaluation the playground shows is the one of the specification: validation and
// evaluation come from spec-ts, an independent implementation that passes the
// conformance cases of the specification (test/playground-conformance.test.ts runs them
// through this very module). The playground adds no decision logic of its own.
// Shared by the rendered page (src/lib/components/playground/) and its browser script
// (src/client/pages/playground.ts): relative imports only, no $lib (the browser bundle
// imports this file directly).
export {
	evaluate,
	isCritical,
	MandateError,
	parseMandate,
	tryParseMandate,
	vocabulary,
	type Decision,
	type Mandate,
	type Request,
	type Result,
	type Rule
} from '@home-mandate/spec/browser';
