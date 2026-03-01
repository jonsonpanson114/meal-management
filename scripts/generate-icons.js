/**
 * Generates minimal PWA icon PNGs using pure Node.js (no canvas dependency).
 * Creates gradient rectangles with rounded corners as placeholder icons.
 * Run: node scripts/generate-icons.js
 *
 * For production: replace public/icons/icon-192.png and icon-512.png
 * with your actual app icons.
 */

const fs = require('fs');
const path = require('path');

// Minimal PNG encoder (no dependencies)
function createPNG(width, height, pixels) {
  const { deflateSync } = require('zlib');

  function crc32(data) {
    let crc = 0xffffffff;
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([len, typeB, data, crcVal]);
  }

  // Build raw image data (filter byte 0 per row)
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const idx = y * (width * 4 + 1) + 1 + x * 4;
      const [r, g, b, a] = pixels[y * width + x];
      raw[idx] = r; raw[idx + 1] = g; raw[idx + 2] = b; raw[idx + 3] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function generateIcon(size) {
  const pixels = [];
  const radius = Math.round(size * 0.18);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Rounded rectangle check
      let inside = true;
      if (x < radius && y < radius) inside = (x - radius) ** 2 + (y - radius) ** 2 < radius ** 2;
      else if (x > size - radius && y < radius) inside = (x - (size - radius)) ** 2 + (y - radius) ** 2 < radius ** 2;
      else if (x < radius && y > size - radius) inside = (x - radius) ** 2 + (y - (size - radius)) ** 2 < radius ** 2;
      else if (x > size - radius && y > size - radius) inside = (x - (size - radius)) ** 2 + (y - (size - radius)) ** 2 < radius ** 2;

      if (!inside) {
        pixels.push([0, 0, 0, 0]);
        continue;
      }

      // Gradient: orange (#f97316) → pink (#fb7185)
      const t = (x + y) / (size * 2);
      const r = Math.round(249 + (251 - 249) * t);
      const g = Math.round(115 + (113 - 115) * t);
      const b = Math.round(22 + (133 - 22) * t);
      pixels.push([r, g, b, 255]);
    }
  }

  return createPNG(size, size, pixels);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

[192, 512].forEach((size) => {
  const png = generateIcon(size);
  const outPath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated: ${outPath} (${png.length} bytes)`);
});
