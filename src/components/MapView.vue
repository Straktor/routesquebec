<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import { ArrowRightLeft, Route as RouteIcon, X as XIcon } from 'lucide-vue-next';
import type { RouteInfo } from '../types/route';
import { getRouteTypeInfo, ROUTE_TYPE_STYLES } from '../utils/routeSections';

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
const polylinesMap = new Map<string, L.Polyline>();

const isStreetLayer = ref(false);
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

  setTileLayer(isStreetLayer.value);
  renderRoutes();
}

// Custom TileLayer serving local pre-bundled offline tiles with Esri Light Gray fallback
const LocalFallbackTileLayer = (L.TileLayer as any).extend({
  createTile(coords: L.Coords, done: L.DoneCallback) {
    const tile = document.createElement('img');
    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
    const localUrl = `${baseUrl}/tiles/${coords.z}/${coords.x}/${coords.y}.jpg`;
    const fallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${coords.z}/${coords.y}/${coords.x}`;

    tile.onload = () => done(undefined, tile);
    tile.onerror = () => {
      // If local tile not found (e.g. beyond zoom 8), fallback to online Esri Light Gray
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

function setTileLayer(streetMode: boolean) {
  if (!map) return;

  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  if (streetMode) {
    // Esri World Street Map (rich street-level detail, free, no API key, no rate block)
    currentTileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      }
    );
  } else {
    // Local pre-bundled offline tiles with seamless Esri Canvas fallback
    currentTileLayer = new LocalFallbackTileLayer('', {
      maxZoom: 19,
      attribution: '&copy; Tuiles locales du Québec &amp; Esri Canvas',
    });
  }

  if (currentTileLayer) {
    currentTileLayer.addTo(map);
  }
}

function toggleTileLayer() {
  isStreetLayer.value = !isStreetLayer.value;
  setTileLayer(isStreetLayer.value);
}

function renderRoutes() {
  const currentMap = map;
  if (!currentMap) return;

  // Clear existing polylines
  polylinesMap.forEach(polyline => {
    currentMap.removeLayer(polyline);
  });
  polylinesMap.clear();

  const hasSelection = props.selectedRouteIds.length > 0;

  props.routes.forEach(route => {
    const latLngs = route.coordinates.map(c => L.latLng(c[0], c[1]));
    const isSelected = props.selectedRouteIds.includes(route.id);

    // Polyline styling with distinct MTQ type colors - clean, smaller, pure color (no black casing)
    const typeInfo = getRouteTypeInfo(route);
    const weight = isSelected ? 3.5 : hasSelection ? 1.5 : 2.5;
    const opacity = isSelected ? 1 : hasSelection ? 0.25 : 0.85;

    const polyline = L.polyline(latLngs, {
      color: typeInfo.color,
      weight,
      opacity,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(currentMap);

    // Tooltip: inverted box with route badge and type color
    polyline.bindTooltip(
      `<div class="font-mono text-xs">
        <span style="color: ${typeInfo.color}; font-weight: bold;">[${typeInfo.shortLabel.toUpperCase()}]</span>
        <strong> ${route.name.toUpperCase()}</strong><br/>
        [${route.category === 'autoroute' ? 'A' : 'R'}-${route.number}] // ${route.lengthKm} KM
      </div>`,
      {
        sticky: true,
        direction: 'top',
        className: 'custom-raw-tooltip',
      }
    );

    // Popup: stark box with type color badge
    const popupContent = `
      <div class="p-3 bg-white text-black font-mono border-[3px] border-black">
        <div class="flex items-center gap-2 mb-2 pb-1 border-b-2 border-black">
          <span style="background-color: ${typeInfo.color}; color: ${typeInfo.badgeText};" class="px-2 py-0.5 text-xs font-bold uppercase">
            ${route.category === 'autoroute' ? 'AUTOROUTE' : 'ROUTE'} ${route.number}
          </span>
          <span class="text-xs font-bold">${route.lengthKm} KM</span>
        </div>
        <div class="text-[10px] font-bold uppercase text-black/60 mb-0.5">
          ${typeInfo.label}
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
          weight: hasSelection ? 3 : 3.5,
          opacity: 1,
          color: typeInfo.color,
        });
      }
    });

    polyline.on('mouseout', () => {
      if (!props.selectedRouteIds.includes(route.id)) {
        polyline.setStyle({
          weight: hasSelection ? 1.5 : 2.5,
          opacity: hasSelection ? 0.25 : 0.85,
          color: typeInfo.color,
        });
      }
    });

    if (isSelected) {
      polyline.bringToFront();
    }

    polylinesMap.set(route.id, polyline);
  });
}

function updateHighlight(shouldFitBounds: boolean = true) {
  if (!map) return;

  renderRoutes();

  if (shouldFitBounds && props.selectedRouteIds.length > 0) {
    let combinedBounds: L.LatLngBounds | null = null;

    props.selectedRouteIds.forEach(id => {
      const polyline = polylinesMap.get(id);
      if (polyline) {
        const bounds = polyline.getBounds();
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

const selectedParity = ref<'even' | 'odd' | null>(null);
const selectedTypes = ref<string[]>([]);

interface QuickTypeOption {
  id: string;
  label: string;
  color: string;
}

const QUICK_TYPES: QuickTypeOption[] = [
  { id: 'autoroute', label: 'AUTOROUTES', color: '#0055FF' },
  { id: 'national', label: 'NATIONALES', color: '#00B341' },
  { id: 'regional', label: 'RÉGIONALES', color: '#A822FF' },
  { id: 'bypass', label: 'ROCADES (4xx)', color: '#00C8D7' },
  { id: 'spur', label: 'ANTENNES (5xx+)', color: '#FF8800' },
];

function matchesQuickFilter(r: RouteInfo, parity: 'even' | 'odd' | null, types: string[]): boolean {
  if (parity !== null) {
    const num = parseInt(r.number, 10);
    if (isNaN(num)) return false;
    const isEven = num % 2 === 0;
    if (parity === 'even' && !isEven) return false;
    if (parity === 'odd' && isEven) return false;
  }

  if (types.length > 0) {
    const num = parseInt(r.number, 10);
    const matchesAny = types.some(t => {
      if (t === 'autoroute') return r.category === 'autoroute';
      if (t === 'national') return r.category === 'national' || (num >= 100 && num < 200 && r.category !== 'autoroute');
      if (t === 'regional') return r.category === 'regional' || (num >= 200 && r.category !== 'autoroute');
      if (t === 'bypass') {
        return r.category === 'autoroute' && r.number.length === 3 && (r.number.startsWith('4') || r.number.startsWith('6'));
      }
      if (t === 'spur') {
        return r.category === 'autoroute' && r.number.length === 3 && (r.number.startsWith('5') || r.number.startsWith('7') || r.number.startsWith('9'));
      }
      return false;
    });
    if (!matchesAny) return false;
  }

  return true;
}

function applyQuickFilter() {
  if (selectedParity.value === null && selectedTypes.value.length === 0) {
    emit('clearSelection');
    return;
  }
  const matchingIds = props.routes
    .filter(r => matchesQuickFilter(r, selectedParity.value, selectedTypes.value))
    .map(r => r.id);
  emit('setSelection', matchingIds);
}

function toggleParity(parity: 'even' | 'odd') {
  if (selectedParity.value === parity) {
    selectedParity.value = null;
  } else {
    selectedParity.value = parity;
  }
  applyQuickFilter();
}

function toggleType(typeId: string) {
  if (selectedTypes.value.includes(typeId)) {
    selectedTypes.value = selectedTypes.value.filter(t => t !== typeId);
  } else {
    if (typeId === 'autoroute') {
      selectedTypes.value = selectedTypes.value.filter(t => t !== 'bypass' && t !== 'spur');
    } else if (typeId === 'bypass' || typeId === 'spur') {
      selectedTypes.value = selectedTypes.value.filter(t => t !== 'autoroute');
    }
    selectedTypes.value = [...selectedTypes.value, typeId];
  }
  applyQuickFilter();
}

function clearQuickFilter() {
  selectedParity.value = null;
  selectedTypes.value = [];
  emit('clearSelection');
}

watch(
  () => props.selectedRouteIds,
  (newIds) => {
    if (newIds.length === 0) {
      selectedParity.value = null;
      selectedTypes.value = [];
    }
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

watch(
  () => props.isSidebarOpen,
  () => {
    setTimeout(() => {
      map?.invalidateSize();
    }, 220);
  }
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

    <!-- Floating Quick Type & Parity Selector Bar -->
    <div
      :class="[
        'absolute top-2 left-2 right-2 sm:right-auto sm:top-4 sm:left-4 z-[500] sm:max-w-[calc(100%-240px)] bg-white border-[3px] border-black text-xs font-mono select-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1.5 sm:p-2 space-y-1.5',
        isSidebarOpen ? 'hidden md:block' : 'block'
      ]"
    >
      <!-- Row 1: Parité / Orientation (Pairs vs Impairs) -->
      <div class="flex items-center gap-1.5 overflow-x-auto flex-nowrap pb-0.5">
        <span class="font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0 text-black flex items-center gap-1 pl-0.5">
          <ArrowRightLeft :size="12" class="shrink-0" />
          PARITÉ :
        </span>

        <button
          @click="toggleParity('even')"
          class="px-2 py-1 border-2 border-black uppercase text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors shrink-0 cursor-pointer flex items-center gap-1"
          :class="[
            selectedParity === 'even'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          ]"
        >
          <span>PAIRS (EST-OUEST)</span>
        </button>

        <button
          @click="toggleParity('odd')"
          class="px-2 py-1 border-2 border-black uppercase text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors shrink-0 cursor-pointer flex items-center gap-1"
          :class="[
            selectedParity === 'odd'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          ]"
        >
          <span>IMPAIRS (NORD-SUD)</span>
        </button>

        <!-- Divider & Clear button / Selected counter -->
        <div
          v-if="selectedRouteIds.length > 0 || selectedParity !== null || selectedTypes.length > 0"
          class="flex items-center gap-1.5 shrink-0 ml-auto pl-2 border-l-2 border-black/20"
        >
          <span class="px-1.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold">
            {{ selectedRouteIds.length }} AXES
          </span>
          <button
            @click="clearQuickFilter"
            class="px-1.5 py-0.5 border border-black hover:bg-[#CC0000] hover:text-white text-[#CC0000] font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
            title="Réinitialiser la sélection"
          >
            <XIcon :size="10" />
            <span>EFFACER</span>
          </button>
        </div>
      </div>

      <!-- Row 2: Types de routes -->
      <div class="flex items-center gap-1.5 overflow-x-auto flex-nowrap pt-1.5 border-t border-black/15">
        <span class="font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0 text-black flex items-center gap-1 pl-0.5">
          <RouteIcon :size="12" class="shrink-0" />
          TYPES :
        </span>

        <button
          v-for="t in QUICK_TYPES"
          :key="t.id"
          @click="toggleType(t.id)"
          class="px-2 py-1 border-2 border-black uppercase text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          :class="[
            selectedTypes.includes(t.id)
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          ]"
        >
          <span
            class="w-2 h-2 rounded-none border border-black inline-block shrink-0"
            :style="{ backgroundColor: t.color }"
          ></span>
          <span>{{ t.label }}</span>
        </button>
      </div>
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
        {{ isStreetLayer ? 'VUE : RUES' : 'VUE : ÉPURÉE' }}
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
        {{ isLegendOpen ? '[FERMER LÉGENDE]' : '[LÉGENDE COULEURS]' }}
      </button>

      <!-- Legend Body -->
      <div
        :class="[
          'bg-white border-[3px] border-black p-2.5 sm:p-3 text-[11px] sm:text-xs font-mono space-y-1.5',
          isLegendOpen ? 'block' : 'hidden sm:block'
        ]"
      >
        <div class="font-bold uppercase tracking-wider border-b-2 border-black pb-1 flex items-center justify-between gap-3">
          <span>LÉGENDE // TYPES MTQ</span>
          <span v-if="selectedRouteIds.length > 0" class="text-[10px] bg-black text-white px-1.5 py-0.2 shrink-0">
            {{ selectedRouteIds.length }} / {{ routes.length }}
          </span>
        </div>
        <div v-for="st in ROUTE_TYPE_STYLES" :key="st.type" class="flex items-center gap-2">
          <span
            class="w-4 h-2.5 border border-black inline-block shrink-0"
            :style="{ backgroundColor: st.color }"
          ></span>
          <span class="uppercase text-[10px] sm:text-[11px] font-bold">{{ st.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
