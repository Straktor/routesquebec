<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import type { RouteInfo } from '../types/route';
import { ROUTE_SECTIONS, type RouteSectionGroup } from '../utils/routeSections';

const props = defineProps<{
  routes: RouteInfo[];
  selectedRouteIds: string[];
  isSidebarOpen?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleRoute', id: string): void;
  (e: 'clearSelection'): void;
  (e: 'openGuide'): void;
  (e: 'setSelection', ids: string[]): void;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let currentTileLayer: L.TileLayer | null = null;
const polylinesMap = new Map<string, { main: L.Polyline; casing?: L.Polyline }>();

const isOsmLayer = ref(false);
const isLegendOpen = ref(false);

const QUEBEC_CENTER: L.LatLngTuple = [48.0, -70.5];
const DEFAULT_ZOOM = 6;

function initMap() {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    center: QUEBEC_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: false,
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  setTileLayer(isOsmLayer.value);
  renderRoutes();
}

// Custom TileLayer serving local pre-bundled offline tiles with OSM fallback
const LocalFallbackTileLayer = (L.TileLayer as any).extend({
  createTile(coords: L.Coords, done: L.DoneCallback) {
    const tile = document.createElement('img');
    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
    const localUrl = `${baseUrl}/tiles/${coords.z}/${coords.x}/${coords.y}.png`;
    const fallbackUrl = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;

    tile.onload = () => done(undefined, tile);
    tile.onerror = () => {
      // If local tile not found (e.g. beyond zoom 8), fallback to OpenStreetMap
      if (tile.src !== fallbackUrl) {
        tile.src = fallbackUrl;
      } else {
        done(new Error('Tile load error'), tile);
      }
    };

    tile.src = localUrl;
    return tile;
  },
});

function setTileLayer(directOsm: boolean) {
  if (!map) return;

  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  if (directOsm) {
    currentTileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }
    );
  } else {
    // Local pre-bundled offline tiles with seamless OSM fallback
    currentTileLayer = new LocalFallbackTileLayer('', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap (Tuiles locales du Québec)',
    });
  }

  if (currentTileLayer) {
    currentTileLayer.addTo(map);
  }
}

function toggleTileLayer() {
  isOsmLayer.value = !isOsmLayer.value;
  setTileLayer(isOsmLayer.value);
}

function renderRoutes() {
  const currentMap = map;
  if (!currentMap) return;

  // Clear existing polylines
  polylinesMap.forEach(({ main, casing }) => {
    currentMap.removeLayer(main);
    if (casing) currentMap.removeLayer(casing);
  });
  polylinesMap.clear();

  const hasSelection = props.selectedRouteIds.length > 0;

  props.routes.forEach(route => {
    const latLngs = route.coordinates.map(c => L.latLng(c[0], c[1]));
    const isSelected = props.selectedRouteIds.includes(route.id);

    // Stark polyline styling
    const defaultColor = route.category === 'autoroute' ? '#000000' : '#444444';
    const weight = isSelected ? 6 : hasSelection ? 2 : 3.5;
    const opacity = isSelected ? 1 : hasSelection ? 0.25 : 0.85;

    let casingPolyline: L.Polyline | undefined;

    if (isSelected) {
      // High-contrast casing: 10px black underlay
      casingPolyline = L.polyline(latLngs, {
        color: '#000000',
        weight: 11,
        opacity: 1,
        lineCap: 'square',
        lineJoin: 'miter',
      }).addTo(currentMap);
    }

    const polyline = L.polyline(latLngs, {
      color: isSelected ? '#FF0000' : defaultColor,
      weight,
      opacity,
      lineCap: 'square',
      lineJoin: 'miter',
    }).addTo(currentMap);

    // Tooltip: inverted black box with Space Mono
    polyline.bindTooltip(
      `<div class="font-mono text-xs"><strong>${route.name.toUpperCase()}</strong><br/>[${route.number}] // ${route.lengthKm} KM</div>`,
      {
        sticky: true,
        direction: 'top',
        className: 'custom-raw-tooltip',
      }
    );

    // Popup: stark black/white box, no rounding, 3px border
    const popupContent = `
      <div class="p-3 bg-white text-black font-mono border-[3px] border-black">
        <div class="flex items-center gap-2 mb-2 pb-1 border-b-2 border-black">
          <span class="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase">
            ${route.category === 'autoroute' ? 'AUTOROUTE' : 'ROUTE'} ${route.number}
          </span>
          <span class="text-xs font-bold">${route.lengthKm} KM</span>
        </div>
        <div class="text-xs font-bold uppercase mb-1" style="font-family: var(--font-headline)">
          ${route.name}
        </div>
        <p class="text-[11px] text-black/80 mb-2 uppercase">
          ${route.startPoint} → ${route.endPoint}
        </p>
        <p class="text-[10px] text-black/60 leading-relaxed border-t border-black/30 pt-1">
          ${route.description}
        </p>
      </div>
    `;
    polyline.bindPopup(popupContent, { maxWidth: 320 });

    // Events
    polyline.on('click', () => {
      emit('toggleRoute', route.id);
    });

    polyline.on('mouseover', () => {
      if (!props.selectedRouteIds.includes(route.id)) {
        polyline.setStyle({
          weight: hasSelection ? 4 : 5,
          opacity: 1,
          color: '#000000',
        });
      }
    });

    polyline.on('mouseout', () => {
      if (!props.selectedRouteIds.includes(route.id)) {
        polyline.setStyle({
          weight: hasSelection ? 2 : 3.5,
          opacity: hasSelection ? 0.25 : 0.85,
          color: defaultColor,
        });
      }
    });

    if (isSelected) {
      if (casingPolyline) casingPolyline.bringToFront();
      polyline.bringToFront();
    }

    polylinesMap.set(route.id, { main: polyline, casing: casingPolyline });
  });
}

function updateHighlight(shouldFitBounds: boolean = true) {
  if (!map) return;

  renderRoutes();

  if (shouldFitBounds && props.selectedRouteIds.length > 0) {
    let combinedBounds: L.LatLngBounds | null = null;

    props.selectedRouteIds.forEach(id => {
      const entry = polylinesMap.get(id);
      if (entry) {
        const bounds = entry.main.getBounds();
        if (!combinedBounds) {
          combinedBounds = L.latLngBounds(bounds.getSouthWest(), bounds.getNorthEast());
        } else {
          combinedBounds.extend(bounds);
        }
      }
    });

    if (combinedBounds) {
      map.fitBounds(combinedBounds, {
        padding: [40, 40],
        maxZoom: 10,
        animate: true,
      });
    }
  }
}

function resetView() {
  if (!map) return;
  emit('clearSelection');
  map.setView(QUEBEC_CENTER, DEFAULT_ZOOM, { animate: true });
}

function isSectionActive(section: RouteSectionGroup) {
  const matching = props.routes.filter(section.matcher);
  if (matching.length === 0) return false;
  return matching.every(r => props.selectedRouteIds.includes(r.id));
}

function handleQuickSelectSection(section: RouteSectionGroup) {
  const matchingIds = props.routes.filter(section.matcher).map(r => r.id);
  const allSelected = matchingIds.every(id => props.selectedRouteIds.includes(id));
  if (allSelected) {
    emit('clearSelection');
  } else {
    emit('setSelection', matchingIds);
  }
}

watch(
  () => props.selectedRouteIds,
  () => {
    updateHighlight(true);
  },
  { deep: true }
);

watch(
  () => props.routes,
  () => {
    renderRoutes();
  },
  { deep: true }
);

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full z-0 bg-[#F0F0F0]"></div>

    <!-- Floating Quick Type Selector Bar -->
    <div
      :class="[
        'absolute top-2 left-2 right-2 sm:right-auto sm:top-4 sm:left-4 z-[500] sm:max-w-[calc(100%-220px)] overflow-x-auto items-center gap-1.5 p-1.5 sm:p-2 bg-white border-[3px] border-black text-xs font-mono select-none',
        isSidebarOpen ? 'hidden md:flex' : 'flex'
      ]"
    >
      <span class="font-bold uppercase tracking-wider pl-1 pr-1 shrink-0 text-[10px] sm:text-xs">
        TYPES MTQ :
      </span>
      <button
        v-for="sec in ROUTE_SECTIONS"
        :key="sec.id"
        @click="handleQuickSelectSection(sec)"
        class="px-2 py-1 border-2 border-black uppercase text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors shrink-0 cursor-pointer"
        :class="[
          isSectionActive(sec)
            ? 'bg-black text-white'
            : 'bg-white text-black hover:bg-black hover:text-white'
        ]"
      >
        {{ sec.shortLabel }}
      </button>
    </div>

    <!-- Floating Map Controls (Top Right) -->
    <div
      :class="[
        'absolute top-14 sm:top-4 right-2 sm:right-4 z-[500] flex-col gap-1.5 sm:gap-2',
        isSidebarOpen ? 'hidden md:flex' : 'flex'
      ]"
    >
      <!-- Reset View to Quebec -->
      <button
        @click="resetView"
        class="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white hover:bg-black text-black hover:text-white border-[3px] border-black text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
      >
        VUE GÉNÉRALE
      </button>

      <!-- Toggle Tile Layer -->
      <button
        @click="toggleTileLayer"
        class="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white hover:bg-black text-black hover:text-white border-[3px] border-black text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
      >
        {{ isOsmLayer ? 'TUILES : EN LIGNE' : 'TUILES : LOCALES' }}
      </button>
    </div>

    <!-- Map Legend (Collapsible on mobile, permanent on desktop) -->
    <div
      :class="[
        'absolute bottom-4 left-2 sm:bottom-6 sm:left-6 z-[500] pointer-events-auto select-none',
        isSidebarOpen ? 'hidden md:block' : 'block'
      ]"
    >
      <!-- Toggle button for mobile -->
      <button
        @click="isLegendOpen = !isLegendOpen"
        class="sm:hidden mb-1 px-2 py-1 bg-white text-black border-[2px] border-black font-mono text-[10px] font-bold uppercase cursor-pointer"
      >
        {{ isLegendOpen ? '[FERMER LÉGENDE]' : '[LÉGENDE]' }}
      </button>

      <!-- Legend Body -->
      <div
        :class="[
          'bg-white border-[3px] border-black p-2.5 sm:p-3 text-[11px] sm:text-xs font-mono space-y-1.5 sm:space-y-2',
          isLegendOpen ? 'block' : 'hidden sm:block'
        ]"
      >
        <div class="font-bold uppercase tracking-wider border-b-2 border-black pb-1">
          LÉGENDE // CODES
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-2 bg-black border border-black inline-block"></span>
          <span class="uppercase">Autoroutes (1-999)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-2 bg-[#444444] border border-black inline-block"></span>
          <span class="uppercase">Routes (100+)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-2 bg-[#FF0000] border border-black inline-block"></span>
          <span class="font-bold text-[#FF0000] uppercase">
            {{ selectedRouteIds.length > 0 ? `ACTIVES (${selectedRouteIds.length})` : 'SÉLECTION' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
