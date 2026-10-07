// The playground (/playground/): build a mandate, simulate a request, see the decision.
// Decisions and validity come from the implementation in lib/playground/engine.ts; this
// script only holds the state in memory and draws it. Nothing is stored or sent.
// Copying the JSON is the shared copy button of site.ts (lib/copy.ts).
import { analyse, type Analysis } from '../playground/analyse.ts';
import { evaluate } from '../../lib/playground/engine.ts';
import { emptyMandate, isExampleId, type ExampleId } from '../../lib/playground/examples.ts';
import { computeMatrix } from '../playground/matrix.ts';
import { addRule, agentName, fileName, formatDoc, isObject, removeRule, updateRule, type JsonObject, type RuleView } from '../../lib/playground/model.ts';
import { buildRequest, DAYS, type RequestInput } from '../../lib/playground/request.ts';
import { tx, type Texts } from '../../lib/playground/texts.ts';
import { required } from '../lib/dom.ts';
import { download, renderGutter, renderValidity, setEditorText, type JsonElements } from '../playground/view/json.ts';
import { renderMatrix } from '../playground/view/matrix.ts';
import { findForm, readRequest, readValue, setRequest, syncCategory, syncValue, type RequestForm } from '../playground/view/request.ts';
import { renderLine, renderResult, shortRequest } from '../playground/view/result.ts';
import { refreshRules, renderRules, type RulesContext } from '../playground/view/rules.ts';
import { initPhoneTabs } from '../playground/view/tabs.ts';

const PHONE = '(max-width: 767px)';

/** Who changed the text; that part is not drawn again (keeps the caret). */
type Source = 'example' | 'rules' | 'field' | 'json';

interface State {
	analysis: Analysis;
	values: Record<string, number>;
	/** The last document that was a JSON object: what the rule editor shows. */
	doc: JsonObject | null;
}

interface Playground {
	root: HTMLElement;
	texts: Texts;
	locale: string;
	examples: Record<string, string>;
	form: RequestForm;
	rulesEl: HTMLElement;
	json: JsonElements;
	phone: MediaQueryList;
	showTab: (id: string, focus?: boolean) => void;
	state: State;
}

function create(root: HTMLElement): Playground {
	const examples = JSON.parse(root.dataset.examples ?? '{}') as Record<string, string>;
	const analysis = analyse(examples.voice ?? '');
	const phone = window.matchMedia(PHONE);
	return {
		root,
		texts: JSON.parse(root.dataset.texts ?? '{}') as Texts,
		locale: root.dataset.locale ?? 'en',
		examples,
		form: findForm(),
		rulesEl: required('#pg-rules'),
		json: { textarea: required('#pg-json'), gutter: required('#pg-gutter'), badge: required('#pg-badge'), problem: required('#pg-problem') },
		phone,
		showTab: initPhoneTabs(root, phone),
		state: { analysis, values: {}, doc: analysis.doc }
	};
}

function textOf(pg: Playground, id: ExampleId): string {
	return id === 'build' ? formatDoc(emptyMandate(tx(pg.texts, 'my_agent'))) : (pg.examples[id] ?? '');
}

function rulesContext(pg: Playground): RulesContext {
	const { doc } = pg.state;
	const approval = isObject(doc?.approval) ? doc.approval : {};
	return {
		lang: { texts: pg.texts, locale: pg.locale },
		agent: agentName(doc, tx(pg.texts, 'my_agent')),
		approval: {
			timeout: typeof approval.timeout === 'string' ? approval.timeout : 'PT2M',
			approvers: Array.isArray(approval.approvers) ? approval.approvers.filter((a): a is string => typeof a === 'string') : []
		},
		edit: (index, change, structural) => editRule(pg, index, change, structural),
		remove: (index) => removeRuleAt(pg, index)
	};
}

function editRule(pg: Playground, index: number, change: (view: RuleView) => RuleView, structural: boolean): void {
	if (!pg.state.doc) return;
	setText(pg, formatDoc(updateRule(pg.state.doc, index, change)), structural ? 'rules' : 'field');
}

function removeRuleAt(pg: Playground, index: number): void {
	if (!pg.state.doc) return;
	setText(pg, formatDoc(removeRule(pg.state.doc, index)), 'rules');
	const cards = [...pg.rulesEl.querySelectorAll<HTMLElement>('.pg-rule')];
	const next = cards.find((c) => Number(c.dataset.index) >= index) ?? cards[cards.length - 1];
	(next ?? required('#pg-add')).focus();
}

function setText(pg: Playground, text: string, source: Source): void {
	const analysis = analyse(text);
	pg.state = { ...pg.state, analysis, doc: analysis.doc ?? pg.state.doc };
	const { doc } = pg.state;
	if (source !== 'json') setEditorText(pg.json, text);
	if (source === 'field') refreshRules(pg.rulesEl, doc, rulesContext(pg));
	else if (source !== 'json' || analysis.doc) renderRules(pg.rulesEl, doc, rulesContext(pg));
	const count = Array.isArray(doc?.rules) ? doc.rules.length : 0;
	required('#pg-rule-count').textContent = count === 1 ? tx(pg.texts, 'rules_one') : tx(pg.texts, 'rules_other', { count });
	renderGutter(pg.json, analysis.problem?.line);
	renderValidity(pg.json, pg.texts, analysis.problem, (index) => goToRule(pg, index));
	evaluateRequest(pg);
}

function goToRule(pg: Playground, index: number): void {
	pg.showTab('rules');
	document.getElementById(`pg-rule-${index}`)?.focus();
}

function evaluateRequest(pg: Playground): void {
	const { texts } = pg;
	const { mandate } = pg.state.analysis;
	const input: RequestInput = readRequest(pg.form, pg.state.values);
	const request = buildRequest(input);
	const result = evaluate(mandate, request);
	renderResult(required('#pg-result'), texts, mandate, request, result);
	const day = DAYS[input.day] ?? 'mon';
	renderLine(required('#pg-line-text'), required('#pg-line-chip'), shortRequest(texts, request, day, input.time), result);
	required('#pg-matrix-at').textContent = tx(texts, 'matrix_at', { day: tx(texts, `day_${day}`), time: input.time });
	renderMatrix(required('#pg-matrix'), computeMatrix(mandate, input), {
		texts,
		selected: { category: input.category, action: input.action },
		select: (category, action) => selectFromMatrix(pg, category, action)
	});
}

/** A cell of the overview: test that request (on a phone, show the test tab). */
function selectFromMatrix(pg: Playground, category: string, action: string): void {
	setRequest(pg.form, pg.texts, pg.locale, category, action, pg.state.values);
	evaluateRequest(pg);
	if (pg.phone.matches) pg.showTab('test');
}

/** Step 1: examples. */
function wireExamples(pg: Playground): void {
	for (const radio of pg.root.querySelectorAll<HTMLInputElement>('input[name="pg-example"]')) {
		radio.addEventListener('change', () => {
			if (radio.checked && isExampleId(radio.value)) setText(pg, textOf(pg, radio.value), 'example');
		});
	}
}

/** Step 2: the add button (the cards wire themselves through rulesContext). */
function wireAddRule(pg: Playground): void {
	required('#pg-add').addEventListener('click', () => {
		if (!pg.state.doc) return;
		setText(pg, formatDoc(addRule(pg.state.doc)), 'rules');
		const cards = pg.rulesEl.querySelectorAll<HTMLElement>('.pg-rule');
		cards[cards.length - 1]?.querySelector<HTMLElement>('select')?.focus();
	});
}

/** Step 3: the request form. */
function wireRequestForm(pg: Playground): void {
	const { form, texts, locale } = pg;
	const evaluateNow = (): void => evaluateRequest(pg);
	form.category.addEventListener('change', () => {
		syncCategory(form, texts, locale, form.action.value, pg.state.values);
		evaluateNow();
	});
	form.action.addEventListener('change', () => {
		syncValue(form, texts, locale, pg.state.values);
		evaluateNow();
	});
	form.value.addEventListener('input', () => {
		pg.state = { ...pg.state, values: readValue(form, pg.state.values) };
		evaluateNow();
	});
	for (const el of [form.day, form.time, form.area, form.entity, form.critical]) {
		el.addEventListener(el instanceof HTMLSelectElement || el.type === 'checkbox' ? 'change' : 'input', evaluateNow);
	}
}

/** Step 6: the JSON editor and the download. */
function wireJson(pg: Playground): void {
	pg.json.textarea.addEventListener('input', () => setText(pg, pg.json.textarea.value, 'json'));
	required('#pg-download').addEventListener('click', () => download(pg.json.textarea.value, fileName(pg.state.analysis.doc ?? pg.state.doc)));
}

function start(root: HTMLElement): void {
	const pg = create(root);
	wireExamples(pg);
	wireAddRule(pg);
	wireRequestForm(pg);
	wireJson(pg);
	syncCategory(pg.form, pg.texts, pg.locale, pg.form.action.value, pg.state.values);
	const checked = root.querySelector<HTMLInputElement>('input[name="pg-example"]:checked');
	setText(pg, textOf(pg, checked && isExampleId(checked.value) ? checked.value : 'voice'), 'example');
}

const root = document.getElementById('pg');
if (root) start(root);
