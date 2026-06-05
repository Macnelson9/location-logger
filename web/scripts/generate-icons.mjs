// Generates the PWA icon set from the LocationLog brand mark (a white lucide
// "map-pin" glyph on the accent background). Run with: node scripts/generate-icons.mjs
//
// Uses `sharp` (already present as a Next.js dependency) to rasterize an SVG to
// PNG at each required size. Re-run this if the brand color or glyph changes.

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ACCENT = "#c0653c";
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

// lucide "map-pin", drawn in a 24x24 box. `scale`/`offset` center it on a
// 512x512 canvas. A larger offset (smaller scale) leaves the safe-zone margin a
// maskable icon needs; a tighter glyph reads better as a plain icon.
function svg({ scale, offset }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${ACCENT}"/>
  <g transform="translate(${offset},${offset}) scale(${scale})" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </g>
</svg>`;
}

// Tighter glyph for plain icons; extra margin for maskable (safe zone).
const STANDARD = svg({ scale: 13, offset: 100 });
const MASKABLE = svg({ scale: 10, offset: 136 });

const targets = [
  { name: "icon-192.png", source: STANDARD, size: 192 },
  { name: "icon-512.png", source: STANDARD, size: 512 },
  { name: "maskable-192.png", source: MASKABLE, size: 192 },
  { name: "maskable-512.png", source: MASKABLE, size: 512 },
  { name: "apple-touch-icon.png", source: MASKABLE, size: 180 },
];

await mkdir(OUT_DIR, { recursive: true });
for (const { name, source, size } of targets) {
  const png = await sharp(Buffer.from(source)).resize(size, size).png().toBuffer();
  await writeFile(join(OUT_DIR, name), png);
  console.log(`✓ ${name} (${size}x${size})`);
}
console.log(`\nWrote ${targets.length} icons to public/icons/`);
