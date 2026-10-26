// Links to other websites open in a new tab, links within the site in the same
// one. Applied to every rendered page (hooks.server.ts), so no component has
// to remember it. The visually hidden "(opens another website …)" text tells
// screen reader users.
import { SITE_URL } from './site';

const EXTERNAL_LINK = /<a\b([^>]*?)\shref="(https:\/\/[^"]*)"([^>]*)>/g;

export function externalLinksInNewTab(html: string): string {
	return html.replace(EXTERNAL_LINK, (tag: string, before: string, href: string, after: string) => {
		if (href === SITE_URL || href.startsWith(`${SITE_URL}/`) || /\starget=/.test(`${before} ${after}`)) return tag;
		return `<a${before} href="${href}"${after} target="_blank" rel="noopener">`;
	});
}
