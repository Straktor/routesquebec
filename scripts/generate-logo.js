import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 512x512 Simple Minimalist Black & White Logo
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Solid Black Quebec Highway Shield -->
  <path d="M 256 32
           C 292 16 334 16 366 42
           C 402 30 442 40 466 74
           C 478 120 478 236 478 274
           C 478 376 372 452 256 486
           C 140 452 34 376 34 274
           C 34 236 34 120 46 74
           C 70 40 110 30 146 42
           C 178 16 220 16 256 32 Z"
        fill="#000000" />

  <!-- White Inner Accent Contour -->
  <path d="M 256 46
           C 288 32 326 32 356 56
           C 390 44 426 54 448 84
           C 458 126 458 232 458 266
           C 458 360 360 430 256 462
           C 152 430 54 360 54 266
           C 54 232 54 126 64 84
           C 86 54 122 44 156 56
           C 186 32 224 32 256 46 Z"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="8" />

  <!-- FLEUR-DE-LYS (Clean, Minimalist White Silhouette) -->
  <g transform="translate(256, 142)">
    <!-- Center Petal -->
    <path d="M 0 -58
             C 8 -38 13 -18 13 -2
             C 13 14 6 24 0 30
             C -6 24 -13 14 -13 -2
             C -13 -18 -8 -38 0 -58 Z"
          fill="#FFFFFF" />

    <!-- Left Petal -->
    <path d="M -7 24
             C -26 20 -52 10 -58 -16
             C -61 -28 -53 -36 -44 -36
             C -33 -36 -27 -25 -22 -12
             C -17 4 -12 16 -3 22 Z"
          fill="#FFFFFF" />

    <!-- Right Petal -->
    <path d="M 7 24
             C 26 20 52 10 58 -16
             C 61 -28 53 -36 44 -36
             C 33 -36 27 -25 22 -12
             C 17 4 12 16 3 22 Z"
          fill="#FFFFFF" />

    <!-- Horizontal Ring Bar -->
    <rect x="-30" y="20" width="60" height="10" fill="#FFFFFF" rx="2" />

    <!-- Base Leaves -->
    <path d="M -14 34
             C -14 48 -24 57 -35 60
             C -20 62 -8 55 -3 44
             C 2 55 14 62 29 60
             C 18 57 8 48 8 34 Z"
          fill="#FFFFFF" />
  </g>

  <!-- HIGHWAY OVERPASS (Clean Minimalist White Pictogram) -->
  <!-- Upper Highway Lines (Receding Under Bridge) -->
  <line x1="222" y1="230" x2="202" y2="280" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />
  <line x1="290" y1="230" x2="310" y2="280" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />

  <!-- Lower Highway Lines (Foreground Exiting Bridge) -->
  <line x1="184" y1="330" x2="134" y2="430" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />
  <line x1="328" y1="330" x2="378" y2="430" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />

  <!-- Center Dashed Line -->
  <line x1="256" y1="234" x2="256" y2="278" stroke="#FFFFFF" stroke-width="8" stroke-dasharray="14 10" stroke-linecap="round" />
  <line x1="256" y1="332" x2="256" y2="430" stroke="#FFFFFF" stroke-width="10" stroke-dasharray="20 14" stroke-linecap="round" />

  <!-- Overpass Horizontal Bridge Deck -->
  <rect x="94" y="286" width="324" height="38" rx="6" fill="#FFFFFF" />
</svg>`;

// Favicon SVG (Optimized 64x64 clean silhouette)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Solid Black Shield -->
  <path d="M 32 4
           C 36 2 42 2 46 5
           C 51 3 56 5 59 9
           C 61 15 61 30 61 35
           C 61 48 48 57 32 61
           C 16 57 3 48 3 35
           C 3 30 3 15 5 9
           C 8 5 13 3 18 5
           C 22 2 28 2 32 4 Z"
        fill="#000000" />

  <!-- Mini Fleur-de-lys -->
  <g transform="translate(32, 19) scale(0.24)">
    <path d="M 0 -38 C 5 -25 8 -12 8 -2 C 8 8 4 15 0 19 C -4 15 -8 8 -8 -2 C -8 -12 -5 -25 0 -38 Z" fill="#FFFFFF" />
    <path d="M -4 15 C -17 12 -33 6 -37 -10 C -39 -17 -34 -23 -28 -23 C -21 -23 -17 -16 -14 -8 C -11 2 -8 10 -2 14 Z" fill="#FFFFFF" />
    <path d="M 4 15 C 17 12 33 6 37 -10 C 39 -17 34 -23 28 -23 C 21 -23 17 -16 14 -8 C 11 2 8 10 2 14 Z" fill="#FFFFFF" />
    <rect x="-18" y="13" width="36" height="6" fill="#FFFFFF" rx="1" />
  </g>

  <!-- Overpass Bridge Deck -->
  <rect x="12" y="35" width="40" height="6" rx="1.5" fill="#FFFFFF" />

  <!-- Lower Highway Lines -->
  <line x1="23" y1="42" x2="16" y2="55" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <line x1="41" y1="42" x2="48" y2="55" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  <line x1="32" y1="42" x2="32" y2="55" stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="3 2" stroke-linecap="round" />
</svg>`;

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg.trim());
  console.log('Created public/logo.svg');

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg.trim());
  console.log('Created public/favicon.svg');

  // Generate PNGs for PWA
  const svgBuffer = Buffer.from(logoSvg);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created public/pwa-192x192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created public/pwa-512x512.png');
}

main().catch(console.error);
