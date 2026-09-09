<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import { Maximize2, Layers, BookOpen } from '@lucide/vue';
import type { RouteInfo } from '../types/route';

const props = defineProps<{
  routes: RouteInfo[];
  selectedRouteIds: string[];
}>();

const emit = defineEmits<{
  (e: 'toggleRoute', id: string): void;
  (e: 'clearSelection'): void;
  (e: 'openGuide'): void;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let currentTileLayer: L.TileLayer | null = null;
const polylinesMap = new Map<string, { main: L.Polyline; glow?: L.Polyline }>();

const isSatellite = ref(false);

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

  setTileLayer(isSatellite.value);
  renderRoutes();
}

function setTileLayer(satellite: boolean) {
  if (!map) return;

  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  if (satellite) {
    // OpenStreetMap Standard
    currentTileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
  } else {
    // CartoDB Voyager (clean, high contrast for highways)
    currentTileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    );
  }

  currentTileLayer.addTo(map);
}

function toggleTileLayer() {
  isSatellite.value = !isSatellite.value;
  setTileLayer(isSatellite.value);
}

function renderRoutes() {
  const currentMap = map;
  if (!currentMap) return;

  // Clear existing polylines
  polylinesMap.forEach(({ main, glow }) => {
    currentMap.removeLayer(main);
    if (glow) currentMap.removeLayer(glow);
  });
  polylinesMap.clear();

  const hasSelection = props.selectedRouteIds.length > 0;

  props.routes.forEach(route => {
    const latLngs = route.coordinates.map(c => L.latLng(c[0], c[1]));
    const isSelected = props.selectedRouteIds.includes(route.id);

    // Normal or dim style
    const defaultColor = route.category === 'autoroute' ? '#2563eb' : '#059669';
    const weight = isSelected ? 6 : hasSelection ? 2.5 : 4;
    const opacity = isSelected ? 1 : hasSelection ? 0.3 : 0.8;

    let glowPolyline: L.Polyline | undefined;

    if (isSelected) {
      // Add glowing halo effect behind selected route
      glowPolyline = L.polyline(latLngs, {
        color: '#f59e0b',
        weight: 12,
        opacity: 0.55,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(currentMap);
    }

    const polyline = L.polyline(latLngs, {
      color: isSelected ? '#ea580c' : defaultColor,
      weight,
      opacity,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(currentMap);

    // Tooltip
    polyline.bindTooltip(
      `<div class="font-semibold">${route.name}</div><div class="text-xs text-slate-500">${route.lengthKm} km (Cliquer pour sélectionner/désélectionner)</div>`,
      {
        sticky: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip shadow-sm rounded-md px-2 py-1',
      }
    );

    // Popup
    const badgeBg = route.category === 'autoroute' ? 'bg-blue-600' : 'bg-emerald-600';
    const badgeLabel = route.category === 'autoroute' ? 'Autoroute' : 'Route';
    const popupContent = `
      <div class="p-2 text-slate-800 font-sans">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-block px-2 py-0.5 text-xs font-bold text-white rounded ${badgeBg}">
            ${badgeLabel} ${route.number}
          </span>
          <h4 class="font-bold text-sm leading-tight">${route.name}</h4>
        </div>
        <p class="text-xs text-slate-600 mb-1"><strong>Trajet:</strong> ${route.startPoint} → ${route.endPoint}</p>
        <p class="text-xs text-slate-600 mb-2"><strong>Distance:</strong> ${route.lengthKm} km</p>
        <p class="text-xs text-slate-500 leading-relaxed border-t pt-1">${route.description}</p>
      </div>
    `;
    polyline.bindPopup(popupContent, { maxWidth: 300 });

    // Events
    polyline.on('click', () => {
      emit('toggleRoute', route.id);
    });

    polyline.on('mouseover', () => {
      if (!props.selectedRouteIds.includes(route.id)) {
        polyline.setStyle({
          weight: hasSelection ? 4.5 : 5.5,
          opacity: 1,
        });
      }
    });

    polyline.on('mouseout', () => {
      if (!props.selectedRouteIds.includes(route.id)) {
        polyline.setStyle({
          weight: hasSelection ? 2.5 : 4,
          opacity: hasSelection ? 0.3 : 0.8,
        });
      }
    });

    if (isSelected) {
      polyline.bringToFront();
    }

    polylinesMap.set(route.id, { main: polyline, glow: glowPolyline });
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
        padding: [60, 60],
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
  <div class="relative w-full h-full">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full z-0 bg-slate-100"></div>

    <!-- Floating Map Controls -->
    <div class="absolute top-4 right-4 z-[500] flex flex-col gap-2">
      <!-- Guide Button -->
      <button
        @click="emit('openGuide')"
        title="Comment sont numérotées les routes et autoroutes ?"
        class="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-xs text-slate-700 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
      >
        <BookOpen class="w-3.5 h-3.5 text-blue-600" />
        <span>Guide numérotation</span>
      </button>

      <!-- Reset View to Quebec -->
      <button
        @click="resetView"
        title="Vue d'ensemble du Québec"
        class="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-xs text-slate-700 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
      >
        <Maximize2 class="w-3.5 h-3.5" />
        <span>Tout le Québec</span>
      </button>

      <!-- Toggle Tile Layer -->
      <button
        @click="toggleTileLayer"
        title="Changer le style de carte"
        class="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-xs text-slate-700 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
      >
        <Layers class="w-3.5 h-3.5" />
        <span>{{ isSatellite ? 'Vue Voyager' : 'Vue OSM' }}</span>
      </button>
    </div>

    <!-- Map Legend -->
    <div
      class="absolute bottom-6 left-6 z-[500] bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 text-xs space-y-2 pointer-events-auto"
    >
      <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Légende</div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-1.5 rounded-full bg-blue-600 inline-block"></span>
        <span class="text-slate-700 font-medium">Autoroutes (série 1 à 999)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
        <span class="text-slate-700 font-medium">Routes Nationales (série 100+)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-2 rounded-full bg-orange-500 ring-2 ring-amber-400 inline-block"></span>
        <span class="text-slate-700 font-medium">
          {{ selectedRouteIds.length > 0 ? `${selectedRouteIds.length} sélectionnée(s)` : 'Sélectionnez une ou plusieurs routes' }}
        </span>
      </div>
    </div>
  </div>
</template>
