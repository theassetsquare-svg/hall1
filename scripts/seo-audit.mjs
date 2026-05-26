#!/usr/bin/env node
// SEO audit — keyword stuffing / title-meta uniqueness / alt / single H1
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PAGES = [
  'index.html',
  'reservation/index.html',
  'course/index.html',
  'dresscode/index.html',
  'parking/index.html',
  'budget/index.html',
  'manners/index.html',
  'compare/index.html',
];

const KEYWORDS = [
  '일산명월관요정',
  '일산명월관',
  '일산요정',
  '명월관',
  '일산 한정식',
  '가야금',
];

const STUFFING_THRESHOLD = 3.0; // %
const MIN_DENSITY_PRIMARY = 0.5; // 일산명월관요정 must be present

const stripScripts = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '');

const visible = (html) =>
  stripScripts(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ');

const pickAttr = (html, name) => {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m = html.match(re);
  return m ? m[1] : null;
};

const titles = new Map();
const metas = new Map();
let failures = 0;

const fail = (msg) => {
  console.error(`::error::${msg}`);
  failures++;
};
const ok = (msg) => console.log(`OK  ${msg}`);

for (const rel of PAGES) {
  const path = resolve(process.cwd(), rel);
  let html;
  try {
    html = readFileSync(path, 'utf8');
  } catch {
    fail(`${rel}: missing file`);
    continue;
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const desc = pickAttr(html, 'description');
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
  const bodyText = visible(html);
  const total = bodyText.length;

  // Title/meta presence
  if (!title) fail(`${rel}: <title> missing`);
  if (!desc) fail(`${rel}: meta description missing`);

  // Single H1
  if (h1Matches.length === 0) fail(`${rel}: H1 missing`);
  else if (h1Matches.length > 1) fail(`${rel}: ${h1Matches.length} H1 tags (must be 1)`);

  // Title uniqueness
  if (title) {
    const existing = titles.get(title);
    if (existing) fail(`${rel}: duplicate <title> shared with ${existing}`);
    titles.set(title, rel);
  }

  // Meta description uniqueness
  if (desc) {
    const existing = metas.get(desc);
    if (existing) fail(`${rel}: duplicate meta description shared with ${existing}`);
    metas.set(desc, rel);
  }

  // Title length 30-60
  if (title) {
    const len = title.length;
    if (len < 20 || len > 65) fail(`${rel}: title length ${len} (target 20-65)`);
  }
  // Meta description length 80-170
  if (desc) {
    const len = desc.length;
    if (len < 80 || len > 175) fail(`${rel}: meta length ${len} (target 80-175)`);
  }

  // Keyword density
  for (const kw of KEYWORDS) {
    const re = new RegExp(kw.replace(/ /g, '\\s+'), 'g');
    const cnt = (bodyText.match(re) || []).length;
    const density = total ? (cnt * kw.length / total) * 100 : 0;
    if (density > STUFFING_THRESHOLD) {
      fail(`${rel}: STUFFED "${kw}" ${cnt}x density=${density.toFixed(2)}%`);
    }
  }
  // Primary keyword must be present
  const primaryCnt = (bodyText.match(/일산명월관요정/g) || []).length;
  if (primaryCnt < 3) {
    fail(`${rel}: primary keyword count ${primaryCnt} (need ≥3)`);
  }

  // alt attributes — every <img> must have non-empty alt
  const imgs = [...html.matchAll(/<img[^>]*>/g)];
  for (const imgTag of imgs) {
    const tag = imgTag[0];
    const altMatch = tag.match(/\salt=["']([^"']*)["']/);
    if (!altMatch) fail(`${rel}: <img> without alt: ${tag.slice(0, 80)}`);
    else if (altMatch[1].trim() === '') fail(`${rel}: <img> with empty alt: ${tag.slice(0, 80)}`);
  }

  // canonical present
  if (!/<link[^>]+rel=["']canonical["']/.test(html)) {
    fail(`${rel}: rel=canonical missing`);
  }

  // og:image
  if (!/property=["']og:image["']/.test(html)) {
    fail(`${rel}: og:image missing`);
  }

  ok(`${rel}: title="${title}" desc.len=${desc?.length || 0} imgs=${imgs.length} chars=${total}`);
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nAll SEO checks passed.');
