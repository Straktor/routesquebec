<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  useVueTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  type SortingState,
} from '@tanstack/vue-table';
import {
  ArrowRightLeft,
  ArrowUpDown,
  Zap,
} from 'lucide-vue-next';
import type { RouteInfo } from '../types/route';
import { getRouteTypeInfo } from '../utils/routeSections';

const props = defineProps<{
  routes: RouteInfo[];
  selectedRouteIds: string[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleRoute', id: string): void;
  (e: 'selectAll', ids: string[]): void;
  (e: 'clearSelection'): void;
  (e: 'setSelection', ids: string[]): void;
  (e: 'close'): void;
}>();

// Route Explorer & Quick Selector state
const selectedParity = ref<'even' | 'odd' | null>(null);
const selectedTypes = ref<string[]>([]);
const globalFilter = ref('');
const sorting = ref<SortingState>([{ id: 'number', desc: false }]);

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

// Reset when selection cleared from external action (e.g. Navbar or map reset)
watch(
  () => props.selectedRouteIds,
  (newIds) => {
    if (newIds.length === 0) {
      selectedParity.value = null;
      selectedTypes.value = [];
    }
  }
);

// Filter table data by quick filter
const filteredData = computed(() => {
  if (selectedParity.value === null && selectedTypes.value.length === 0) {
    return props.routes;
  }
  return props.routes.filter(r => matchesQuickFilter(r, selectedParity.value, selectedTypes.value));
});

const columnHelper = createColumnHelper<RouteInfo>();

const columns = [
  columnHelper.accessor('number', {
    id: 'number',
    header: 'N°',
    sortingFn: (rowA, rowB) => {
      const numA = parseInt(rowA.original.number, 10);
      const numB = parseInt(rowB.original.number, 10);
      return numA - numB;
    },
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: 'Nom',
  }),
  columnHelper.accessor('lengthKm', {
    id: 'lengthKm',
    header: 'Distance',
  }),
];

// TanStack Table setup
const table = useVueTable({
  get data() {
    return filteredData.value;
  },
  columns,
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get globalFilter() {
      return globalFilter.value;
    },
    get sorting() {
      return sorting.value;
    },
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value =
      typeof updater === 'function' ? updater(globalFilter.value) : updater;
  },
  onSortingChange: (updater) => {
    sorting.value =
      typeof updater === 'function' ? updater(sorting.value) : updater;
  },
  globalFilterFn: (row, _columnId, filterValue: string) => {
    if (!filterValue) return true;
    const search = filterValue.toLowerCase().trim();
    const item = row.original;
    return (
      item.number.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search) ||
      item.startPoint.toLowerCase().includes(search) ||
      item.endPoint.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    );
  },
});

function isSelected(id: string) {
  return props.selectedRouteIds.includes(id);
}

function getRouteTooltip(route: RouteInfo): string {
  const type = getRouteTypeInfo(route);
  const prefix = route.category === 'autoroute' ? 'A' : 'R';
  const endpoints = route.startPoint && route.endPoint ? `\nTrajet : ${route.startPoint} → ${route.endPoint}` : '';
  const desc = route.description ? `\nNote : ${route.description}` : '';
  return `${prefix}-${route.number} : ${route.name.toUpperCase()} (${route.lengthKm} km)\nClassification : ${type.label}${endpoints}${desc}`;
}

const visibleRouteIds = computed(() => {
  return table.getRowModel().rows.map(row => row.original.id);
});

const isAllVisibleSelected = computed(() => {
  if (visibleRouteIds.value.length === 0) return false;
  return visibleRouteIds.value.every(id => props.selectedRouteIds.includes(id));
});

function toggleSelectAllVisible() {
  if (isAllVisibleSelected.value) {
    const toRemove = new Set(visibleRouteIds.value);
    const remaining = props.selectedRouteIds.filter(id => !toRemove.has(id));
    emit('setSelection', remaining);
  } else {
    emit('selectAll', visibleRouteIds.value);
  }
}

function toggleSort(columnId: string) {
  const current = sorting.value[0];
  if (current && current.id === columnId) {
    sorting.value = [{ id: columnId, desc: !current.desc }];
  } else {
    sorting.value = [{ id: columnId, desc: false }];
  }
}

</script>

<template>
  <aside class="flex h-full bg-white border-r-[5px] border-black select-none overflow-hidden">
    <!-- MAIN SIDEBAR CONTENT PANEL -->
    <div class="flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
      <!-- Mobile Header Bar: Title & Close Action -->
      <div class="md:hidden h-10 bg-[#EFEFEF] border-b-[3px] border-black flex items-center justify-between px-3 shrink-0 font-mono text-xs font-bold">
        <span class="uppercase tracking-wider flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 bg-black"></span>
          ROUTES ({{ table.getRowModel().rows.length }}/{{ routes.length }})
        </span>
        <button
          @click="emit('close')"
          class="px-2 py-1 bg-black hover:bg-black/80 text-white font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-black"
        >
          [X CARTE]
        </button>
      </div>

      <!-- ROUTES EXPLORER -->
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Quick Selector Box in Left Panel -->
        <div class="p-3.5 bg-[#F7F7F7] border-b-[3px] border-black space-y-2.5 shrink-0">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] font-black uppercase tracking-[1px] text-black flex items-center gap-1.5">
              <Zap :size="13" class="text-black" />
              SÉLECTION RAPIDE //
            </span>
            <div
              v-if="selectedRouteIds.length > 0 || selectedParity !== null || selectedTypes.length > 0"
              class="flex items-center gap-1.5"
            >
              <span class="px-1.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold">
                {{ selectedRouteIds.length }} SÉLECTIONNÉS
              </span>
              <button
                @click="clearQuickFilter"
                class="px-1.5 py-0.5 border border-black hover:bg-[#CC0000] hover:text-white text-[#CC0000] font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                title="Désélectionner tout"
              >
                <X :size="10" />
                <span>EFFACER</span>
              </button>
            </div>
          </div>

          <!-- 1. Parité / Orientation -->
          <div>
            <div class="flex items-center justify-between mb-1 font-mono text-[9px] font-bold uppercase text-black/60">
              <span>1. PARITÉ (ORIENTATION) //</span>
              <span v-if="selectedParity" class="text-black font-black">
                [{{ selectedParity === 'even' ? 'PAIRS ACTIF' : 'IMPAIRS ACTIF' }}]
              </span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                @click="toggleParity('even')"
                class="py-1.5 px-2 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                :class="[
                  selectedParity === 'even'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                ]"
              >
                <ArrowRightLeft :size="12" />
                <span>PAIRS (EST-OUEST)</span>
              </button>
              <button
                @click="toggleParity('odd')"
                class="py-1.5 px-2 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                :class="[
                  selectedParity === 'odd'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                ]"
              >
                <ArrowUpDown :size="12" />
                <span>IMPAIRS (NORD-SUD)</span>
              </button>
            </div>
          </div>

          <!-- 2. Types de routes -->
          <div>
            <div class="flex items-center justify-between mb-1 font-mono text-[9px] font-bold uppercase text-black/60">
              <span>2. TYPES DE ROUTES //</span>
              <span v-if="selectedTypes.length > 0" class="text-black font-black">
                [{{ selectedTypes.length }} TYPE(S) ACTIF(S)]
              </span>
            </div>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="t in QUICK_TYPES"
                :key="t.id"
                @click="toggleType(t.id)"
                class="py-1.5 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-tight transition-colors cursor-pointer flex items-center justify-center gap-1.5 truncate"
                :class="[
                  selectedTypes.includes(t.id)
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                ]"
              >
                <span
                  class="w-2 h-2 border border-black shrink-0 inline-block"
                  :style="{ backgroundColor: t.color }"
                ></span>
                <span class="truncate">{{ t.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Search Input & Toolbar Header -->
        <div class="p-3 border-b-[3px] border-black bg-white space-y-2 shrink-0">
          <!-- Search Input -->
          <div>
            <label class="block font-mono text-[9px] font-bold uppercase tracking-[1px] text-black/60 mb-1">
              RECHERCHER PAR N° OU VILLE //
            </label>
            <div class="relative">
              <input
                v-model="globalFilter"
                type="text"
                placeholder="20, 138, GASPÉ, LAURENTIDES..."
                class="w-full px-3 py-1.5 text-xs bg-[#F0F0F0] hover:bg-[#E8E8E8] text-black border-[2px] border-black focus:border-[3px] focus:bg-white focus:outline-none font-mono transition-all placeholder:text-black/40 uppercase"
              />
              <button
                v-if="globalFilter"
                @click="globalFilter = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 font-mono font-bold text-xs hover:text-[#FF0000] px-1 cursor-pointer"
              >
                [X]
              </button>
            </div>
          </div>

          <!-- Multi-select & Sort Toolbar -->
          <div class="flex items-center justify-between text-xs font-mono pt-0.5">
            <button
              @click="toggleSelectAllVisible"
              class="flex items-center gap-1.5 font-bold uppercase hover:underline cursor-pointer"
            >
              <div
                class="w-4 h-4 border-[2px] border-black flex items-center justify-center font-bold text-[10px]"
                :class="isAllVisibleSelected ? 'bg-black text-white' : 'bg-white'"
              >
                {{ isAllVisibleSelected ? 'X' : '' }}
              </div>
              <span class="text-[11px]">{{ isAllVisibleSelected ? 'DÉ-SÉLECTIONNER' : 'TOUT COCHER' }}</span>
            </button>

            <!-- Sort Bar -->
            <div class="flex items-center gap-1">
              <span class="text-[9px] uppercase font-bold text-black/50">TRI:</span>
              <button
                @click="toggleSort('number')"
                class="px-1 py-0.2 border border-black uppercase font-bold text-[9px] cursor-pointer"
                :class="{ 'bg-black text-white': sorting[0]?.id === 'number' }"
              >
                N°
              </button>
              <button
                @click="toggleSort('name')"
                class="px-1 py-0.2 border border-black uppercase font-bold text-[9px] cursor-pointer"
                :class="{ 'bg-black text-white': sorting[0]?.id === 'name' }"
              >
                NOM
              </button>
              <button
                @click="toggleSort('lengthKm')"
                class="px-1 py-0.2 border border-black uppercase font-bold text-[9px] cursor-pointer"
                :class="{ 'bg-black text-white': sorting[0]?.id === 'lengthKm' }"
              >
                KM
              </button>
            </div>
          </div>
        </div>

        <!-- Active Multi-Selection Banner -->
        <div
          v-if="selectedRouteIds.length > 0"
          class="px-3.5 py-1.5 bg-black text-white border-b-[3px] border-black flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider shrink-0"
        >
          <span>
            {{ selectedRouteIds.length }} SÉLECTIONNÉE{{ selectedRouteIds.length > 1 ? 'S' : '' }}
          </span>
          <button
            @click="emit('clearSelection')"
            class="text-[#FFA500] hover:underline uppercase text-[10px] cursor-pointer"
          >
            [TOUT EFFACER]
          </button>
        </div>

        <!-- Route List Table -->
        <div class="flex-1 overflow-y-auto divide-y-[3px] divide-black">
          <div
            v-if="isLoading"
            class="p-8 text-center text-sm font-mono uppercase"
          >
            CHARGEMENT DU RÉSEAU...
          </div>

          <div
            v-else-if="table.getRowModel().rows.length === 0"
            class="p-8 text-center text-sm font-mono uppercase text-black/60"
          >
            AUCUNE ROUTE CORRESPONDANTE.
          </div>

          <div
            v-else
            v-for="row in table.getRowModel().rows"
            :key="row.original.id"
            @click="emit('toggleRoute', row.original.id)"
            :title="getRouteTooltip(row.original)"
            :class="[
              'px-3 py-1.5 cursor-pointer transition-colors flex items-center gap-2.5 text-left border-b-[2px] border-black',
              isSelected(row.original.id)
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F5F5F5]'
            ]"
          >
            <!-- Checkbox -->
            <div class="shrink-0">
              <div
                class="w-4 h-4 border-[2px] flex items-center justify-center font-mono font-bold text-[10px]"
                :class="[
                  isSelected(row.original.id)
                    ? 'border-white bg-white text-black'
                    : 'border-black bg-white text-transparent'
                ]"
              >
                X
              </div>
            </div>

            <!-- Route Compact Badge -->
            <div class="shrink-0">
              <div
                class="min-w-[46px] px-1.5 py-0.5 border-[2px] flex items-center justify-center font-mono font-black text-xs transition-colors"
                :style="{
                  borderColor: getRouteTypeInfo(row.original).color,
                  backgroundColor: isSelected(row.original.id) ? '#FFFFFF' : '#000000',
                  color: isSelected(row.original.id) ? getRouteTypeInfo(row.original).color : '#FFFFFF'
                }"
              >
                {{ row.original.category === 'autoroute' ? 'A' : 'R' }}-{{ row.original.number }}
              </div>
            </div>

            <!-- Route Details -->
            <div class="flex-1 min-w-0 pr-1">
              <h3
                class="text-xs font-bold tracking-tight truncate uppercase leading-tight"
                :class="isSelected(row.original.id) ? 'text-white' : 'text-black'"
                style="font-family: var(--font-headline)"
              >
                {{ row.original.name }}
              </h3>
            </div>

            <!-- Distance -->
            <div class="shrink-0 flex items-center">
              <span
                class="text-[10px] font-mono font-bold border px-1 uppercase whitespace-nowrap"
                :class="isSelected(row.original.id) ? 'border-white bg-white text-black' : 'border-black bg-black text-white'"
              >
                {{ row.original.lengthKm }} KM
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Stats -->
        <div class="p-2.5 bg-white border-t-[3px] border-black text-[11px] font-mono font-bold uppercase flex items-center justify-between shrink-0">
          <span>{{ table.getRowModel().rows.length }} AXES AFFICHÉS</span>
          <span class="text-black/60">MTQ // QUÉBEC</span>
        </div>
      </div>
    </div>
  </aside>
</template>
