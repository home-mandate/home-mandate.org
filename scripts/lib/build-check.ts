// Checks on the generated HTML: what the CSP and the privacy promise of the
// site rely on (no external resources, no inline styles or handlers, no forms
// except the contact form).

const OWN_ORIGIN = 'https://home-mandate.org/';
// Attributes that make the browser load something by itself (not plain <a> links).
const LOADING = /<(script|img|link|source|video|audio|iframe|embed|object)\b[^>]*?\s(src|href|srcset|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const STYLE_ATTR = /<[a-z][^>]*\sstyle\s*=/i;
const HANDLER_ATTR = /<[a-z][^>]*\son[a-z]+\s*=/i;
// The contact page (any language) is the only page with a form, and that form
// posts to the contact service on our own origin.
const FORM_PAGE = /^(?:[a-z]{2,3}(?:-[A-Za-z0-9]+)?\/)?contact\/index\.html$/;
const CONTACT_FORM = /^<form\b(?=[^>]*\saction="\/contact")(?=[^>]*\smethod="post")[^>]*>$/i;
const JSON_LD = /<script type="application\/ld\+json">([^<]*)<\/script>/gi;

/** Pages (paths relative to build/) that may contain the contact form. */
export function isFormPage(path: string): boolean {
	return FORM_PAGE.test(path);
}

function checkForms(html: string, path: string): string[] {
	const forms = html.match(/<form\b[^>]*>/gi) ?? [];
	if (forms.length === 0) return [];
	if (!isFormPage(path)) return ['form (only the contact page has a form)'];
	return forms.filter((tag) => !CONTACT_FORM.test(tag)).map((tag) => `form not posting to /contact: ${tag}`);
}

/** Problems of one built HTML file; path is relative to build/ (e.g. de/contact/index.html). */
export function checkHtml(html: string, path = ''): string[] {
	const problems: string[] = [];
	if (!/<meta http-equiv="content-security-policy"/i.test(html)) problems.push('missing Content-Security-Policy meta tag');
	if (!/<html[^>]*\slang="[a-zA-Z-]+"/.test(html)) problems.push('missing lang attribute on <html>');
	for (const match of html.matchAll(LOADING)) {
		const [, tag, , dq, sq, bare] = match;
		const url = dq ?? sq ?? bare ?? '';
		const external = /^(https?:)?\/\//i.test(url) && !url.startsWith(OWN_ORIGIN);
		if (external) problems.push(`external resource in <${tag}>: ${url}`);
	}
	if (STYLE_ATTR.test(html)) problems.push('inline style attribute (blocked by the CSP)');
	if (HANDLER_ATTR.test(html)) problems.push('inline event handler attribute');
	if (/<iframe\b/i.test(html)) problems.push('iframe');
	problems.push(...checkForms(html, path));
	if (/<style\b/i.test(html)) problems.push('inline style element (blocked by the CSP)');
	// JSON-LD is data the browser never runs; every other inline script is out.
	for (const [, json = ''] of html.matchAll(JSON_LD)) {
		try {
			JSON.parse(json);
		} catch {
			problems.push('JSON-LD that is not valid JSON');
		}
	}
	if (/<script\b(?![^>]*\ssrc\s*=)[^>]*>\s*\S/i.test(html.replace(JSON_LD, ''))) problems.push('inline script');
	if (/<base\b/i.test(html)) problems.push('base element');
	if (/<meta[^>]+http-equiv\s*=\s*["']?refresh/i.test(html)) problems.push('meta refresh');
	return problems;
}

const metaContent = (html: string, attr: 'name' | 'property', key: string): string[] =>
	[...html.matchAll(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`, 'gi'))].map((m) => m[1] ?? '');

/**
 * What search engines and link previews need: one description per page and,
 * on indexable pages, a title, the canonical address and Open Graph data.
 */
export function checkSeo(html: string): string[] {
	const problems: string[] = [];
	const descriptions = metaContent(html, 'name', 'description');
	if (descriptions.length > 1) problems.push(`${descriptions.length} meta descriptions (one per page)`);
	if (metaContent(html, 'name', 'robots').some((c) => /noindex/i.test(c))) return problems;

	if (!/<title>[^<]+<\/title>/i.test(html)) problems.push('missing <title>');
	if (descriptions.length === 0) problems.push('missing meta description');
	const canonical = /<link rel="canonical" href="([^"]+)"/i.exec(html)?.[1];
	if (canonical === undefined) problems.push('missing canonical link');
	for (const key of ['og:title', 'og:description', 'og:image']) {
		if (metaContent(html, 'property', key).length === 0) problems.push(`missing ${key}`);
	}
	const [ogUrl] = metaContent(html, 'property', 'og:url');
	if (ogUrl !== canonical) problems.push(`og:url ${ogUrl} is not the canonical address ${canonical}`);
	return problems;
}

const SECURITY_TXT_MIN_DAYS = 60;

/** security.txt must name an expiry at least SECURITY_TXT_MIN_DAYS ahead (RFC 9116). */
export function checkSecurityTxt(text: string, now: Date): string[] {
	const match = /^Expires:\s*(\S+)\s*$/m.exec(text);
	if (!match?.[1]) return ['security.txt: Expires is missing'];
	const days = (Date.parse(match[1]) - now.getTime()) / 86_400_000;
	if (!(days >= SECURITY_TXT_MIN_DAYS)) {
		return [`security.txt: expires in ${Math.floor(days)} days - renew static/.well-known/security.txt`];
	}
	return [];
}

// Content credentials (C2PA) and similar embedded provenance records: design
// tools add them to SVG and PNG files. The site ships its files without them.
const PROVENANCE = /c2pa|caBX|jumbf/;

export function checkProvenance(content: Buffer): string[] {
	return PROVENANCE.test(content.toString('latin1')) ? ['embedded provenance metadata (C2PA) - strip it'] : [];
}
