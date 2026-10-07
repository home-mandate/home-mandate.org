// The evaluation the playground shows is the one of the specification: validation and
// evaluation come from mandate-spec-ts, an independent implementation that passes the
// conformance cases of the specification (test/playground-conformance.test.ts runs them
// through this very module). The playground adds no decision logic of its own.
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
} from '@mandate-spec/mandate-spec/browser';
