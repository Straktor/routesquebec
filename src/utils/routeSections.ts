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
      return r.category === 'national' && num >= 100 && num < 200;
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
      const northIds = [
        'A-5', 'A-13', 'A-15', 'A-19', 'A-25', 'A-40', 'A-50',
        'A-70', 'A-440-LAVAL', 'A-440-QUEBEC', 'A-520', 'A-573',
        'A-640', 'A-720', 'A-740', 'A-973', 'R-138', 'R-117',
        'R-175', 'R-155', 'R-169', 'R-109', 'R-167', 'R-389'
      ];
      return northIds.includes(r.id);
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
      const southIds = [
        'A-10', 'A-20', 'A-30', 'A-31', 'A-35', 'A-55', 'A-73',
        'A-85', 'A-410', 'A-530', 'A-540', 'A-610', 'A-730',
        'A-930', 'R-132', 'R-112', 'R-116'
      ];
      return southIds.includes(r.id);
    },
  },
];
