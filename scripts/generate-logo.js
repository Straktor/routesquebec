import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 512x512 Master Logo SVG (Simple, High-Contrast Black & White)
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Quebec Autoroute Shield Clip -->
    <clipPath id="shield-clip">
      <path d="M 256 24
               C 294 10 338 12 370 38
               C 404 26 446 36 470 68
               C 482 118 482 240 482 278
               C 482 384 374 462 256 496
               C 138 462 30 384 30 278
               C 30 240 30 118 42 68
               C 66 36 108 26 142 38
               C 174 12 218 10 256 24 Z" />
    </clipPath>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="512" height="512" fill="#FFFFFF" rx="0" />

  <!-- Outer Black Shield Contour -->
  <path d="M 256 16
           C 298 2 344 4 378 30
           C 414 16 460 28 484 62
           C 498 116 498 244 498 284
           C 498 394 386 476 256 510
           C 126 476 14 394 14 284
           C 14 244 14 116 28 62
           C 52 28 98 16 134 30
           C 168 4 214 2 256 16 Z"
        fill="#000000" />

  <!-- Inner White Margin -->
  <path d="M 256 24
           C 294 10 338 12 370 38
           C 404 26 446 36 470 68
           C 482 118 482 240 482 278
           C 482 384 374 462 256 496
           C 138 462 30 384 30 278
           C 30 240 30 118 42 68
           C 66 36 108 26 142 38
           C 174 12 218 10 256 24 Z"
        fill="#FFFFFF" />

  <!-- Inner Shield Content Area -->
  <g clip-path="url(#shield-clip)">
    <!-- Lower Body: Pure Solid Black -->
    <rect x="0" y="0" width="512" height="512" fill="#000000" />

    <!-- Upper Crown: Pure White Background -->
    <rect x="0" y="0" width="512" height="196" fill="#FFFFFF" />
    <path d="M 0 196 L 512 196" stroke="#000000" stroke-width="14" />

    <!-- FLEUR-DE-LYS (Solid Black on White) -->
    <g transform="translate(256, 108)">
      <!-- Main Center Petal -->
      <path d="M 0 -68
               C 10 -46 16 -24 16 -4
               C 16 14 8 26 0 34
               C -8 26 -16 14 -16 -4
               C -16 -24 -10 -46 0 -68 Z"
            fill="#000000" />

      <!-- Left Petal -->
      <path d="M -8 28
               C -30 22 -62 10 -68 -22
               C -71 -36 -62 -45 -51 -45
               C -38 -45 -31 -32 -26 -16
               C -20 4 -14 18 -4 25 Z"
            fill="#000000" />

      <!-- Right Petal -->
      <path d="M 8 28
               C 30 22 62 10 68 -22
               C 71 -36 62 -45 51 -45
               C 38 -45 31 -32 26 -16
               C 20 4 14 18 4 25 Z"
            fill="#000000" />

      <!-- Central Cross Ring Bar -->
      <rect x="-36" y="24" width="72" height="12" fill="#000000" rx="0" />

      <!-- Bottom Base Leaves -->
      <path d="M -16 40
               C -16 58 -28 68 -42 72
               C -24 74 -10 66 -4 52
               C 2 66 16 74 34 72
               C 20 68 8 58 8 40 Z"
            fill="#000000" />
    </g>

    <!-- Side Dots in Crown -->
    <circle cx="96" cy="115" r="9" fill="#000000" />
    <circle cx="416" cy="115" r="9" fill="#000000" />

    <!-- LOWER SECTION: HIGHWAY NETWORK (White on Solid Black) -->

    <!-- Converging Perspective Highway -->
    <path d="M 224 196 L 110 492 L 402 492 L 288 196 Z" fill="#000000" />
    <path d="M 224 196 L 110 492" stroke="#FFFFFF" stroke-width="14" />
    <path d="M 288 196 L 402 492" stroke="#FFFFFF" stroke-width="14" />

    <!-- Center White Dashed Highway Divider Line -->
    <path d="M 256 202 L 256 492"
          stroke="#FFFFFF"
          stroke-width="12"
          stroke-dasharray="28 20"
          stroke-linecap="square" />

    <!-- Curved Highway Interchange Ramps -->
    <path d="M 46 380 C 130 380 148 300 148 200" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="square" />
    <path d="M 466 380 C 382 380 364 300 364 200" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="square" />

    <!-- ELEVATED OVERPASS BRIDGE -->
    <!-- Bridge Solid White Deck with Black Outline -->
    <rect x="64" y="276" width="384" height="46" fill="#FFFFFF" stroke="#000000" stroke-width="6" />

    <!-- Bridge Pillars -->
    <rect x="176" y="322" width="16" height="34" fill="#FFFFFF" />
    <rect x="320" y="322" width="16" height="34" fill="#FFFFFF" />

    <!-- Bridge Label -->
    <text x="256" y="308"
          text-anchor="middle"
          font-family="'Archivo Black', 'Arial Black', sans-serif"
          font-weight="900"
          font-size="22"
          fill="#000000"
          letter-spacing="5">ROUTES QC</text>

    <!-- Bottom Badge -->
    <g transform="translate(256, 442)">
      <rect x="-56" y="-18" width="112" height="36" fill="#FFFFFF" stroke="#000000" stroke-width="4" />
      <text x="0" y="8"
            text-anchor="middle"
            font-family="'Space Mono', monospace"
            font-weight="700"
            font-size="19"
            fill="#000000"
            letter-spacing="2">MTQ</text>
    </g>
  </g>
</svg>`;

// Favicon SVG (Clean Black & White 64x64)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Outer Shield Outline -->
  <path d="M 32 3
           C 37 1 43 1 47 4
           C 51 2 57 4 60 8
           C 62 14 62 30 62 35
           C 62 48 48 58 32 62
           C 16 58 2 48 2 35
           C 2 30 2 14 4 8
           C 7 4 13 2 17 4
           C 21 1 27 1 32 3 Z"
        fill="#000000" />

  <!-- Shield Border -->
  <path d="M 32 5
           C 37 3 42 3 46 6
           C 50 4 55 6 58 10
           C 60 15 60 29 60 34
           C 60 46 47 56 32 60
           C 17 56 4 46 4 34
           C 4 29 4 15 6 10
           C 9 6 14 4 18 6
           C 22 3 27 3 32 5 Z"
        fill="#FFFFFF" />

  <!-- Inner Black Field -->
  <path d="M 32 7
           C 36 5 41 5 45 8
           C 48 6 53 8 56 11
           C 58 16 58 29 58 34
           C 58 45 46 54 32 58
           C 18 54 6 45 6 34
           C 6 29 6 16 8 11
           C 11 8 16 6 19 8
           C 23 5 28 5 32 7 Z"
        fill="#000000" />

  <!-- White Top Section -->
  <path d="M 7 12 C 10 9 15 7 19 9 C 23 6 28 6 32 8 C 36 6 41 6 45 9 C 49 7 54 9 57 12 L 58 26 L 6 26 Z" fill="#FFFFFF" />
  <line x1="6" y1="26" x2="58" y2="26" stroke="#000000" stroke-width="2" />

  <!-- Mini Black Fleur-de-lys -->
  <g transform="translate(32, 17) scale(0.24)">
    <path d="M 0 -28 C 4 -18 6 -10 6 -2 C 6 6 3 11 0 14 C -3 11 -6 6 -6 -2 C -6 -10 -4 -18 0 -28 Z" fill="#000000" />
    <path d="M -3 11 C -12 9 -25 4 -27 -9 C -28 -14 -25 -18 -20 -18 C -15 -18 -12 -13 -10 -6 C -8 2 -6 7 -2 10 Z" fill="#000000" />
    <path d="M 3 11 C 12 9 25 4 27 -9 C 28 -14 25 -18 20 -18 C 15 -18 12 -13 10 -6 C 8 2 6 7 2 10 Z" fill="#000000" />
    <rect x="-14" y="10" width="28" height="5" fill="#000000" />
    <path d="M -6 16 C -6 23 -11 27 -17 29 C -10 30 -4 26 -2 21 C 0 26 6 30 13 29 C 7 27 2 23 2 16 Z" fill="#000000" />
  </g>

  <!-- Highway Overpass Bar -->
  <rect x="10" y="34" width="44" height="7" fill="#FFFFFF" stroke="#000000" stroke-width="1.5" />
  <!-- Converging Road -->
  <path d="M 28 26 L 16 57 L 48 57 L 36 26 Z" fill="#000000" />
  <line x1="28" y1="26" x2="16" y2="57" stroke="#FFFFFF" stroke-width="1.5" />
  <line x1="36" y1="26" x2="48" y2="57" stroke="#FFFFFF" stroke-width="1.5" />
  <!-- Center White Line -->
  <line x1="32" y1="26" x2="32" y2="57" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4 3" />
  <!-- Overpass Bridge in front of road -->
  <rect x="10" y="34" width="44" height="7" fill="#FFFFFF" stroke="#000000" stroke-width="1.5" />
</svg>`;

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg.trim());
  console.log('Created public/logo.svg (black & white)');

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg.trim());
  console.log('Created public/favicon.svg (black & white)');

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
