import { useQuery } from '@tanstack/vue-query';
import type { RouteInfo } from '../types/route';

export function useRoutes() {
  return useQuery<RouteInfo[]>({
    queryKey: ['quebec-routes'],
    queryFn: async () => {
      // Fetch from public static path (supports relative base)
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/data/quebec-routes.json`);
      if (!response.ok) {
        throw new Error(`Failed to load route data: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: Infinity, // static dataset, cache indefinitely
  });
}
