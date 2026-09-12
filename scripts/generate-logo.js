import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 512x512 Simple Black & White Arrow Logo
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Solid Black Square -->
  <rect width="512" height="512" fill="#000000" />

  <!-- Clean White Directional Arrow -->
  <path d="M 256 96 L 400 240 L 312 240 L 312 416 L 200 416 L 200 240 L 112 240 Z" fill="#FFFFFF" />
</svg>`;

// Favicon SVG (64x64 pixel-aligned clean arrow)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#000000" />
  <path d="M 32 12 L 50 30 L 39 30 L 39 52 L 25 52 L 25 30 L 14 30 Z" fill="#FFFFFF" />
</svg>`;

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg.trim());
  console.log('Created public/logo.svg (simple B&W arrow)');

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg.trim());
  console.log('Created public/favicon.svg (simple B&W arrow)');

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
