// sitemap.xml, llms.txt and llms-full.txt from the built pages: canonical,
// hreflang, noindex and the date of the last change come from the HTML itself,
// so the sitemap cannot contradict it.

const OWN_ORIGIN = 'https://home-mandate.org/';
const SITEMAP_URL = `${OWN_ORIGIN}sitemap.xml`;

export interface PageInfo {
	canonical: string | undefined;
	alternates: { hreflang: string; href: string }[];
	title: string;
	description: string;
	noindex: boolean;
	/** article:modified_time, where the page has a real date (releases of the specification). */
	modified?: string;
}

const decode = (text: string): string =>
	text
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
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
	const modified = metas.find((m) => attr(m, 'property') === 'article:modified_time');
	return {
		canonical: canonical ? attr(canonical, 'href') : undefined,
		alternates: links
			.filter((l) => attr(l, 'rel') === 'alternate' && attr(l, 'hreflang') !== undefined)
			.map((l) => ({ hreflang: attr(l, 'hreflang') ?? '', href: attr(l, 'href') ?? '' })),
		title: decode(/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? ''),
		description: description ? (attr(description, 'content') ?? '') : '',
		noindex: robots ? /noindex/i.test(attr(robots, 'content') ?? '') : false,
		...(modified ? { modified: attr(modified, 'content') } : {})
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
		const lastmod = p.modified ? [`\t\t<lastmod>${escapeXml(p.modified)}</lastmod>`] : [];
		return ['\t<url>', `\t\t<loc>${escapeXml(p.canonical)}</loc>`, ...lastmod, ...alternates, '\t</url>'].join('\n');
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
type Site = { name: string; summary: string; languages: string[] };

/** Indexable pages in English: no language prefix of another site language. */
function english<T extends PageInfo>(pages: T[], site: Site): (T & { canonical: string })[] {
	const prefixes = site.languages.filter((l) => l !== 'en').map((l) => `${OWN_ORIGIN}${l}/`);
	return (indexable(pages) as (T & { canonical: string })[]).filter((p) => !prefixes.some((prefix) => p.canonical.startsWith(prefix)));
}

const shortTitle = (title: string, site: Site): string => {
	const suffix = ` – ${site.name}`;
	return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
};

export function llmsTxt(pages: PageInfo[], site: Site): string {
	const lines = english(pages, site).map((p) => `- [${shortTitle(p.title, site)}](${p.canonical})${p.description ? `: ${p.description}` : ''}`);
	return `# ${site.name}\n\n> ${site.summary}\n\nThe full text of these pages: ${OWN_ORIGIN}llms-full.txt\n\n## Pages\n\n${lines.join('\n')}\n`;
}

const BLOCK = /<\/?(?:p|div|section|article|header|ul|ol|table|tr|pre|dl|dt|dd|details|summary|figure|blockquote|br)\b[^>]*>/gi;

/**
 * The main content of a built page as plain text for llms-full.txt: headings
 * as Markdown headings, list items as "- ", no navigation, buttons, icons,
 * scripts or visually hidden hints.
 */
export function pageText(html: string): string {
	const main = /<main\b[^>]*>([\s\S]*)<\/main>/i.exec(html)?.[1];
	if (main === undefined) return '';
	const text = main
		.replace(/<(script|style|svg|nav|button|template)\b[\s\S]*?<\/\1>/gi, '')
		.replace(/<span class="[^"]*\bvisually-hidden\b[^"]*">[\s\S]*?<\/span>/gi, '')
		.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, inner: string) => `\n\n${'#'.repeat(Number(level))} ${inner}\n\n`)
		.replace(/<li\b[^>]*>/gi, '\n- ')
		.replace(BLOCK, '\n')
		.replace(/<[^>]+>/g, '');
	return decode(text)
		.split('\n')
		.map((line) => line.replace(/[ \t]+/g, ' ').trim())
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/** llms-full.txt: the text of every English indexable page, one after the other. */
export function llmsFullTxt(pages: { info: PageInfo; text: string }[], site: Site): string {
	const withText = pages.map((p) => ({ ...p.info, text: p.text }));
	const sections = english(withText, site)
		.filter((p) => p.text !== '')
		.map((p) => `---\n\nSource: ${p.canonical}\n\n${p.text}\n`);
	return `# ${site.name}\n\n> ${site.summary}\n\n${sections.join('\n')}`;
}

/** robots.txt names the sitemap and shuts no crawler out of the whole site. */
export function checkRobots(text: string): string[] {
	const problems: string[] = [];
	if (!/^Sitemap:\s*https:\/\/home-mandate\.org\/sitemap\.xml\s*$/m.test(text)) problems.push(`robots.txt: Sitemap: ${SITEMAP_URL} is missing`);
	if (/^Disallow:\s*\/\s*$/m.test(text)) problems.push('robots.txt: Disallow: / shuts crawlers out of the whole site');
	return problems;
}

/** indexnow.txt holds the public IndexNow key (indexnow.org): 8-128 of a-z, A-Z, 0-9 and "-". */
export function checkIndexNowKey(text: string): string[] {
	return /^[A-Za-z0-9-]{8,128}$/.test(text.trim()) ? [] : ['indexnow.txt: not a valid IndexNow key (8-128 letters, digits, "-")'];
}
