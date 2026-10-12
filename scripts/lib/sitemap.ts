// sitemap.xml and llms.txt from the built pages: canonical, hreflang and
// noindex come from the HTML itself, so the sitemap cannot contradict it.

const OWN_ORIGIN = 'https://home-mandate.org/';
const SITEMAP_URL = `${OWN_ORIGIN}sitemap.xml`;

export interface PageInfo {
	canonical: string | undefined;
	alternates: { hreflang: string; href: string }[];
	title: string;
	description: string;
	noindex: boolean;
}

const decode = (text: string): string =>
	text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const escapeXml = (text: string): string =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = (tag: string, name: string): string | undefined => {
	const value = new RegExp(`\\s${name}="([^"]*)"`, 'i').exec(tag)?.[1];
	return value === undefined ? undefined : decode(value);
};

/** What the sitemap and llms.txt need from one built HTML page. */
export function pageInfo(html: string): PageInfo {
	const links = html.match(/<link\b[^>]*>/gi) ?? [];
	const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
	const canonical = links.find((l) => attr(l, 'rel') === 'canonical');
	const description = metas.find((m) => attr(m, 'name') === 'description');
	const robots = metas.find((m) => attr(m, 'name') === 'robots');
	return {
		canonical: canonical ? attr(canonical, 'href') : undefined,
		alternates: links
			.filter((l) => attr(l, 'rel') === 'alternate' && attr(l, 'hreflang') !== undefined)
			.map((l) => ({ hreflang: attr(l, 'hreflang') ?? '', href: attr(l, 'href') ?? '' })),
		title: decode(/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? ''),
		description: description ? (attr(description, 'content') ?? '') : '',
		noindex: robots ? /noindex/i.test(attr(robots, 'content') ?? '') : false
	};
}

type Indexed = PageInfo & { canonical: string };

/** Indexable pages, one per canonical address, sorted by address. */
function indexable(pages: PageInfo[]): Indexed[] {
	const byUrl = new Map<string, Indexed>();
	for (const p of pages) {
		if (p.noindex || p.canonical === undefined || byUrl.has(p.canonical)) continue;
		byUrl.set(p.canonical, p as Indexed);
	}
	return [...byUrl.values()].sort((a, b) => a.canonical.localeCompare(b.canonical));
}

export function sitemapXml(pages: PageInfo[]): string {
	const urls = indexable(pages).map((p) => {
		for (const url of [p.canonical, ...p.alternates.map((a) => a.href)]) {
			if (!url.startsWith(OWN_ORIGIN)) throw new Error(`sitemap: ${url} is outside ${OWN_ORIGIN}`);
		}
		const alternates = p.alternates.map((a) => `\t\t<xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${escapeXml(a.href)}"/>`);
		return ['\t<url>', `\t\t<loc>${escapeXml(p.canonical)}</loc>`, ...alternates, '\t</url>'].join('\n');
	});
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...urls,
		'</urlset>',
		''
	].join('\n');
}

/**
 * llms.txt (llmstxt.org): the site in a few lines for language models, with
 * the English pages only. A page is English when its address carries no
 * language prefix of another site language.
 */
export function llmsTxt(pages: PageInfo[], site: { name: string; summary: string; languages: string[] }): string {
	const prefixes = site.languages.filter((l) => l !== 'en').map((l) => `${OWN_ORIGIN}${l}/`);
	const suffix = ` – ${site.name}`;
	const lines = indexable(pages)
		.filter((p) => !prefixes.some((prefix) => p.canonical.startsWith(prefix)))
		.map((p) => {
			const title = p.title.endsWith(suffix) ? p.title.slice(0, -suffix.length) : p.title;
			return `- [${title}](${p.canonical})${p.description ? `: ${p.description}` : ''}`;
		});
	return `# ${site.name}\n\n> ${site.summary}\n\n## Pages\n\n${lines.join('\n')}\n`;
}

/** robots.txt names the sitemap and shuts no crawler out of the whole site. */
export function checkRobots(text: string): string[] {
	const problems: string[] = [];
	if (!/^Sitemap:\s*https:\/\/home-mandate\.org\/sitemap\.xml\s*$/m.test(text)) problems.push(`robots.txt: Sitemap: ${SITEMAP_URL} is missing`);
	if (/^Disallow:\s*\/\s*$/m.test(text)) problems.push('robots.txt: Disallow: / shuts crawlers out of the whole site');
	return problems;
}
