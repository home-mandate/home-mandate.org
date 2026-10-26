// Share images for link previews (og:image), 1200x630, one per language with
// its own image (OG_IMAGES in src/lib/seo.ts). Rendered by Playwright's
// Chromium from the texts and colours of the site; the PNGs are committed
// under static/og/. Rerun after changing the home title or the tokens:
//   pnpm prepare-site && pnpm og
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'static', 'og');
const TAGS = ['en', 'de'];

// The logo without the tagline: the title below is the tagline in English.
const LOGO = `data:image/svg+xml;base64,${readFileSync(join(ROOT, 'static', 'logo', 'lockup-light.svg')).toString('base64')}`;

const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function html(m: Record<string, string>): string {
	const chip = (cls: string, text: string) => `<span class="chip ${cls}">${escapeHtml(text)}</span>`;
	return `<!doctype html><html><head><meta charset="utf-8"><style>
		html,body{margin:0;width:1200px;height:630px}
		body{box-sizing:border-box;padding:72px 80px;background:#F5F5FA;color:#0F0E47;
			font-family:system-ui,"Segoe UI","Noto Sans","Helvetica Neue",Arial,sans-serif;
			display:flex;flex-direction:column;justify-content:space-between;border-top:14px solid #272757}
		.brand{display:block;align-self:flex-start;height:88px;width:auto}
		h1{margin:0;font-size:68px;line-height:1.08;letter-spacing:-.02em;max-width:1000px}
		.foot{display:flex;justify-content:space-between;align-items:center;font-size:28px;color:#505081}
		.chips{display:flex;gap:14px}
		.chip{padding:8px 22px;border-radius:999px;border:2px solid;font-weight:600;font-size:26px}
		.allow{color:#0B6670;background:#E3F4EC;border-color:#A8DCC4}
		.ask{color:#8F5A00;background:#FBF0D9;border-color:#EBCB8A}
		.deny{color:#B0213A;background:#FBE6E9;border-color:#EFB1BB}
	</style></head><body>
		<img class="brand" src="${LOGO}" alt="">
		<h1>${escapeHtml(m.home_title ?? '')}</h1>
		<div class="foot"><span>home-mandate.org</span><span class="chips">${chip('allow', m.common_allow ?? '')}${chip('ask', m.common_ask ?? '')}${chip('deny', m.common_deny ?? '')}</span></div>
	</body></html>`;
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
	for (const tag of TAGS) {
		const messages = JSON.parse(readFileSync(join(ROOT, '.generated', 'messages', `${tag}.json`), 'utf8')) as Record<string, string>;
		await page.setContent(html(messages));
		writeFileSync(join(OUT, `${tag}.png`), await page.screenshot({ type: 'png' }));
		console.log(`static/og/${tag}.png`);
	}
} finally {
	await browser.close();
}
