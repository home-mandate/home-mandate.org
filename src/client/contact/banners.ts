// The banners above the contact form: the error summary and the outcomes of a
// submission that did not lead to the "sent" page. At most one is shown.
import { required } from '../lib/dom.ts';

export const BANNERS = ['summary', 'failed', 'limit', 'invalid'] as const;
export type BannerKind = (typeof BANNERS)[number];

export function banner(area: ParentNode, kind: BannerKind): HTMLElement {
	return required(`[data-banner="${kind}"]`, area);
}

/** Shows one banner (or none) and hides the others; returns the one shown. */
export function showBanner(area: ParentNode, kind: BannerKind | null): HTMLElement | null {
	for (const other of BANNERS) banner(area, other).hidden = other !== kind;
	return kind ? banner(area, kind) : null;
}
