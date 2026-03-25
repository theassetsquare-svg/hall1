const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'images');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const pages = [
  { file: 'og-main', title: '일산명월관요정', sub: '처음 가기 전 이것만 알면 된다', bg: '#8B0000', accent: '#C9A96E' },
  { file: 'og-reservation', title: '일산명월관요정', sub: '예약 방법 완벽 가이드', bg: '#7A0A0A', accent: '#C9A96E' },
  { file: 'og-course', title: '일산명월관요정', sub: '코스 요리 · 열다섯 접시의 감동', bg: '#8B0000', accent: '#D4B87A' },
  { file: 'og-dresscode', title: '일산명월관요정', sub: '드레스코드 · 뭘 입고 가야 할까', bg: '#6B1010', accent: '#C9A96E' },
  { file: 'og-parking', title: '일산명월관요정', sub: '주차 교통 · 헤매지 않는 법', bg: '#5A1515', accent: '#C9A96E' },
  { file: 'og-budget', title: '일산명월관요정', sub: '예산 가이드 · 얼마면 될까', bg: '#8B0000', accent: '#BB9960' },
  { file: 'og-manners', title: '일산명월관요정', sub: '에티켓 · 긴장된다면 읽어봐', bg: '#7A0505', accent: '#C9A96E' },
  { file: 'og-compare', title: '일산명월관요정', sub: '비교 · 어디가 나한테 맞을까', bg: '#6B0A0A', accent: '#D4B87A' },
];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function generateImage(page) {
  const W = 1200, H = 630;
  const bg = hexToRgb(page.bg);
  const accent = hexToRgb(page.accent);

  // Create base background
  const base = await sharp({
    create: { width: W, height: H, channels: 3, background: bg }
  }).png().toBuffer();

  // Create accent bars (top + bottom)
  const topBar = await sharp({
    create: { width: W, height: 10, channels: 3, background: accent }
  }).png().toBuffer();

  const bottomBar = await sharp({
    create: { width: W, height: 10, channels: 3, background: accent }
  }).png().toBuffer();

  // Darker band for text area
  const darkBg = { r: Math.max(0, bg.r - 30), g: Math.max(0, bg.g - 10), b: Math.max(0, bg.b - 10) };
  const textBand = await sharp({
    create: { width: W, height: 200, channels: 3, background: darkBg }
  }).png().toBuffer();

  // SVG text overlay (sharp renders SVG text with system-available sans-serif)
  const textSvg = `<svg width="${W}" height="${H}">
    <style>
      .title { font: bold 54px sans-serif; fill: white; }
      .sub { font: 28px sans-serif; fill: ${page.accent}; }
      .info { font: 17px sans-serif; fill: white; opacity: 0.45; }
    </style>
    <text x="600" y="300" text-anchor="middle" class="title">${escapeXml(page.title)}</text>
    <text x="600" y="370" text-anchor="middle" class="sub">${escapeXml(page.sub)}</text>
    <text x="600" y="530" text-anchor="middle" class="info">hall1.pages.dev</text>
  </svg>`;

  // Moon icon SVG
  const moonSvg = `<svg width="100" height="100">
    <circle cx="50" cy="50" r="45" fill="none" stroke="${page.accent}" stroke-width="1.5" opacity="0.25"/>
    <path d="M65 50a20 20 0 0 1-20 20 20 20 0 0 1-20-20 20 20 0 0 1 20-20 15 15 0 0 0 0 30 15 15 0 0 0 15-15z" fill="${page.accent}" opacity="0.5"/>
  </svg>`;

  const outPath = path.join(OUT_DIR, page.file + '.png');

  await sharp(base)
    .composite([
      { input: topBar, top: 0, left: 0 },
      { input: bottomBar, top: H - 10, left: 0 },
      { input: textBand, top: 215, left: 0, blend: 'over' },
      { input: Buffer.from(moonSvg), top: 80, left: 550 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
    ])
    .png()
    .toFile(outPath);

  const stat = fs.statSync(outPath);
  console.log(`✓ ${page.file}.png (${(stat.size / 1024).toFixed(1)}KB)`);
}

(async () => {
  for (const p of pages) {
    await generateImage(p);
  }
  console.log('\nAll OG images generated with sharp!');
})();
