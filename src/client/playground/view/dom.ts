// Small DOM helpers for the playground views. No innerHTML anywhere: text goes in as
// text nodes, and no element gets a style attribute (the CSP forbids inline styles).
import { ICONS, type IconName } from '../../../lib/icons.ts';

type Child = Node | string | null | undefined | false;
type Attr = string | number | boolean | undefined | null | ((event: Event) => void);

const PROPERTIES = new Set(['value', 'checked', 'selected', 'disabled']);

/** Creates an element: attributes, on<event> listeners, a few properties, children. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, Attr> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	for (const [name, value] of Object.entries(attrs)) {
		if (value === undefined || value === null || value === false) continue;
		if (typeof value === 'function') el.addEventListener(name.slice(2), value);
		else if (PROPERTIES.has(name)) (el as unknown as Record<string, unknown>)[name] = value;
		else if (name === 'class') el.className = String(value);
		else el.setAttribute(name, value === true ? '' : String(value));
	}
	append(el, ...children);
	return el;
}

export function append(parent: Node, ...children: Child[]): void {
	for (const child of children) {
		if (child === null || child === undefined || child === false) continue;
		parent.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
	}
}

export function clear(el: Element): void {
	el.replaceChildren();
}

const SVG = 'http://www.w3.org/2000/svg';

/** A decorative icon (aria-hidden), as the Icon component draws it. */
export function icon(name: IconName, size = 18, stroke = 1.75): SVGSVGElement {
	const svg = document.createElementNS(SVG, 'svg');
	for (const [k, v] of Object.entries({
		width: size,
		height: size,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		'stroke-width': stroke,
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		focusable: 'false',
		'aria-hidden': 'true'
	})) {
		svg.setAttribute(k, String(v));
	}
	const path = document.createElementNS(SVG, 'path');
	path.setAttribute('d', ICONS[name]);
	svg.appendChild(path);
	return svg;
}

export function isIconName(name: string): name is IconName {
	return Object.hasOwn(ICONS, name);
}

/** A decision chip, cloned from the page's <template id="pg-chips"> (Decision component). */
export function chip(value: string, size: 'sm' | 'xl' | 'icon' = 'sm', hidden = false): Element {
	const template = document.getElementById('pg-chips') as HTMLTemplateElement | null;
	const decision = value === 'allow' || value === 'ask' ? value : 'deny';
	const found = template?.content.querySelector(`[data-chip="${decision}-${size}"] > *`);
	const el = found ? (found.cloneNode(true) as Element) : h('span', {}, decision);
	if (hidden) {
		el.setAttribute('aria-hidden', 'true');
		el.querySelector('[aria-label]')?.removeAttribute('role');
	}
	return el;
}

/** Keeps focus on the control with the same data-focus key after a re-render. */
export function rerender(container: Element, render: () => void): void {
	const active = document.activeElement;
	const key = active instanceof HTMLElement && container.contains(active) ? active.dataset.focus : undefined;
	render();
	if (key === undefined) return;
	const target = [...container.querySelectorAll<HTMLElement>('[data-focus]')].find((el) => el.dataset.focus === key);
	target?.focus();
}
