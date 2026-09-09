import fs from 'fs';
import path from 'path';
import https from 'https';

function deg2tile(lat, lon, zoom) {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return [x, y];
}

const tiles = [];

// Zoom 5, 6, 7 for all of Quebec
for (let z = 5; z <= 7; z++) {
  const [minX, maxY] = deg2tile(44.5, -79.5, z);
  const [maxX, minY] = deg2tile(52.5, -61.0, z);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ z, x, y });
    }
  }
}

// Zoom 8 for main highway corridor (Montreal, Quebec City, Saguenay, Bas-St-Laurent)
const [minX8, maxY8] = deg2tile(45.0, -75.5, 8);
const [maxX8, minY8] = deg2tile(49.0, -68.0, 8);
for (let x = minX8; x <= maxX8; x++) {
  for (let y = minY8; y <= maxY8; y++) {
    tiles.push({ z: 8, x, y });
  }
}

console.log(`Downloading ${tiles.length} Quebec map tiles...`);

function downloadTile({ z, x, y }) {
  return new Promise((resolve) => {
    const dir = path.join('public', 'tiles', String(z), String(x));
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${y}.png`);

    if (fs.existsSync(filePath)) {
      return resolve();
    }

    const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'QuebecRoutesMap/1.0 (offline tile cache)' } },
      (res) => {
        if (res.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else {
          console.warn(`Tile ${z}/${x}/${y} returned status ${res.statusCode}`);
          resolve();
        }
      }
    );

    req.on('error', (err) => {
      console.warn(`Error downloading ${z}/${x}/${y}:`, err.message);
      resolve();
    });
  });
}

// Download with concurrency limit of 5
async function run() {
  const CONCURRENCY = 5;
  for (let i = 0; i < tiles.length; i += CONCURRENCY) {
    const batch = tiles.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(downloadTile));
    // Brief polite pause between batches
    await new Promise((r) => setTimeout(r, 60));
  }
  console.log('All tiles downloaded successfully to public/tiles/');
}

run();
