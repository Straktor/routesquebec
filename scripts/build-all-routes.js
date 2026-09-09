import fs from 'fs';

const mtq = JSON.parse(fs.readFileSync('mtq-raw.geojson', 'utf8'));
const currentRoutes = JSON.parse(fs.readFileSync('public/data/quebec-routes.json', 'utf8'));

// Existing route dictionary so we preserve custom descriptions, names, colors if already defined
const currentRouteMap = new Map();
currentRoutes.forEach(r => currentRouteMap.set(r.id, r));

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

// Group MTQ features by route number
const mtqByNum = new Map();
mtq.features.forEach(f => {
  if (f.properties.cod_sous_r !== '0') return;
  if (f.properties.cod_cote_c !== 'D' && f.properties.cod_cote_c !== 'C') return;
  const numStr = f.properties.num_route;
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num > 999) return;

  if (!mtqByNum.has(num)) mtqByNum.set(num, []);
  mtqByNum.get(num).push(f);
});

console.log('Unique numbered routes in MTQ:', mtqByNum.size);

// Assemble polyline for a list of features
function assembleFeatures(feats) {
  feats.sort((a, b) => (a.properties.num_tronc + a.properties.num_sectn).localeCompare(b.properties.num_tronc + b.properties.num_sectn));

  const lonLatPts = [];
  for (let i = 0; i < feats.length; i++) {
    let coords = feats[i].geometry.coordinates;
    if (feats[i].geometry.type === 'MultiLineString') {
      coords = feats[i].geometry.coordinates.flat();
    }
    if (!coords || coords.length === 0) continue;

    if (lonLatPts.length === 0) {
      lonLatPts.push(...coords);
    } else {
      const last = lonLatPts[lonLatPts.length - 1];
      const start = coords[0];
      const end = coords[coords.length - 1];

      const dStart = Math.hypot(last[0] - start[0], last[1] - start[1]);
      const dEnd = Math.hypot(last[0] - end[0], last[1] - end[1]);

      let oriented = coords;
      if (dEnd < dStart) {
        oriented = [...coords].reverse();
      }
      lonLatPts.push(...oriented);
    }
  }

  // Convert to [lat, lon]
  const latLon = lonLatPts.map(p => [p[1], p[0]]);
  // Simplify ~25m tolerance
  const simplified = simplifyDouglasPeucker(latLon, 0.00000008);
  return simplified.map(pt => [
    Number(pt[0].toFixed(5)),
    Number(pt[1].toFixed(5))
  ]);
}

const allRoutes = [];

// 1. Process all numbered routes
const sortedNums = [...mtqByNum.keys()].sort((a, b) => a - b);

for (const num of sortedNums) {
  const feats = mtqByNum.get(num);
  const clasf = feats[0].properties.des_clasf_;
  const isAutoroute = clasf === 'Autoroute' || num < 100 || (num >= 400 && num <= 999 && clasf === 'Autoroute');

  if (num === 440) {
    // Split into Laval and Quebec
    const lavalFeats = feats.filter(f => f.properties.num_tronc === '01');
    const quebecFeats = feats.filter(f => f.properties.num_tronc === '06');

    if (lavalFeats.length > 0) {
      const coords = assembleFeatures(lavalFeats);
      const existing = currentRouteMap.get('A-440-LAVAL') || {};
      const totalKm = Math.round(lavalFeats.reduce((s, f) => s + f.properties.val_longr_, 0) / 1000);
      allRoutes.push({
        id: 'A-440-LAVAL',
        number: '440',
        name: existing.name || 'Autoroute Jean-Noël-Lavoie (Laval)',
        category: 'autoroute',
        lengthKm: totalKm || existing.lengthKm || 20,
        startPoint: existing.startPoint || lavalFeats[0].properties.val_locls_ || 'A-13',
        endPoint: existing.endPoint || lavalFeats[lavalFeats.length - 1].properties.val_locl00 || 'A-25',
        description: existing.description || 'Rocade autoroutière nord de Laval reliant l\'A-13 à l\'A-25.',
        color: existing.color || '#00C8D7',
        coordinates: coords
      });
    }

    if (quebecFeats.length > 0) {
      const coords = assembleFeatures(quebecFeats);
      const existing = currentRouteMap.get('A-440-QUEBEC') || {};
      const totalKm = Math.round(quebecFeats.reduce((s, f) => s + f.properties.val_longr_, 0) / 1000);
      allRoutes.push({
        id: 'A-440-QUEBEC',
        number: '440',
        name: existing.name || 'Autoroute Charest & Dufferin-Montmorency (Québec)',
        category: 'autoroute',
        lengthKm: totalKm || existing.lengthKm || 13,
        startPoint: existing.startPoint || quebecFeats[0].properties.val_locls_ || 'A-73',
        endPoint: existing.endPoint || quebecFeats[quebecFeats.length - 1].properties.val_locl00 || 'Beauport',
        description: existing.description || 'Traversée est-ouest de Québec et desserte littorale vers Beauport.',
        color: existing.color || '#00C8D7',
        coordinates: coords
      });
    }
    continue;
  }

  const id = isAutoroute ? `A-${num}` : `R-${num}`;
  const existing = currentRouteMap.get(id);

  // If already in existing and we want to keep its existing coordinates (which we verified earlier):
  let coords;
  if (existing && existing.coordinates && existing.coordinates.length > 2) {
    coords = existing.coordinates;
  } else {
    coords = assembleFeatures(feats);
  }

  const totalKm = Math.round(feats.reduce((s, f) => s + (f.properties.val_longr_ || 0), 0) / 1000);
  const firstLoc = feats[0].properties.val_locls_ || '';
  const lastLoc = feats[feats.length - 1].properties.val_locl00 || '';

  let cat = 'regional';
  let defaultColor = '#A822FF';
  if (isAutoroute) {
    cat = 'autoroute';
    defaultColor = num < 100 ? '#0055FF' : (num < 700 ? '#00C8D7' : '#FF8800');
  } else if (num >= 100 && num < 200) {
    cat = 'national';
    defaultColor = '#00B341';
  }

  // Pick nice name
  let name = existing?.name;
  if (!name) {
    const rawName = feats.map(f => f.properties.nom_sous_r).filter(n => n && !n.match(/^Route \d+/i) && !n.match(/^Autoroute \d+/i))[0];
    if (isAutoroute) {
      name = rawName ? `Autoroute ${num} (${rawName})` : `Autoroute ${num}`;
    } else {
      name = rawName ? `Route ${num} (${rawName})` : `Route ${num}`;
    }
  }

  allRoutes.push({
    id,
    number: String(num),
    name,
    category: existing?.category || cat,
    lengthKm: existing?.lengthKm || totalKm,
    startPoint: existing?.startPoint || firstLoc || 'Début de tracé',
    endPoint: existing?.endPoint || lastLoc || 'Fin de tracé',
    description: existing?.description || `${isAutoroute ? 'Autoroute' : (cat === 'national' ? 'Route nationale' : 'Route régionale')} ${num} du réseau supérieur du Québec (${totalKm} km).`,
    color: existing?.color || defaultColor,
    coordinates: coords
  });
}

// Special check for A-720
if (!allRoutes.find(r => r.id === 'A-720')) {
  const existing720 = currentRouteMap.get('A-720');
  if (existing720) allRoutes.push(existing720);
}

// Sort: Autoroutes first by number, then Nationales by number, then Regionales by number
allRoutes.sort((a, b) => {
  const numA = parseInt(a.number, 10);
  const numB = parseInt(b.number, 10);
  if (a.category === 'autoroute' && b.category !== 'autoroute') return -1;
  if (a.category !== 'autoroute' && b.category === 'autoroute') return 1;
  return numA - numB;
});

console.log('Total assembled routes:', allRoutes.length);
const autorouteCount = allRoutes.filter(r => r.category === 'autoroute').length;
const nationalCount = allRoutes.filter(r => r.category === 'national').length;
const regionalCount = allRoutes.filter(r => r.category === 'regional').length;
console.log(`- Autoroutes: ${autorouteCount}`);
console.log(`- Nationales: ${nationalCount}`);
console.log(`- Régionales: ${regionalCount}`);

fs.writeFileSync('public/data/quebec-routes.json', JSON.stringify(allRoutes, null, 2), 'utf8');
fs.writeFileSync('dist/data/quebec-routes.json', JSON.stringify(allRoutes, null, 2), 'utf8');
console.log('Successfully saved to public/data/quebec-routes.json and dist/data/quebec-routes.json!');
