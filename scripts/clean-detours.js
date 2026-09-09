import fs from 'fs';

function getDistance(p1, p2) {
  const R = 6371; // km
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1[0] * Math.PI / 180) *
      Math.cos(p2[0] * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Remove off-highway detour loops where the polyline leaves the corridor and loops back
export function removeDetourLoops(pts) {
  let result = [...pts];
  let changed = true;
  let passes = 0;

  while (changed && passes < 30) {
    changed = false;
    passes++;

    for (let i = 0; i < result.length - 4; i++) {
      let bestJ = -1;
      let maxRatio = 0;

      // Look ahead up to 70 points (~2-3 km)
      for (let j = i + 4; j < Math.min(i + 70, result.length); j++) {
        const directDist = getDistance(result[i], result[j]);

        // If direct distance is small (< 250m)
        if (directDist < 0.25) {
          let pathDist = 0;
          for (let k = i; k < j; k++) {
            pathDist += getDistance(result[k], result[k + 1]);
          }

          // And path distance is a significant detour (> 500m)
          if (pathDist > 0.5) {
            const ratio = pathDist / (directDist + 0.005);
            if (ratio > maxRatio) {
              maxRatio = ratio;
              bestJ = j;
            }
          }
        }
      }

      if (bestJ !== -1) {
        // Cut the off-ramp / turnaround loop between i and bestJ
        result.splice(i + 1, bestJ - i - 1);
        changed = true;
        break; // restart scan
      }
    }
  }

  // Also remove sharp reverse spikes: where point i -> i+1 -> i+2 doubles back (> 140 degree reversal)
  let smoothed = [];
  for (let i = 0; i < result.length; i++) {
    if (i > 0 && i < result.length - 1) {
      const pPrev = result[i - 1];
      const pCurr = result[i];
      const pNext = result[i + 1];

      const d1 = getDistance(pPrev, pCurr);
      const d2 = getDistance(pCurr, pNext);
      const dDirect = getDistance(pPrev, pNext);

      // If going to pCurr and coming back to pNext doubles back
      if (d1 + d2 > 0.1 && dDirect < (d1 + d2) * 0.25) {
        continue; // skip the spike point
      }
    }
    smoothed.push(result[i]);
  }

  return smoothed;
}

function run() {
  const routesPath = 'public/data/quebec-routes.json';
  const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

  let totalDetoursRemoved = 0;
  const updatedRoutes = routes.map((r) => {
    const beforeCount = r.coordinates.length;
    const cleaned = removeDetourLoops(r.coordinates);
    const removed = beforeCount - cleaned.length;
    if (removed > 0) {
      console.log(
        `${r.id.padEnd(12)}: removed ${removed} detour/loop points (from ${beforeCount} to ${cleaned.length})`
      );
      totalDetoursRemoved += removed;
    }
    return {
      ...r,
      coordinates: cleaned,
    };
  });

  fs.writeFileSync(routesPath, JSON.stringify(updatedRoutes, null, 2), 'utf8');
  console.log(`\nFinished! Pruned ${totalDetoursRemoved} off-highway detour loop points across all routes.`);
}

run();
