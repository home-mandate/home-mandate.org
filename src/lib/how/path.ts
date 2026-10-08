// The three paths of the path diagram on /how-it-works/. Shared by the rendered
// page (PathDiagram.svelte) and its browser script (src/client/lib/how.ts), so no
// $lib imports here: the browser bundle imports this file directly.

export const PATHS = ['allow', 'ask', 'deny'] as const;
export type Path = (typeof PATHS)[number];
/** Shown without JavaScript, and the starting point with it. */
export const DEFAULT_PATH: Path = 'ask';

export function isPath(value: string | undefined): value is Path {
	return (PATHS as readonly string[]).includes(value ?? '');
}
