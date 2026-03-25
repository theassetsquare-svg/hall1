const fs = require('fs');
const path = require('path');

// Generate a minimal valid PNG 1200x630 with brand colors
// Uses raw PNG encoding without external dependencies

function createPNG(width, height, bgR, bgG, bgB) {
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

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT - create raw image data
  const rawRow = Buffer.alloc(1 + width * 3); // filter byte + RGB
  rawRow[0] = 0; // no filter

  // Gold accent area (top bar)
  const goldRow = Buffer.alloc(1 + width * 3);
  goldRow[0] = 0;

  // Text area row (dark overlay)
  const darkRow = Buffer.alloc(1 + width * 3);
  darkRow[0] = 0;

  for (let x = 0; x < width; x++) {
    const off = 1 + x * 3;
    rawRow[off] = bgR;
    rawRow[off + 1] = bgG;
    rawRow[off + 2] = bgB;

    goldRow[off] = 201;     // #C9A96E
    goldRow[off + 1] = 169;
    goldRow[off + 2] = 110;

    // Darker version of bg for text area
    darkRow[off] = Math.max(0, bgR - 30);
    darkRow[off + 1] = Math.max(0, bgG - 10);
    darkRow[off + 2] = Math.max(0, bgB - 10);
  }

  // Build rows: gold bar (top 8px) + bg + dark center band + bg
  const rows = [];
  const goldBarHeight = 8;
  const centerStart = Math.floor(height * 0.3);
  const centerEnd = Math.floor(height * 0.7);

  for (let y = 0; y < height; y++) {
    if (y < goldBarHeight || y >= height - goldBarHeight) {
      rows.push(goldRow);
    } else if (y >= centerStart && y <= centerEnd) {
      rows.push(darkRow);
    } else {
      rows.push(rawRow);
    }
  }

  const rawData = Buffer.concat(rows);

  // Compress using zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);

  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate main OG image: 1200x630, dark red #8B0000
const ogImage = createPNG(1200, 630, 0x8B, 0x00, 0x00);
const outPath = path.join(__dirname, '..', 'images', 'og-image.png');
fs.writeFileSync(outPath, ogImage);
console.log('Generated:', outPath, `(${ogImage.length} bytes)`);

// Generate square thumbnail: 600x600
const thumbImage = createPNG(600, 600, 0x8B, 0x00, 0x00);
const thumbPath = path.join(__dirname, '..', 'images', 'og-thumb.png');
fs.writeFileSync(thumbPath, thumbImage);
console.log('Generated:', thumbPath, `(${thumbImage.length} bytes)`);
