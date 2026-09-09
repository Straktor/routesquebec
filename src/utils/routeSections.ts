import type { RouteInfo } from '../types/route';

export interface RouteSectionGroup {
  id: string;
  label: string;
  shortLabel: string;
  category: 'orientation' | 'hierarchy' | 'geography';
  iconName: string;
  color: string;
  description: string;
  matcher: (route: RouteInfo) => boolean;
}

export const ROUTE_SECTIONS: RouteSectionGroup[] = [
  // 1. Orientation (Convention Pairs / Impairs)
  {
    id: 'east_west',
    label: 'Axes Est-Ouest (Pairs)',
    shortLabel: 'Est-Ouest (Pairs)',
    category: 'orientation',
    iconName: 'ArrowRightLeft',
    color: 'blue',
    description: 'Routes et autoroutes parallèles au fleuve Saint-Laurent (numéro pair : A-20, A-40, R-132, R-138...)',
    matcher: (r) => {
      const num = parseInt(r.number, 10);
      return !isNaN(num) && num % 2 === 0;
    },
  },
  {
    id: 'north_south',
    label: 'Axes Nord-Sud (Impairs)',
    shortLabel: 'Nord-Sud (Impairs)',
    category: 'orientation',
    iconName: 'ArrowUpDown',
    color: 'purple',
    description: 'Routes et autoroutes perpendiculaires au fleuve ou transfrontalières (numéro impair : A-15, A-55, A-73, R-117, R-175...)',
    matcher: (r) => {
      const num = parseInt(r.number, 10);
      return !isNaN(num) && num % 2 === 1;
    },
  },

  // 2. Hiérarchie et nomenclature MTQ
  {
    id: 'main_autoroutes',
    label: 'Autoroutes principales (1-99)',
    shortLabel: 'Autoroutes (1-99)',
    category: 'hierarchy',
    iconName: 'Route',
    color: 'indigo',
    description: 'Grands corridors interurbains transquébécois à deux chiffres (A-10, A-15, A-20, A-40, A-50, A-55, A-73...)',
    matcher: (r) => {
      const num = parseInt(r.number, 10);
      return r.category === 'autoroute' && num < 100;
    },
  },
  {
    id: 'bypass_autoroutes',
    label: 'Rocades & Contournements (4xx, 6xx)',
    shortLabel: 'Rocades (4xx, 6xx)',
    category: 'hierarchy',
    iconName: 'RefreshCw',
    color: 'sky',
    description: 'Autoroutes de déviation et ceintures périurbaines (premier chiffre pair : A-410, A-440, A-610, A-640)',
    matcher: (r) => {
      return (
        r.category === 'autoroute' &&
        r.number.length === 3 &&
        (r.number.startsWith('4') || r.number.startsWith('6'))
      );
    },
  },
  {
    id: 'spur_autoroutes',
    label: 'Antennes & Accès urbains (5xx, 7xx, 9xx)',
    shortLabel: 'Antennes (5xx, 7xx, 9xx)',
    category: 'hierarchy',
    iconName: 'GitFork',
    color: 'amber',
    description: 'Éperons, dessertes directes et traversées urbaines (premier chiffre impair : A-520, A-530, A-720, A-740, A-930...)',
    matcher: (r) => {
      return (
        r.category === 'autoroute' &&
        r.number.length === 3 &&
        (r.number.startsWith('5') || r.number.startsWith('7') || r.number.startsWith('9'))
      );
    },
  },
  {
    id: 'national_routes',
    label: 'Routes Nationales (Série 100)',
    shortLabel: 'Nationales (100)',
    category: 'hierarchy',
    iconName: 'Compass',
    color: 'emerald',
    description: 'Réseau supérieur de routes nationales reliant les régions administratives (R-117, R-132, R-138, R-175...)',
    matcher: (r) => {
      const num = parseInt(r.number, 10);
      return (r.category === 'national' || (num >= 100 && num < 200)) && r.category !== 'autoroute';
    },
  },
  {
    id: 'regional_routes',
    label: 'Routes Régionales (Séries 200 & 300)',
    shortLabel: 'Régionales (200 & 300)',
    category: 'hierarchy',
    iconName: 'Compass',
    color: 'purple',
    description: 'Réseau intermédiaire reliant les localités régionales et nordiques (Série 200 au Sud, Série 300 au Nord)',
    matcher: (r) => {
      const num = parseInt(r.number, 10);
      return (r.category === 'regional' || num >= 200) && r.category !== 'autoroute';
    },
  },

  // 3. Situation Géographique / Rives du Saint-Laurent
  {
    id: 'north_shore',
    label: 'Rive-Nord & Laurentides',
    shortLabel: 'Rive-Nord',
    category: 'geography',
    iconName: 'Navigation',
    color: 'teal',
    description: 'Axes situés au nord du fleuve Saint-Laurent (A-40, A-50, A-640, R-138, R-117, R-175...)',
    matcher: (r) => {
      const num = parseInt(r.number, 10);
      if (num >= 300 && num < 400) return true;
      if (num >= 200 && num < 300) return false;
      const southSet = new Set([
        'A-10', 'A-20', 'A-30', 'A-35', 'A-55', 'A-73', 'A-85',
        'A-410', 'A-530', 'A-540', 'A-610', 'A-730', 'A-930', 'A-955',
        'R-104', 'R-108', 'R-112', 'R-116', 'R-132', 'R-133', 'R-137',
        'R-139', 'R-141', 'R-143', 'R-147', 'R-161', 'R-162', 'R-165',
        'R-171', 'R-173', 'R-185', 'R-195', 'R-197', 'R-198'
      ]);
      return !southSet.has(r.id);
    },
  },
  {
    id: 'south_shore',
    label: 'Rive-Sud, Estrie & Gaspésie',
    shortLabel: 'Rive-Sud & Estrie',
    category: 'geography',
    iconName: 'Navigation',
    color: 'rose',
    description: 'Axes situés au sud du fleuve Saint-Laurent (A-10, A-20, A-30, A-35, A-55, A-73, A-85, R-132, R-116...)',
    matcher: (r) => {
      const num = parseInt(r.number, 10);
      if (num >= 200 && num < 300) return true;
      if (num >= 300 && num < 400) return false;
      const southSet = new Set([
        'A-10', 'A-20', 'A-30', 'A-35', 'A-55', 'A-73', 'A-85',
        'A-410', 'A-530', 'A-540', 'A-610', 'A-730', 'A-930', 'A-955',
        'R-104', 'R-108', 'R-112', 'R-116', 'R-132', 'R-133', 'R-137',
        'R-139', 'R-141', 'R-143', 'R-147', 'R-161', 'R-162', 'R-165',
        'R-171', 'R-173', 'R-185', 'R-195', 'R-197', 'R-198'
      ]);
      return southSet.has(r.id);
    },
  },
];

export interface RouteTypeInfo {
  type: 'main_autoroute' | 'bypass_autoroute' | 'spur_autoroute' | 'national_route' | 'regional_route';
  label: string;
  shortLabel: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export const ROUTE_TYPE_STYLES: RouteTypeInfo[] = [
  {
    type: 'main_autoroute',
    label: 'Autoroutes principales (1-99)',
    shortLabel: 'Autoroutes (1-99)',
    color: '#0055FF',      // Vibrant Blue
    borderColor: '#000000',
    badgeBg: '#0055FF',
    badgeText: '#FFFFFF',
  },
  {
    type: 'bypass_autoroute',
    label: 'Rocades & Contournements (4xx, 6xx)',
    shortLabel: 'Rocades (4xx, 6xx)',
    color: '#00C8D7',      // Vivid Cyan
    borderColor: '#000000',
    badgeBg: '#00C8D7',
    badgeText: '#000000',
  },
  {
    type: 'spur_autoroute',
    label: 'Antennes & Accès urbains (5xx, 7xx, 9xx)',
    shortLabel: 'Antennes (5xx, 7xx, 9xx)',
    color: '#FF8800',      // Vivid Safety Orange
    borderColor: '#000000',
    badgeBg: '#FF8800',
    badgeText: '#000000',
  },
  {
    type: 'national_route',
    label: 'Routes Nationales (Série 100)',
    shortLabel: 'Nationales (100)',
    color: '#00B341',      // MTQ Green
    borderColor: '#000000',
    badgeBg: '#00B341',
    badgeText: '#FFFFFF',
  },
  {
    type: 'regional_route',
    label: 'Routes Régionales (Séries 200 & 300)',
    shortLabel: 'Régionales (200-300)',
    color: '#A822FF',      // Electric Violet
    borderColor: '#000000',
    badgeBg: '#A822FF',
    badgeText: '#FFFFFF',
  },
];

export function getRouteTypeInfo(route: RouteInfo): RouteTypeInfo {
  const num = parseInt(route.number, 10);
  if (route.category === 'autoroute') {
    if (num < 100) {
      return ROUTE_TYPE_STYLES[0];
    }
    if (route.number.startsWith('4') || route.number.startsWith('6')) {
      return ROUTE_TYPE_STYLES[1];
    }
    return ROUTE_TYPE_STYLES[2];
  } else {
    if (num >= 200) {
      return ROUTE_TYPE_STYLES[4];
    }
    return ROUTE_TYPE_STYLES[3];
  }
}
