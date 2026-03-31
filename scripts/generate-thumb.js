const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'images');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Register Korean fonts
GlobalFonts.registerFromPath(path.join(__dirname, '..', 'fonts', 'Pretendard-Bold.otf'), 'Pretendard');
GlobalFonts.registerFromPath(path.join(__dirname, '..', 'fonts', 'Pretendard-Black.otf'), 'PretendardBlack');

const S = 1200; // 1:1

const pages = [
  { file: 'thumb-main', sub: '처음 가기 전 이것만', bg: '#8B0000' },
  { file: 'thumb-reservation', sub: '예약은 전화 한 통', bg: '#7A0A0A' },
  { file: 'thumb-course', sub: '열다섯 접시의 코스', bg: '#6B1515' },
  { file: 'thumb-dresscode', sub: '깔끔하면 된다', bg: '#6B1010' },
  { file: 'thumb-parking', sub: '헤매지 않는 법', bg: '#5A1515' },
  { file: 'thumb-budget', sub: '얼마면 될까', bg: '#8B0505' },
  { file: 'thumb-manners', sub: '세 가지만 기억해', bg: '#7A0505' },
  { file: 'thumb-compare', sub: '세 곳 비교 결과', bg: '#6B0A0A' },
];

const ACCENT = '#C9A96E';

function generateThumb(page) {
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');

  // Background
  ctx.fillStyle = page.bg;
  ctx.fillRect(0, 0, S, S);

  // Top/bottom accent bars
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, S, 12);
  ctx.fillRect(0, S - 12, S, 12);

  // Decorative circles
  ctx.strokeStyle = ACCENT;
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(180, 280, 120, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(1020, 920, 100, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;

  // Corner decorations
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(40, 40, 60, 3);
  ctx.fillRect(40, 40, 3, 60);
  ctx.fillRect(S - 100, S - 43, 60, 3);
  ctx.fillRect(S - 43, S - 100, 3, 60);
  ctx.globalAlpha = 1;

  // Moon icon
  ctx.save();
  ctx.translate(540, 140);
  ctx.strokeStyle = ACCENT;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(60, 60, 55, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = ACCENT;
  ctx.beginPath(); ctx.arc(52, 60, 25, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(38, 50, 20, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  // "일산명월관요정" - medium
  ctx.fillStyle = 'white';
  ctx.font = '62px PretendardBlack';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('일산명월관요정', S / 2, 390);

  // "신실장" — 가장 크게!!!
  ctx.font = '200px PretendardBlack';
  ctx.fillStyle = 'white';
  ctx.fillText('신실장', S / 2, 600);

  // Accent underline
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(280, 700, 640, 5);
  ctx.globalAlpha = 1;

  // Sub text
  ctx.font = '50px Pretendard';
  ctx.fillStyle = ACCENT;
  ctx.fillText(page.sub, S / 2, 780);

  // Phone number
  ctx.font = '38px Pretendard';
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.55;
  ctx.fillText('010-3695-4929', S / 2, 880);
  ctx.globalAlpha = 1;

  // Save
  const buf = c.toBuffer('image/png');
  const outPath = path.join(OUT, page.file + '.png');
  fs.writeFileSync(outPath, buf);
  console.log(`OK ${page.file}.png (${(buf.length / 1024).toFixed(1)}KB) ${S}x${S}`);
}

pages.forEach(generateThumb);
console.log('\n1:1 thumbnails with Korean text generated!');
