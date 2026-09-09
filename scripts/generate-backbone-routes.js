import fs from 'fs';
import https from 'https';

// Clean highway backbone waypoints for all 41 Quebec routes
// Format: [lon, lat] (OSRM order)
export const ROUTE_BACKBONES = {
  'A-5': [
    [-75.728, 45.438],
    [-75.928, 45.635]
  ],
  'A-10': [
    [-73.551, 45.495],
    [-73.470, 45.455],
    [-72.950, 45.380],
    [-72.150, 45.280],
    [-71.890, 45.400]
  ],
  'A-13': [
    [-73.725, 45.467],
    [-73.844, 45.626]
  ],
  'A-15': [
    [-73.3444, 45.0060],
    [-73.518, 45.420],
    [-73.535, 45.470],
    [-73.654, 45.485],
    [-73.740, 45.560],
    [-74.015, 45.750],
    [-74.282, 46.054]
  ],
  'A-19': [
    [-73.665, 45.584],
    [-73.753, 45.665]
  ],
  'A-20': [
    [-74.32859, 45.22343],
    [-73.96368, 45.39447],
    [-73.605, 45.467],
    [-73.535, 45.470],
    [-73.398, 45.570],
    [-72.952, 45.628],
    [-72.484, 45.882],
    [-71.284, 46.742],
    [-70.551, 46.981],
    [-69.531, 47.834],
    [-68.531, 48.452],
    [-68.192, 48.584]
  ],
  'A-25': [
    [-73.488, 45.569],
    [-73.570, 45.600],
    [-73.662, 45.902]
  ],
  'A-30': [
    [-74.132, 45.262],
    [-73.742, 45.362],
    [-73.432, 45.442],
    [-73.382, 45.682],
    [-73.112, 46.032],
    [-72.462, 46.332]
  ],
  'A-31': [
    [-73.305, 45.882],
    [-73.431, 46.011]
  ],
  'A-35': [
    [-73.282, 45.322],
    [-73.180, 45.180],
    [-73.084, 45.022]
  ],
  'A-40': [
    [-74.376, 45.542],
    [-73.910, 45.420],
    [-73.650, 45.510],
    [-73.570, 45.580],
    [-73.400, 45.800],
    [-72.550, 46.340],
    [-71.280, 46.800],
    [-71.142, 46.881]
  ],
  'A-50': [
    [-75.718, 45.449],
    [-74.015, 45.750]
  ],
  'A-55': [
    [-72.142, 45.001],
    [-71.950, 45.400],
    [-72.484, 45.882],
    [-72.550, 46.340],
    [-72.742, 46.541]
  ],
  'A-70': [
    [-71.248, 48.412],
    [-70.885, 48.332]
  ],
  'A-73': [
    [-70.672, 46.122],
    [-71.050, 46.550],
    [-71.284, 46.742],
    [-71.362, 46.992]
  ],
  'A-85': [
    [-69.532, 47.832],
    [-69.150, 47.600],
    [-68.550, 47.459]
  ],
  'A-410': [
    [-71.978, 45.344],
    [-71.862, 45.368]
  ],
  'A-440-LAVAL': [
    [-73.805, 45.568],
    [-73.638, 45.662]
  ],
  'A-440-QUEBEC': [
    [-71.328, 46.802],
    [-71.260, 46.830],
    [-71.145, 46.885]
  ],
  'A-520': [
    [-73.736, 45.458],
    [-73.675, 45.502]
  ],
  'A-530': [
    [-74.153, 45.236],
    [-74.102, 45.262]
  ],
  'A-540': [
    [-74.032, 45.385],
    [-74.032, 45.421]
  ],
  'A-573': [
    [-71.325, 46.822],
    [-71.438, 46.915]
  ],
  'A-610': [
    [-71.939, 45.423],
    [-71.826, 45.448]
  ],
  'A-640': [
    [-74.012, 45.531],
    [-73.750, 45.620],
    [-73.492, 45.728]
  ],
  'A-720': [
    [-73.601, 45.471],
    [-73.548, 45.524]
  ],
  'A-730': [
    [-73.604, 45.364],
    [-73.574, 45.410]
  ],
  'A-740': [
    [-71.285, 46.772],
    [-71.296, 46.862]
  ],
  'A-930': [
    [-73.548, 45.385],
    [-73.521, 45.403]
  ],
  'A-973': [
    [-71.228, 46.818],
    [-71.265, 46.848]
  ],
  'R-138': [
    [-74.342, 44.992],
    [-73.862, 45.252],
    [-73.642, 45.422],
    [-73.552, 45.512],
    [-73.452, 45.742],
    [-73.182, 46.082],
    [-72.542, 46.342],
    [-71.222, 46.812],
    [-70.502, 47.442],
    [-70.152, 47.652],
    [-69.712, 48.142],
    [-68.152, 49.222],
    [-66.382, 50.212],
    [-63.602, 50.242],
    [-61.822, 50.182],
    [-61.272, 50.182]
  ],
  'R-132': [
    [-74.512, 45.012],
    [-74.132, 45.252],
    [-73.742, 45.372],
    [-73.512, 45.532],
    [-73.112, 46.042],
    [-72.442, 46.342],
    [-71.182, 46.802],
    [-70.272, 47.212],
    [-69.532, 47.832],
    [-68.532, 48.452],
    [-68.192, 48.582],
    [-67.532, 48.842],
    [-66.502, 49.122],
    [-64.392, 48.992],
    [-64.482, 48.832],
    [-64.212, 48.522],
    [-65.252, 48.032],
    [-66.932, 47.972],
    [-67.432, 48.462],
    [-68.192, 48.582]
  ],
  'R-117': [
    [-74.282, 46.052],
    [-74.742, 46.282],
    [-75.922, 46.612],
    [-77.352, 48.062],
    [-78.132, 48.132],
    [-79.022, 48.242],
    [-79.522, 48.202]
  ],
  'R-175': [
    [-71.282, 46.822],
    [-71.242, 47.562],
    [-71.072, 48.422]
  ],
  'R-155': [
    [-72.742, 46.542],
    [-72.782, 47.442],
    [-72.062, 48.432]
  ],
  'R-169': [
    [-72.062, 48.432],
    [-72.442, 48.652],
    [-72.452, 48.882],
    [-72.072, 48.872],
    [-71.652, 48.552],
    [-72.062, 48.432]
  ],
  'R-109': [
    [-78.202, 48.212],
    [-77.902, 48.802],
    [-77.632, 49.752]
  ],
  'R-112': [
    [-73.535, 45.522],
    [-73.342, 45.485],
    [-72.582, 45.362],
    [-71.892, 45.402],
    [-71.302, 46.082],
    [-70.802, 46.452]
  ],
  'R-116': [
    [-73.512, 45.502],
    [-73.202, 45.582],
    [-72.562, 45.652],
    [-71.952, 45.852],
    [-71.522, 46.422],
    [-71.284, 46.742]
  ],
  'R-167': [
    [-72.442, 48.652],
    [-74.152, 49.652],
    [-73.952, 50.252]
  ],
  'R-389': [
    [-68.152, 49.222],
    [-68.722, 50.642],
    [-69.252, 51.852],
    [-67.102, 52.782]
  ]
};

// Douglas-Peucker polyline simplification
function simplifyDouglasPeucker(points, sqTolerance) {
  if (points.length <= 2) return points;
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    let x = points[0][0], y = points[0][1];
    let dx = points[end][0] - x, dy = points[end][1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((points[i][0] - x) * dx + (points[i][1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = points[end][0]; y = points[end][1];
      } else if (t > 0) {
        x += dx * t; y += dy * t;
      }
    }
    dx = points[i][0] - x; dy = points[i][1] - y;
    const d = dx * dx + dy * dy;
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

function fetchOsrmRoute(waypoints) {
  return new Promise((resolve) => {
    const coordsStr = waypoints.map(pt => `${pt[0]},${pt[1]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    const req = https.get(url, { headers: { 'User-Agent': 'QuebecRoutesMap/2.0 (backbone accuracy)' } }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.code === 'Ok' && json.routes && json.routes[0]) {
            const coords = json.routes[0].geometry.coordinates.map(p => [p[1], p[0]]);
            const distanceKm = Math.round(json.routes[0].distance / 1000);
            resolve({ coords, distanceKm });
          } else {
            console.error('OSRM error:', json.code);
            resolve(null);
          }
        } catch (err) {
          console.error('JSON parse error:', err.message);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.error('HTTP request error:', err.message);
      resolve(null);
    });
    req.setTimeout(15000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function getBearing(p1, p2) {
  const lat1 = p1[0] * Math.PI / 180;
  const lat2 = p2[0] * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function countSharpTurns(pts, thresholdAngle = 45) {
  let count = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const b1 = getBearing(pts[i - 1], pts[i]);
    const b2 = getBearing(pts[i], pts[i + 1]);
    let diff = Math.abs(b2 - b1);
    if (diff > 180) diff = 360 - diff;
    if (diff > thresholdAngle) count++;
  }
  return count;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const routesPath = 'public/data/quebec-routes.json';
  const existingRoutes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

  console.log(`Generating pure highway backbone geometries for ${existingRoutes.length} routes...`);

  const updatedRoutes = [];
  let totalSharpTurns = 0;

  for (const route of existingRoutes) {
    const backbone = ROUTE_BACKBONES[route.id];
    if (!backbone || backbone.length < 2) {
      console.warn(`No backbone defined for ${route.id}, keeping existing.`);
      updatedRoutes.push(route);
      continue;
    }

    console.log(`Routing ${route.id} (${route.name}) with ${backbone.length} backbone waypoints...`);
    const result = await fetchOsrmRoute(backbone);

    if (!result || !result.coords || result.coords.length === 0) {
      console.error(`  ERROR: Failed to fetch OSRM route for ${route.id}, keeping existing.`);
      updatedRoutes.push(route);
      continue;
    }

    // Simplify with Douglas-Peucker ~20m tolerance (sqTolerance = 0.00000005)
    const simplified = simplifyDouglasPeucker(result.coords, 0.00000005);
    const rounded = simplified.map(pt => [
      Number(pt[0].toFixed(5)),
      Number(pt[1].toFixed(5))
    ]);

    const sharpCount = countSharpTurns(rounded, 45);
    totalSharpTurns += sharpCount;

    console.log(
      `  -> ${route.id}: ${result.coords.length} raw -> ${rounded.length} pts, ${result.distanceKm} km, sharp turns (>45°): ${sharpCount}`
    );

    updatedRoutes.push({
      ...route,
      distance: `${result.distanceKm} km`,
      coordinates: rounded
    });

    // Polite pause between requests
    await sleep(250);
  }

  fs.writeFileSync(routesPath, JSON.stringify(updatedRoutes, null, 2), 'utf8');
  console.log(`\nUpdated ${routesPath} successfully! Total sharp turns across all routes: ${totalSharpTurns}`);

  // Also copy to dist if dist exists
  if (fs.existsSync('dist/data/quebec-routes.json')) {
    fs.writeFileSync('dist/data/quebec-routes.json', JSON.stringify(updatedRoutes, null, 2), 'utf8');
    console.log(`Synced to dist/data/quebec-routes.json`);
  }
}

main();
