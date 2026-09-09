import fs from 'fs';
import https from 'https';

const data = JSON.parse(fs.readFileSync('mtq-raw.geojson', 'utf8'));

const numMap = {
  'A-5': '00005', 'A-10': '00010', 'A-13': '00013', 'A-15': '00015',
  'A-19': '00019', 'A-20': '00020', 'A-25': '00025', 'A-30': '00030',
  'A-31': '00031', 'A-35': '00035', 'A-40': '00040', 'A-50': '00050',
  'A-55': '00055', 'A-70': '00070', 'A-73': '00073', 'A-85': '00085',
  'A-410': '00410', 'A-440-LAVAL': '00440', 'A-440-QUEBEC': '00440',
  'A-520': '00520', 'A-530': '00530', 'A-540': '00540', 'A-573': '00573',
  'A-610': '00610', 'A-640': '00640', 'A-720': '00136', 'A-730': '00730',
  'A-740': '00740', 'A-930': '00930', 'A-973': '00973',
  'R-138': '00138', 'R-132': '00132', 'R-117': '00117', 'R-175': '00175',
  'R-155': '00155', 'R-169': '00169', 'R-109': '00109', 'R-112': '00112',
  'R-116': '00116', 'R-167': '00167', 'R-389': '00389'
};

function fetchOsrm(p1, p2) {
  return new Promise(resolve => {
    const url = `https://router.project-osrm.org/route/v1/driving/${p1[0]},${p1[1]};${p2[0]},${p2[1]}?overview=full&geometries=geojson`;
    https.get(url, { headers: { 'User-Agent': 'QuebecRoutesMap/1.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.routes && j.routes[0]) {
            resolve(j.routes[0].geometry.coordinates);
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

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

export async function assembleRouteFromMtq(routeId) {
  const mtqNum = numMap[routeId];
  if (!mtqNum) return null;

  let feats = data.features.filter(f =>
    f.properties.num_route === mtqNum &&
    f.properties.cod_sous_r === '0' &&
    (f.properties.cod_cote_c === 'D' || f.properties.cod_cote_c === 'C')
  );

  if (routeId === 'A-440-LAVAL') {
    feats = feats.filter(f => f.properties.num_tronc === '01');
  } else if (routeId === 'A-440-QUEBEC') {
    feats = feats.filter(f => f.properties.num_tronc === '06');
  } else if (routeId === 'A-720') {
    feats = feats.filter(f => f.properties.num_tronc === '01');
  }

  if (feats.length === 0) return null;

  // Sort by tronc and section
  feats.sort((a, b) => (a.properties.num_tronc + a.properties.num_sectn).localeCompare(b.properties.num_tronc + b.properties.num_sectn));

  const assembledLonLat = [];

  for (let i = 0; i < feats.length; i++) {
    let sectionCoords = feats[i].geometry.coordinates;
    if (feats[i].geometry.type === 'MultiLineString') {
      sectionCoords = feats[i].geometry.coordinates.flat();
    }
    if (!sectionCoords || sectionCoords.length === 0) continue;

    if (assembledLonLat.length === 0) {
      assembledLonLat.push(...sectionCoords);
    } else {
      const lastPt = assembledLonLat[assembledLonLat.length - 1];
      const startPt = sectionCoords[0];
      const endPt = sectionCoords[sectionCoords.length - 1];

      // Check if this section is oriented backwards compared to lastPt
      const distToStart = Math.hypot(lastPt[0] - startPt[0], lastPt[1] - startPt[1]);
      const distToEnd = Math.hypot(lastPt[0] - endPt[0], lastPt[1] - endPt[1]);

      let orientedCoords = sectionCoords;
      if (distToEnd < distToStart) {
        orientedCoords = [...sectionCoords].reverse();
      }

      const effectiveStart = orientedCoords[0];
      const gapDist = Math.hypot(lastPt[0] - effectiveStart[0], lastPt[1] - effectiveStart[1]);

      // If gap is greater than ~150 meters (0.0015 deg), bridge with OSRM
      if (gapDist > 0.0015) {
        const bridge = await fetchOsrm(lastPt, effectiveStart);
        if (bridge && bridge.length > 0) {
          assembledLonLat.push(...bridge.slice(1, -1));
        }
      }

      assembledLonLat.push(...orientedCoords);
    }
  }

  // Convert to [lat, lon]
  const latLonPts = assembledLonLat.map(p => [p[1], p[0]]);

  // Simplify Douglas-Peucker with ~20m tolerance (0.00000005)
  const simplified = simplifyDouglasPeucker(latLonPts, 0.00000005);
  const rounded = simplified.map(pt => [
    Number(pt[0].toFixed(5)),
    Number(pt[1].toFixed(5))
  ]);

  return rounded;
}

async function main() {
  const routesPath = 'public/data/quebec-routes.json';
  const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

  console.log(`Assembling official MTQ geometries for all ${routes.length} routes...`);

  const updatedRoutes = [];
  let totalSharp = 0;

  for (const r of routes) {
    const coords = await assembleRouteFromMtq(r.id);
    if (!coords || coords.length < 2) {
      console.warn(`Could not assemble MTQ geometry for ${r.id}, keeping existing.`);
      updatedRoutes.push(r);
      continue;
    }

    const sharp = countSharpTurns(coords, 45);
    totalSharp += sharp;

    console.log(
      `${r.id.padEnd(14)}: ${coords.length} accurate pts | sharp turns (>45°): ${sharp}`
    );

    updatedRoutes.push({
      ...r,
      coordinates: coords
    });
  }

  fs.writeFileSync(routesPath, JSON.stringify(updatedRoutes, null, 2), 'utf8');
  console.log(`\nUpdated ${routesPath} successfully! Total sharp turns: ${totalSharp}`);

  if (fs.existsSync('dist/data/quebec-routes.json')) {
    fs.writeFileSync('dist/data/quebec-routes.json', JSON.stringify(updatedRoutes, null, 2), 'utf8');
    console.log('Synced to dist/data/quebec-routes.json');
  }
}

main();
