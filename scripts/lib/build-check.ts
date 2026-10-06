// Checks on the generated HTML: what the CSP and the privacy promise of the
// site rely on (no external resources, no inline styles or handlers, no forms).

const OWN_ORIGIN = 'https://mandate-spec.org/';
// Attributes that make the browser load something by itself (not plain <a> links).
const LOADING = /<(script|img|link|source|video|audio|iframe|embed|object)\b[^>]*?\s(src|href|srcset|data)\s*=\s*["']([^"']*)["']/gi;
const STYLE_ATTR = /<[a-z][^>]*\sstyle\s*=/i;
const HANDLER_ATTR = /<[a-z][^>]*\son[a-z]+\s*=/i;

export function checkHtml(html: string): string[] {
	const problems: string[] = [];
	if (!/<meta http-equiv="content-security-policy"/i.test(html)) problems.push('missing Content-Security-Policy meta tag');
	if (!/<html[^>]*\slang="[a-zA-Z-]+"/.test(html)) problems.push('missing lang attribute on <html>');
	for (const match of html.matchAll(LOADING)) {
		const [, tag, , url = ''] = match;
		const external = /^(https?:)?\/\//i.test(url) && !url.startsWith(OWN_ORIGIN);
		if (external) problems.push(`external resource in <${tag}>: ${url}`);
	}
	if (STYLE_ATTR.test(html)) problems.push('inline style attribute (blocked by the CSP)');
	if (HANDLER_ATTR.test(html)) problems.push('inline event handler attribute');
	if (/<iframe\b/i.test(html)) problems.push('iframe');
	if (/<form\b/i.test(html)) problems.push('form (the site has no forms, form-action is none)');
	return problems;
}
