// State of the interactive parts of /how-it-works/. The page renders every
// state in its HTML; the script only switches data attributes on the roots.

export const PATHS = ['allow', 'ask', 'deny'] as const;
export type Path = (typeof PATHS)[number];
/** Shown without JavaScript, and the starting point with it. */
export const DEFAULT_PATH: Path = 'ask';

export function isPath(value: string | undefined): value is Path {
	return (PATHS as readonly string[]).includes(value ?? '');
}

/** Path diagram: the checked radio decides data-path on the diagram's root. */
export function initPath(root: HTMLElement): void {
	const radios = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"][data-path-choice]')];
	const apply = (): void => {
		const value = radios.find((r) => r.checked)?.value;
		root.dataset.path = isPath(value) ? value : DEFAULT_PATH;
	};
	for (const radio of radios) radio.addEventListener('change', apply);
	apply();
}

/** Hash chain: the button toggles data-tampered (entry 2 edited or not). */
export function toggleTampered(root: HTMLElement): boolean {
	const tampered = !root.hasAttribute('data-tampered');
	root.toggleAttribute('data-tampered', tampered);
	return tampered;
}

export function initChain(root: HTMLElement): void {
	const button = root.querySelector<HTMLButtonElement>('[data-tamper]');
	button?.addEventListener('click', () => toggleTampered(root));
}
