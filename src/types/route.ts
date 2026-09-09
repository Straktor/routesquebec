export type RouteCategory = 'autoroute' | 'national' | 'regional';

export interface RouteInfo {
  id: string;
  number: string;
  name: string;
  category: RouteCategory;
  lengthKm: number;
  startPoint: string;
  endPoint: string;
  description: string;
  color: string;
  coordinates: [number, number][];
}
