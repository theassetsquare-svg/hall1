#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const PAGES = [
  { slug: 'reservation', name: '예약 방법' },
  { slug: 'course', name: '코스 안내' },
  { slug: 'dresscode', name: '드레스코드' },
  { slug: 'parking', name: '주차·교통' },
  { slug: 'budget', name: '예산 가이드' },
  { slug: 'manners', name: '에티켓' },
  { slug: 'compare', name: '비교 가이드' },
];

const PWA_META = `<link rel="apple-touch-icon" href="/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#8B0000">
<meta name="application-name" content="일산명월관요정">
<meta name="apple-mobile-web-app-title" content="명월관">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="format-detection" content="telephone=yes">
<meta name="mobile-web-app-capable" content="yes">`;

const SW_REGISTER = `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}</script>`;

function buildGraph(slug, name, oldDesc, image) {
  const url = `https://hall1.pages.dev/${slug}/`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Restaurant',
        '@id': `${url}#restaurant`,
        name: '일산명월관요정',
        alternateName: ['일산명월관', '일산요정', '명월관요정', '명월관'],
        keywords: '일산명월관요정, 일산명월관, 일산요정, 일산 한정식, 일산 룸식당',
        description: oldDesc,
        url,
        telephone: '+82-10-3695-4929',
        image,
        servesCuisine: ['Korean', '한정식'],
        priceRange: '₩₩₩',
        address: { '@type': 'PostalAddress', addressLocality: '고양시 일산', addressRegion: '경기도', addressCountry: 'KR' },
        geo: { '@type': 'GeoCoordinates', latitude: 37.65, longitude: 126.77 },
        areaServed: { '@type': 'City', name: '일산' },
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], opens: '17:00', closes: '23:00' }],
        acceptsReservations: 'True',
      },
      { '@type': 'LocalBusiness', '@id': `${url}#localbusiness`, name: '일산명월관요정', url, telephone: '+82-10-3695-4929', image, priceRange: '₩₩₩', address: { '@type': 'PostalAddress', addressLocality: '고양시 일산', addressRegion: '경기도', addressCountry: 'KR' } },
      { '@type': 'NightClub', '@id': `${url}#nightclub`, name: '일산명월관요정', url, telephone: '+82-10-3695-4929', image },
      { '@type': 'BarOrPub', '@id': `${url}#barorpub`, name: '일산명월관요정', url, telephone: '+82-10-3695-4929', image, servesCuisine: '한정식', priceRange: '₩₩₩' },
    ],
  };
  return JSON.stringify(graph);
}

function upgrade(slug) {
  const path = resolve(ROOT, slug, 'index.html');
  let html = readFileSync(path, 'utf8');

  // 1) Inject PWA meta after favicon link (idempotent)
  if (!html.includes('rel="manifest"')) {
    html = html.replace(
      '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
      `<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n${PWA_META}`
    );
  }

  // 2) Replace first NightClub+Restaurant JSON-LD with @graph 4-type
  const oldSchemaRegex = /<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":\["NightClub","Restaurant"\][^<]*<\/script>/;
  const match = html.match(oldSchemaRegex);
  if (match) {
    // pull old description + image out
    const original = match[0];
    const descMatch = original.match(/"description":"([^"]+)"/);
    const imgMatch = original.match(/"image":"([^"]+)"/);
    const desc = descMatch ? descMatch[1] : '일산명월관요정 가이드';
    const image = imgMatch ? imgMatch[1] : `https://hall1.pages.dev/images/thumb-${slug}.png`;
    const newBlock = `<script type="application/ld+json">\n${buildGraph(slug, PAGES.find(p=>p.slug===slug).name, desc, image)}\n</script>`;
    html = html.replace(oldSchemaRegex, newBlock);
  }

  // 3) Add SW register before </body> (idempotent)
  if (!html.includes('serviceWorker.register')) {
    html = html.replace('</body>', `${SW_REGISTER}\n</body>`);
  }

  // 4) Add og:type article PWA-friendly: nothing — keep existing
  // 5) Update RSS link if missing
  writeFileSync(path, html);
  console.log(`✓ ${slug}`);
}

for (const { slug } of PAGES) upgrade(slug);
console.log('done');
