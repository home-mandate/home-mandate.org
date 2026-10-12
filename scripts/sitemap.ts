// Runs after "vite build": writes build/sitemap.xml and build/llms.txt from the
// prerendered pages (canonical, hreflang, noindex as the HTML states them),
// each with a .gz next to it like the rest of build/.
// Run with: node scripts/sitemap.ts
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { llmsTxt, pageInfo, sitemapXml } from './lib/sitemap.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const BUILD = join(ROOT, 'build');

const messages = JSON.parse(readFileSync(join(ROOT, '.generated', 'messages', 'en.json'), 'utf8')) as Record<string, string>;
const languages = (JSON.parse(readFileSync(join(ROOT, '.generated', 'languages.json'), 'utf8')) as { tag: string }[]).map((l) => l.tag);

const pages = readdirSync(BUILD, { recursive: true, withFileTypes: true })
	.filter((entry) => entry.isFile() && entry.name === 'index.html')
	.map((entry) => pageInfo(readFileSync(join(entry.parentPath, entry.name), 'utf8')));

const write = (name: string, content: string): void => {
	writeFileSync(join(BUILD, name), content);
	writeFileSync(join(BUILD, `${name}.gz`), gzipSync(content, { level: 9 }));
};

const sitemap = sitemapXml(pages);
write('sitemap.xml', sitemap);
write('llms.txt', llmsTxt(pages, { name: messages.site_name ?? 'Home-Mandate', summary: messages.site_description ?? '', languages }));
console.log(`sitemap.xml: ${sitemap.match(/<url>/g)?.length ?? 0} pages; llms.txt written.`);
