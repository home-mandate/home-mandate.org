// Checks on the generated HTML: what the CSP and the privacy promise of the
// site rely on (no external resources, no inline styles or handlers, no forms).

const OWN_ORIGIN = 'https://mandate-spec.org/';
// Attributes that make the browser load something by itself (not plain <a> links).
const LOADING = /<(script|img|link|source|video|audio|iframe|embed|object)\b[^>]*?\s(src|href|srcset|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const STYLE_ATTR = /<[a-z][^>]*\sstyle\s*=/i;
const HANDLER_ATTR = /<[a-z][^>]*\son[a-z]+\s*=/i;

export function checkHtml(html: string): string[] {
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
	if (/<form\b/i.test(html)) problems.push('form (the site has no forms, form-action is none)');
	if (/<style\b/i.test(html)) problems.push('inline style element (blocked by the CSP)');
	if (/<script\b(?![^>]*\ssrc\s*=)[^>]*>\s*\S/i.test(html)) problems.push('inline script');
	if (/<base\b/i.test(html)) problems.push('base element');
	if (/<meta[^>]+http-equiv\s*=\s*["']?refresh/i.test(html)) problems.push('meta refresh');
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
