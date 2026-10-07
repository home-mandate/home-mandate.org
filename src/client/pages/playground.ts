// The playground (/playground/): build a mandate, simulate a request, see the decision.
// Decisions and validity come from the implementation in ../playground/engine.ts; this
// script only holds the state in memory and draws it. Nothing is stored or sent.
import { analyse, type Analysis } from '../playground/analyse.ts';
import { evaluate } from '../playground/engine.ts';
import { emptyMandate, isExampleId, type ExampleId } from '../playground/examples.ts';
import { computeMatrix } from '../playground/matrix.ts';
import { addRule, agentName, fileName, formatDoc, isObject, removeRule, updateRule, type JsonObject, type RuleView } from '../playground/model.ts';
import { buildRequest, DAYS, type RequestInput } from '../playground/request.ts';
import { tx, type Texts } from '../playground/texts.ts';
import { download, initCopyButton, renderGutter, renderValidity, setEditorText, type JsonElements } from '../playground/view/json.ts';
import { renderMatrix } from '../playground/view/matrix.ts';
import { findForm, readRequest, readValue, setRequest, syncCategory, syncValue } from '../playground/view/request.ts';
import { renderLine, renderResult, shortRequest } from '../playground/view/result.ts';
import { refreshRules, renderRules, type RulesContext } from '../playground/view/rules.ts';
import { initTabs } from '../playground/view/tabs.ts';

const PHONE = '(max-width: 767px)';

function required<T extends HTMLElement>(id: string): T {
	const el = document.getElementById(id);
	if (!el) throw new Error(`#${id} is missing`);
	return el as T;
}

function start(root: HTMLElement): void {
	const texts = JSON.parse(root.dataset.texts ?? '{}') as Texts;
	const examples = JSON.parse(root.dataset.examples ?? '{}') as Record<string, string>;
	const locale = root.dataset.locale ?? 'en';
	const lang = { texts, locale };

	const form = findForm();
	const rulesEl = required<HTMLElement>('pg-rules');
	const json: JsonElements = {
		textarea: required('pg-json'),
		gutter: required('pg-gutter'),
		badge: required('pg-badge'),
		problem: required('pg-problem')
	};

	const showTab = initTabs(root);

	let analysis: Analysis = analyse(examples.voice ?? '');
	let values: Record<string, number> = {};
	/** The last document that was a JSON object: what the rule editor shows. */
	let doc: JsonObject | null = analysis.doc;

	const textOf = (id: ExampleId): string =>
		id === 'build' ? formatDoc(emptyMandate(tx(texts, 'my_agent'))) : (examples[id] ?? '');

	const rulesContext = (): RulesContext => {
		const approval = isObject(doc?.approval) ? doc.approval : {};
		return {
			lang,
			agent: agentName(doc, tx(texts, 'my_agent')),
			approval: {
				timeout: typeof approval.timeout === 'string' ? approval.timeout : 'PT2M',
				approvers: Array.isArray(approval.approvers) ? approval.approvers.filter((a): a is string => typeof a === 'string') : []
			},
			edit,
			remove: (index) => {
				if (!doc) return;
				setText(formatDoc(removeRule(doc, index)), 'rules');
				focusAfterRemove(index);
			}
		};
	};

	function focusAfterRemove(index: number): void {
		const cards = [...rulesEl.querySelectorAll<HTMLElement>('.pg-rule')];
		const next = cards.find((c) => Number(c.dataset.index) >= index) ?? cards[cards.length - 1];
		(next ?? required<HTMLElement>('pg-add')).focus();
	}

	function edit(index: number, change: (view: RuleView) => RuleView, structural: boolean): void {
		if (!doc) return;
		setText(formatDoc(updateRule(doc, index, change)), structural ? 'rules' : 'field');
	}

	/** source: who changed the text; that part is not drawn again (keeps the caret). */
	function setText(text: string, source: 'example' | 'rules' | 'field' | 'json'): void {
		analysis = analyse(text);
		if (analysis.doc) doc = analysis.doc;
		if (source !== 'json') setEditorText(json, text);
		if (source === 'field') refreshRules(rulesEl, doc, rulesContext());
		else if (source !== 'json' || analysis.doc) renderRules(rulesEl, doc, rulesContext());
		const count = Array.isArray(doc?.rules) ? doc.rules.length : 0;
		required('pg-rule-count').textContent = count === 1 ? tx(texts, 'rules_one') : tx(texts, 'rules_other', { count });
		renderGutter(json, analysis.problem?.line);
		renderValidity(json, texts, analysis.problem, goToRule);
		evaluateRequest();
	}

	function goToRule(index: number): void {
		showTab('rules');
		document.getElementById(`pg-rule-${index}`)?.focus();
	}

	function evaluateRequest(): void {
		const input: RequestInput = readRequest(form, values);
		const request = buildRequest(input);
		const result = evaluate(analysis.mandate, request);
		renderResult(required('pg-result'), texts, analysis.mandate, request, result);
		const day = DAYS[input.day] ?? 'mon';
		renderLine(required('pg-line-text'), required('pg-line-chip'), shortRequest(texts, request, day, input.time), result);
		required('pg-matrix-at').textContent = tx(texts, 'matrix_at', { day: tx(texts, `day_${day}`), time: input.time });
		renderMatrix(required('pg-matrix'), computeMatrix(analysis.mandate, input), {
			texts,
			selected: { category: input.category, action: input.action },
			select: (category, action) => {
				setRequest(form, texts, locale, category, action, values);
				evaluateRequest();
				if (window.matchMedia(PHONE).matches) showTab('test');
			}
		});
	}

	// Step 1: examples.
	for (const radio of root.querySelectorAll<HTMLInputElement>('input[name="pg-example"]')) {
		radio.addEventListener('change', () => {
			if (radio.checked && isExampleId(radio.value)) setText(textOf(radio.value), 'example');
		});
	}

	required('pg-add').addEventListener('click', () => {
		if (!doc) return;
		setText(formatDoc(addRule(doc)), 'rules');
		const cards = rulesEl.querySelectorAll<HTMLElement>('.pg-rule');
		cards[cards.length - 1]?.querySelector<HTMLElement>('select')?.focus();
	});

	// Step 3: the request form.
	form.category.addEventListener('change', () => {
		syncCategory(form, texts, locale, form.action.value, values);
		evaluateRequest();
	});
	form.action.addEventListener('change', () => {
		syncValue(form, texts, locale, values);
		evaluateRequest();
	});
	form.value.addEventListener('input', () => {
		values = readValue(form, values);
		evaluateRequest();
	});
	for (const el of [form.day, form.time, form.area, form.entity, form.critical]) {
		el.addEventListener(el instanceof HTMLSelectElement || el.type === 'checkbox' ? 'change' : 'input', evaluateRequest);
	}

	// Step 6: JSON.
	json.textarea.addEventListener('input', () => setText(json.textarea.value, 'json'));
	initCopyButton(required('pg-copy'), required('pg-copy-status'), texts, () => json.textarea.value);
	required('pg-download').addEventListener('click', () => download(json.textarea.value, fileName(analysis.doc ?? doc)));

	syncCategory(form, texts, locale, form.action.value, values);
	const checked = root.querySelector<HTMLInputElement>('input[name="pg-example"]:checked');
	setText(textOf(checked && isExampleId(checked.value) ? checked.value : 'voice'), 'example');
}

const root = document.getElementById('pg');
if (root) start(root);

