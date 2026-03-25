const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

function createPNG(width, height, bgR, bgG, bgB, accentR, accentG, accentB) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  const rows = [];
  const barH = 10;
  const bandStart = Math.floor(height * 0.35);
  const bandEnd = Math.floor(height * 0.65);

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 3);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      const off = 1 + x * 3;
      if (y < barH || y >= height - barH) {
        row[off] = accentR; row[off+1] = accentG; row[off+2] = accentB;
      } else if (y >= bandStart && y <= bandEnd) {
        row[off] = Math.max(0, bgR - 25);
        row[off+1] = Math.max(0, bgG - 8);
        row[off+2] = Math.max(0, bgB - 8);
      } else {
        row[off] = bgR; row[off+1] = bgG; row[off+2] = bgB;
      }
    }
    rows.push(row);
  }

  const compressed = zlib.deflateSync(Buffer.concat(rows));
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const pages = [
  { name: 'og-main', bg: [0x8B, 0x00, 0x00], accent: [0xC9, 0xA9, 0x6E] },
  { name: 'og-reservation', bg: [0x7A, 0x0A, 0x0A], accent: [0xC9, 0xA9, 0x6E] },
  { name: 'og-course', bg: [0x8B, 0x00, 0x00], accent: [0xD4, 0xB8, 0x7A] },
  { name: 'og-dresscode', bg: [0x6B, 0x10, 0x10], accent: [0xC9, 0xA9, 0x6E] },
  { name: 'og-parking', bg: [0x5A, 0x15, 0x15], accent: [0xC9, 0xA9, 0x6E] },
  { name: 'og-budget', bg: [0x8B, 0x00, 0x00], accent: [0xBB, 0x99, 0x60] },
  { name: 'og-manners', bg: [0x7A, 0x05, 0x05], accent: [0xC9, 0xA9, 0x6E] },
  { name: 'og-compare', bg: [0x6B, 0x0A, 0x0A], accent: [0xD4, 0xB8, 0x7A] },
];

pages.forEach(p => {
  const png = createPNG(1200, 630, ...p.bg, ...p.accent);
  const out = path.join(imagesDir, p.name + '.png');
  fs.writeFileSync(out, png);
  console.log(`${p.name}.png (${png.length} bytes)`);
});
