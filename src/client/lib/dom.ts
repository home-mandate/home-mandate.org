// Small DOM helpers shared by the page scripts.

/** The element a selector finds, or an error: the page script and its HTML belong together. */
export function required<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
	const el = root.querySelector<T>(selector);
	if (!el) throw new Error(`${selector} is missing`);
	return el;
}

/** An id reference list (aria-describedby) with one id added or removed; null when empty. */
export function withId(list: string | null, id: string, present: boolean): string | null {
	const ids = (list ?? '').split(/\s+/).filter((token) => token !== '' && token !== id);
	const next = present ? [...ids, id] : ids;
	return next.length > 0 ? next.join(' ') : null;
}

/**
 * Marks a control as invalid or valid: aria-invalid="true" or no attribute (an empty
 * aria-invalid is not "true"). With an error element, shows it and links it to the
 * control through aria-describedby while the control is invalid.
 */
export function setInvalid(control: Element, invalid: boolean, error?: HTMLElement): void {
	if (invalid) control.setAttribute('aria-invalid', 'true');
	else control.removeAttribute('aria-invalid');
	if (!error) return;
	error.hidden = !invalid;
	const described = withId(control.getAttribute('aria-describedby'), error.id, invalid);
	if (described === null) control.removeAttribute('aria-describedby');
	else control.setAttribute('aria-describedby', described);
}
