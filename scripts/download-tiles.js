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
  const [minX, maxY] = deg2tile(44.5, -80.0, z);
  const [maxX, minY] = deg2tile(53.5, -60.0, z);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ z, x, y });
    }
  }
}

// Zoom 8 for main Quebec highway territory (Outaouais to Gaspesie, Abitibi to Saguenay)
const [minX8, maxY8] = deg2tile(44.8, -79.5, 8);
const [maxX8, minY8] = deg2tile(50.5, -64.0, 8);
for (let x = minX8; x <= maxX8; x++) {
  for (let y = minY8; y <= maxY8; y++) {
    tiles.push({ z: 8, x, y });
  }
}

console.log(`Downloading ${tiles.length} Esri Light Gray Quebec map tiles...`);

function downloadTile({ z, x, y }) {
  return new Promise((resolve) => {
    const dir = path.join('public', 'tiles', String(z), String(x));
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${y}.jpg`);

    if (fs.existsSync(filePath)) {
      return resolve();
    }

    // Esri tile URL structure: /tile/{z}/{y}/{x}
    const url = `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}`;
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'QuebecRoutesMap/1.0' } },
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

// Download with concurrency limit of 10
async function run() {
  const CONCURRENCY = 10;
  for (let i = 0; i < tiles.length; i += CONCURRENCY) {
    const batch = tiles.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(downloadTile));
    await new Promise((r) => setTimeout(r, 40));
  }
  console.log('All tiles downloaded successfully to public/tiles/');
}

run();
