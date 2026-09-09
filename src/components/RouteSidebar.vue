<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  useVueTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  type SortingState,
} from '@tanstack/vue-table';
import type { RouteCategory, RouteInfo } from '../types/route';
import { ROUTE_SECTIONS, type RouteSectionGroup, getRouteTypeInfo } from '../utils/routeSections';

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
}>();

const selectedCategory = ref<'all' | RouteCategory>('all');
const isSectionsExpanded = ref(true);
const globalFilter = ref('');
const sorting = ref<SortingState>([{ id: 'number', desc: false }]);

// Filter by category before table processing
const filteredData = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.routes;
  }
  return props.routes.filter(r => r.category === selectedCategory.value);
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

const visibleRowIds = computed(() => {
  return table.getRowModel().rows.map(r => r.original.id);
});

const isAllVisibleSelected = computed(() => {
  if (visibleRowIds.value.length === 0) return false;
  return visibleRowIds.value.every(id => props.selectedRouteIds.includes(id));
});

function toggleSelectAllVisible() {
  if (isAllVisibleSelected.value) {
    emit('clearSelection');
  } else {
    emit('selectAll', visibleRowIds.value);
  }
}

function toggleSort(columnId: string) {
  const current = sorting.value.find(s => s.id === columnId);
  if (!current) {
    sorting.value = [{ id: columnId, desc: false }];
  } else if (!current.desc) {
    sorting.value = [{ id: columnId, desc: true }];
  } else {
    sorting.value = [];
  }
}

function isSelected(id: string) {
  return props.selectedRouteIds.includes(id);
}

function getSectionCount(section: RouteSectionGroup) {
  return props.routes.filter(section.matcher).length;
}

function isSectionAllSelected(section: RouteSectionGroup) {
  const matching = props.routes.filter(section.matcher);
  if (matching.length === 0) return false;
  return matching.every(r => props.selectedRouteIds.includes(r.id));
}

function selectBySection(section: RouteSectionGroup) {
  const matchingIds = props.routes.filter(section.matcher).map(r => r.id);
  const allSelected = matchingIds.every(id => props.selectedRouteIds.includes(id));

  if (allSelected) {
    const remaining = props.selectedRouteIds.filter(id => !matchingIds.includes(id));
    emit('setSelection', remaining);
  } else {
    const merged = Array.from(new Set([...props.selectedRouteIds, ...matchingIds]));
    emit('setSelection', merged);
  }
}
</script>

<template>
  <aside class="flex flex-col h-full bg-white border-r-[5px] border-black select-none">
    <!-- Controls Section (Card with 3px black bottom border) -->
    <div class="p-4 border-b-[3px] border-black bg-white space-y-3">
      <!-- Search Input -->
      <div>
        <label class="block font-mono text-[11px] font-bold uppercase tracking-[1px] text-black mb-1">
          FILTRER PAR MOT-CLÉ //
        </label>
        <div class="relative">
          <input
            v-model="globalFilter"
            type="text"
            placeholder="RECHERCHER (20, 138, GASPÉ)..."
            class="w-full px-3 py-2 text-sm bg-[#F0F0F0] hover:bg-[#E8E8E8] text-black border-[3px] border-black focus:border-[5px] focus:bg-white focus:outline-none font-mono transition-all placeholder:text-black/40 uppercase"
          />
          <button
            v-if="globalFilter"
            @click="globalFilter = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs hover:text-[#FF0000] px-1 cursor-pointer"
          >
            [X]
          </button>
        </div>
      </div>

      <!-- Category Filter Chips -->
      <div>
        <label class="block font-mono text-[10px] font-bold uppercase tracking-[1px] text-black mb-1">
          CATÉGORIE //
        </label>
        <div class="grid grid-cols-2 gap-1.5 sm:flex sm:gap-1.5">
          <button
            @click="selectedCategory = 'all'"
            :class="[
              'py-1.5 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors',
              selectedCategory === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            TOUTES ({{ routes.length }})
          </button>
          <button
            @click="selectedCategory = 'autoroute'"
            :class="[
              'py-1.5 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors',
              selectedCategory === 'autoroute'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            AUTOROUTES ({{ routes.filter(r => r.category === 'autoroute').length }})
          </button>
          <button
            @click="selectedCategory = 'national'"
            :class="[
              'py-1.5 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors',
              selectedCategory === 'national'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            NATIONALES ({{ routes.filter(r => r.category === 'national').length }})
          </button>
          <button
            @click="selectedCategory = 'regional'"
            :class="[
              'py-1.5 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors',
              selectedCategory === 'regional'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            RÉGIONALES ({{ routes.filter(r => r.category === 'regional').length }})
          </button>
        </div>
      </div>

      <!-- Section Selector (Card) -->
      <div class="border-[3px] border-black p-2.5 bg-[#F0F0F0] space-y-2">
        <div
          @click="isSectionsExpanded = !isSectionsExpanded"
          class="flex items-center justify-between cursor-pointer font-mono text-xs font-bold uppercase tracking-wider text-black hover:underline"
        >
          <span>[+] SÉLECTION PAR NOMENCLATURE</span>
          <span>{{ isSectionsExpanded ? '[-]' : '[+]' }}</span>
        </div>

        <div v-show="isSectionsExpanded" class="pt-1 space-y-2 border-t-2 border-black">
          <!-- Orientation -->
          <div class="space-y-1">
            <div class="text-[9px] font-mono uppercase font-bold text-black/60 tracking-wider">
              ORIENTATION (PARALLELE / PERPENDICULAIRE)
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="sec in ROUTE_SECTIONS.filter(s => s.category === 'orientation')"
                :key="sec.id"
                @click="selectBySection(sec)"
                class="px-2 py-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase text-left transition-colors flex items-center justify-between cursor-pointer"
                :class="[
                  isSectionAllSelected(sec)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                ]"
              >
                <span class="truncate">{{ sec.shortLabel }}</span>
                <span class="ml-1 text-[9px]">{{ getSectionCount(sec) }}</span>
              </button>
            </div>
          </div>

          <!-- Hierarchy -->
          <div class="space-y-1">
            <div class="text-[9px] font-mono uppercase font-bold text-black/60 tracking-wider">
              HIÉRARCHIE MTQ (ROCADES / ANTENNES)
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="sec in ROUTE_SECTIONS.filter(s => s.category === 'hierarchy')"
                :key="sec.id"
                @click="selectBySection(sec)"
                class="px-2 py-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase text-left transition-colors flex items-center justify-between cursor-pointer"
                :class="[
                  isSectionAllSelected(sec)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                ]"
              >
                <span class="truncate">{{ sec.shortLabel }}</span>
                <span class="ml-1 text-[9px]">{{ getSectionCount(sec) }}</span>
              </button>
            </div>
          </div>

          <!-- Geography -->
          <div class="space-y-1">
            <div class="text-[9px] font-mono uppercase font-bold text-black/60 tracking-wider">
              CORRIDOR DU SAINT-LAURENT
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="sec in ROUTE_SECTIONS.filter(s => s.category === 'geography')"
                :key="sec.id"
                @click="selectBySection(sec)"
                class="px-2 py-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase text-left transition-colors flex items-center justify-between cursor-pointer"
                :class="[
                  isSectionAllSelected(sec)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                ]"
              >
                <span class="truncate">{{ sec.shortLabel }}</span>
                <span class="ml-1 text-[9px]">{{ getSectionCount(sec) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Multi-select & Sort Toolbar -->
      <div class="flex items-center justify-between text-xs font-mono pt-1">
        <!-- Master Checkbox Toggle -->
        <button
          @click="toggleSelectAllVisible"
          class="flex items-center gap-2 font-bold uppercase hover:underline cursor-pointer"
        >
          <div
            class="w-5 h-5 border-[3px] border-black flex items-center justify-center font-bold text-xs"
            :class="isAllVisibleSelected ? 'bg-black text-white' : 'bg-white'"
          >
            {{ isAllVisibleSelected ? 'X' : '' }}
          </div>
          <span>{{ isAllVisibleSelected ? 'DÉ-SÉLECTIONNER' : 'TOUT COCHER' }}</span>
        </button>

        <!-- Sort Bar -->
        <div class="flex items-center gap-1">
          <span class="text-[10px] uppercase font-bold text-black/50">TRI :</span>
          <button
            @click="toggleSort('number')"
            class="px-1.5 py-0.5 border border-black uppercase font-bold text-[10px] cursor-pointer"
            :class="{ 'bg-black text-white': sorting[0]?.id === 'number' }"
          >
            N°
          </button>
          <button
            @click="toggleSort('name')"
            class="px-1.5 py-0.5 border border-black uppercase font-bold text-[10px] cursor-pointer"
            :class="{ 'bg-black text-white': sorting[0]?.id === 'name' }"
          >
            NOM
          </button>
          <button
            @click="toggleSort('lengthKm')"
            class="px-1.5 py-0.5 border border-black uppercase font-bold text-[10px] cursor-pointer"
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
      class="px-4 py-2 bg-black text-white border-b-[3px] border-black flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider shrink-0"
    >
      <span>
        {{ selectedRouteIds.length }} SÉLECTIONNÉE{{ selectedRouteIds.length > 1 ? 'S' : '' }}
      </span>
      <button
        @click="emit('clearSelection')"
        class="text-[#FFA500] hover:underline uppercase text-[11px] cursor-pointer"
      >
        [TOUT EFFACER]
      </button>
    </div>

    <!-- Route List -->
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
        :class="[
          'p-3.5 cursor-pointer transition-colors flex items-start gap-3 text-left relative',
          isSelected(row.original.id)
            ? 'bg-black text-white'
            : 'bg-white text-black hover:bg-[#F0F0F0]'
        ]"
      >
        <!-- Checkbox (20px x 20px, 3px border, square) -->
        <div class="shrink-0 pt-0.5">
          <div
            class="w-5 h-5 border-[3px] flex items-center justify-center font-mono font-bold text-xs"
            :class="[
              isSelected(row.original.id)
                ? 'border-white bg-white text-black'
                : 'border-black bg-white text-transparent'
            ]"
          >
            X
          </div>
        </div>

        <!-- Route Square Badge with distinct type color -->
        <div class="shrink-0">
          <div
            class="w-11 h-11 border-[3px] flex flex-col items-center justify-center font-mono font-black transition-colors"
            :style="{
              borderColor: getRouteTypeInfo(row.original).color,
              backgroundColor: isSelected(row.original.id) ? '#FFFFFF' : '#000000',
              color: isSelected(row.original.id) ? getRouteTypeInfo(row.original).color : '#FFFFFF'
            }"
          >
            <span class="text-[9px] uppercase tracking-tighter leading-none">
              {{ row.original.category === 'autoroute' ? 'A' : 'RTE' }}
            </span>
            <span class="text-sm leading-tight font-black">
              {{ row.original.number }}
            </span>
          </div>
        </div>

        <!-- Route Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-0.5">
            <span
              class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 border"
              :style="{
                borderColor: getRouteTypeInfo(row.original).color,
                backgroundColor: isSelected(row.original.id) ? getRouteTypeInfo(row.original).color : 'transparent',
                color: isSelected(row.original.id) ? (getRouteTypeInfo(row.original).badgeText || '#FFFFFF') : getRouteTypeInfo(row.original).color
              }"
            >
              {{ getRouteTypeInfo(row.original).shortLabel }}
            </span>
            <span
              class="shrink-0 text-xs font-mono font-bold border-2 px-1 py-0.2 uppercase"
              :class="isSelected(row.original.id) ? 'border-white bg-white text-black' : 'border-black bg-black text-white'"
            >
              {{ row.original.lengthKm }} KM
            </span>
          </div>

          <div class="flex items-baseline justify-between gap-2">
            <h3
              class="text-sm font-bold tracking-tight truncate uppercase"
              :class="isSelected(row.original.id) ? 'text-white' : 'text-black'"
              style="font-family: var(--font-headline)"
            >
              {{ row.original.name }}
            </h3>
          </div>

          <p
            class="text-xs font-mono uppercase tracking-tight mt-1 truncate"
            :class="isSelected(row.original.id) ? 'text-white/80' : 'text-black/70'"
          >
            {{ row.original.startPoint }} → {{ row.original.endPoint }}
          </p>

          <p
            class="text-[11px] font-mono leading-relaxed mt-1 line-clamp-2"
            :class="isSelected(row.original.id) ? 'text-white/60' : 'text-black/50'"
          >
            {{ row.original.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="p-3 bg-white border-t-[3px] border-black text-xs font-mono font-bold uppercase flex items-center justify-between shrink-0">
      <span>{{ table.getRowModel().rows.length }} AXES AFFICHÉS</span>
      <span class="text-black/60">MTQ // QUÉBEC</span>
    </div>
  </aside>
</template>
