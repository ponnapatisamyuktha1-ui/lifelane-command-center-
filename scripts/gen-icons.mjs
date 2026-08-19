/**
 * Generates PWA icons by rendering the SVG with a headless browser approach.
 * Falls back to writing a programmatic PNG if sharp/canvas is unavailable.
 * Uses only built-in Node.js APIs + the already-installed packages.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../client/public");

// ── Minimal PNG encoder (no deps) ─────────────────────────────────
function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const crc = crc32(Buffer.concat([t, data]));
  return Buffer.concat([u32be(data.length), t, data, u32be(crc)]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Render a flat-colour icon as a PNG.
 * Draws the LifeLane brand: dark background + cyan X + white diamond + cyan dot.
 */
function makePng(size) {
  // RGBA pixel grid
  const pixels = Buffer.alloc(size * size * 4);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.47; // rounded rect radius approximation via circle mask

  // Background colour: #071017 = 7,16,23
  // Accent: #48d7e8 = 72,215,232
  const BG = [7, 16, 23, 255];
  const CYAN = [72, 215, 232, 255];
  const WHITE = [237, 247, 248, 255];

  function setPixel(x, y, rgba) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const idx = (y * size + x) * 4;
    pixels[idx]     = rgba[0];
    pixels[idx + 1] = rgba[1];
    pixels[idx + 2] = rgba[2];
    pixels[idx + 3] = rgba[3];
  }

  function blend(x, y, rgba, alpha) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const idx = (y * size + x) * 4;
    const a = alpha / 255;
    pixels[idx]     = Math.round(pixels[idx]     * (1 - a) + rgba[0] * a);
    pixels[idx + 1] = Math.round(pixels[idx + 1] * (1 - a) + rgba[1] * a);
    pixels[idx + 2] = Math.round(pixels[idx + 2] * (1 - a) + rgba[2] * a);
    pixels[idx + 3] = 255;
  }

  // Fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4]     = BG[0];
    pixels[i * 4 + 1] = BG[1];
    pixels[i * 4 + 2] = BG[2];
    pixels[i * 4 + 3] = 0; // transparent outside rounded rect
  }

  // Rounded rectangle mask (r = size * 0.19)
  const rr = Math.round(size * 0.19);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // distance to nearest corner rounded rect point
      const dx = Math.max(rr - x, 0, x - (size - 1 - rr));
      const dy = Math.max(rr - y, 0, y - (size - 1 - rr));
      if (dx * dx + dy * dy <= rr * rr) {
        const idx = (y * size + x) * 4;
        pixels[idx]     = BG[0];
        pixels[idx + 1] = BG[1];
        pixels[idx + 2] = BG[2];
        pixels[idx + 3] = 255;
      }
    }
  }

  // Draw thick anti-aliased line
  function drawLine(x0, y0, x1, y1, color, w) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 4;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x0 + (x1 - x0) * t;
      const py = y0 + (y1 - y0) * t;
      for (let dy = -w; dy <= w; dy++) {
        for (let dx = -w; dx <= w; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= w) {
            const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - Math.max(0, dist - w + 1)))));
            blend(Math.round(px + dx), Math.round(py + dy), color, alpha);
          }
        }
      }
    }
  }

  // Draw filled circle
  function drawCircle(cx, cy, r, color) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (d <= r) setPixel(x, y, color);
        else if (d <= r + 1) blend(x, y, color, Math.round(255 * (r + 1 - d)));
      }
    }
  }

  const m = size * 0.28; // margin from edge for X endpoints
  const lw = Math.max(2, Math.round(size * 0.05)); // line width half

  // Draw X (two diagonal lines)
  drawLine(m, m, size - m, size - m, CYAN, lw);
  drawLine(size - m, m, m, size - m, CYAN, lw);

  // Draw centre diamond outline (rotated square)
  const ds = size * 0.12; // half-size of diamond
  drawLine(cx, cy - ds, cx + ds, cy, WHITE, Math.max(1, Math.round(lw * 0.7)));
  drawLine(cx + ds, cy, cx, cy + ds, WHITE, Math.max(1, Math.round(lw * 0.7)));
  drawLine(cx, cy + ds, cx - ds, cy, WHITE, Math.max(1, Math.round(lw * 0.7)));
  drawLine(cx - ds, cy, cx, cy - ds, WHITE, Math.max(1, Math.round(lw * 0.7)));

  // Draw centre dot
  drawCircle(cx, cy, size * 0.05, CYAN);

  // Encode as PNG
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Build raw scanlines (filter byte 0 = None per row)
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0; // filter type None
    pixels.copy(raw, y * (1 + size * 4) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Generate icons
const sizes = [192, 512];
for (const s of sizes) {
  const png = makePng(s);
  const outPath = path.join(OUT, `icon-${s}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`✓ Generated ${outPath} (${(png.length / 1024).toFixed(1)} KB)`);
}

// Also copy as apple-touch-icon (180px from 192 is fine)
const apple = makePng(180);
fs.writeFileSync(path.join(OUT, "apple-touch-icon.png"), apple);
console.log(`✓ Generated apple-touch-icon.png`);

// maskable icon = same 512 but with extra padding built in (already has ~19% padding from rr)
fs.copyFileSync(path.join(OUT, "icon-512.png"), path.join(OUT, "icon-maskable-512.png"));
console.log(`✓ Copied icon-maskable-512.png`);
