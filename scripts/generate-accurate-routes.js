import fs from 'fs';
import https from 'https';

// Douglas-Peucker polyline simplification
function simplifyDouglasPeucker(points, sqTolerance) {
  if (points.length <= 2) return points;
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = getSqSegDist(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }
  if (dmax > sqTolerance) {
    const rec1 = simplifyDouglasPeucker(points.slice(0, index + 1), sqTolerance);
    const rec2 = simplifyDouglasPeucker(points.slice(index), sqTolerance);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  }
  return [points[0], points[end]];
}

function getSqSegDist(p, p1, p2) {
  let x = p1[0], y = p1[1];
  let dx = p2[0] - x, dy = p2[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2[0]; y = p2[1];
    } else if (t > 0) {
      x += dx * t; y += dy * t;
    }
  }
  dx = p[0] - x; dy = p[1] - y;
  return dx * dx + dy * dy;
}

function fetchOsrmRoute(waypoints) {
  return new Promise((resolve) => {
    // waypoints is array of [lat, lon]; OSRM expects "lon,lat"
    const coordsStr = waypoints.map(pt => `${pt[1]},${pt[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    const req = https.get(url, { headers: { 'User-Agent': 'QuebecRoutesMap/1.0 (accuracy enhancer)' } }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.code === 'Ok' && json.routes && json.routes[0]) {
            // Convert [lon, lat] -> [lat, lon]
            const coords = json.routes[0].geometry.coordinates.map(p => [p[1], p[0]]);
            resolve(coords);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// Sleep helper to be polite to OSRM demo server
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function enhanceRoute(route) {
  const originalPts = route.coordinates;
  if (originalPts.length < 2) return route;

  console.log(`Processing ${route.id} (${route.name}) with ${originalPts.length} waypoints...`);

  // Break waypoints into chunks of at most 5 with 1 overlapping point
  const CHUNK_SIZE = 4;
  const allDetailedPoints = [];

  for (let i = 0; i < originalPts.length - 1; i += CHUNK_SIZE - 1) {
    const chunk = originalPts.slice(i, Math.min(i + CHUNK_SIZE, originalPts.length));
    if (chunk.length < 2) break;

    const detailedChunk = await fetchOsrmRoute(chunk);
    if (detailedChunk && detailedChunk.length > 0) {
      if (allDetailedPoints.length > 0) {
        // Avoid duplicate joint point
        allDetailedPoints.push(...detailedChunk.slice(1));
      } else {
        allDetailedPoints.push(...detailedChunk);
      }
    } else {
      console.warn(`  Fallback to straight segment for ${route.id} chunk [${i}..${i + chunk.length}]`);
      if (allDetailedPoints.length > 0) {
        allDetailedPoints.push(...chunk.slice(1));
      } else {
        allDetailedPoints.push(...chunk);
      }
    }

    // Polite pause
    await sleep(250);
  }

  // Simplify using Douglas-Peucker with ~20m tolerance (sqTolerance = 0.00000005)
  const simplified = simplifyDouglasPeucker(allDetailedPoints, 0.00000005);
  const rounded = simplified.map(pt => [
    Number(pt[0].toFixed(5)),
    Number(pt[1].toFixed(5))
  ]);

  console.log(`  -> ${route.id}: raw ${allDetailedPoints.length} pts -> simplified ${rounded.length} accurate pts`);

  return {
    ...route,
    coordinates: rounded
  };
}

async function main() {
  const routesPath = 'public/data/quebec-routes.json';
  const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

  console.log(`Enhancing accuracy for ${routes.length} routes...`);

  const updatedRoutes = [];
  for (const route of routes) {
    const enhanced = await enhanceRoute(route);
    updatedRoutes.push(enhanced);
  }

  fs.writeFileSync(routesPath, JSON.stringify(updatedRoutes, null, 2), 'utf8');
  console.log(`\nSuccessfully updated ${routesPath} with high-accuracy road alignments!`);
}

main();
