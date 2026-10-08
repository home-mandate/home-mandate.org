// Main navigation: paths without language prefix (Paraglide adds it).
export const NAV = [
	{ id: 'why', path: '/why/' },
	{ id: 'how', path: '/how-it-works/' },
	{ id: 'playground', path: '/playground/' },
	{ id: 'implement', path: '/implement/' },
	{ id: 'spec', path: '/spec/v0/' },
	{ id: 'faq', path: '/faq/' }
] as const;

export type NavId = (typeof NAV)[number]['id'];

/** The navigation entry a page belongs to; /implementations/ counts as Implement. */
export function activeNav(basePath: string): NavId | undefined {
	if (basePath.startsWith('/implementations/')) return 'implement';
	return NAV.find((item) => basePath.startsWith(item.path))?.id;
}
