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
import {
  Search,
  ArrowUpDown,
  X,
  MapPin,
  Route as RouteIcon,
  Check,
  CheckSquare,
  Square,
} from '@lucide/vue';
import type { RouteCategory, RouteInfo } from '../types/route';

const props = defineProps<{
  routes: RouteInfo[];
  selectedRouteIds: string[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleRoute', id: string): void;
  (e: 'selectAll', ids: string[]): void;
  (e: 'clearSelection'): void;
}>();

const selectedCategory = ref<'all' | RouteCategory>('all');
const globalFilter = ref('');
const sorting = ref<SortingState>([{ id: 'number', desc: false }]);

// Filter by category before table processing
const filteredByCategory = computed(() => {
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
    return filteredByCategory.value;
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
</script>

<template>
  <aside class="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm select-none">
    <!-- Search & Filter Controls -->
    <div class="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
      <!-- Search Input -->
      <div class="relative">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="globalFilter"
          type="text"
          placeholder="Rechercher une route (ex: 20, 138, Gaspé)..."
          class="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
        <button
          v-if="globalFilter"
          @click="globalFilter = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          title="Effacer la recherche"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg text-xs font-medium">
        <button
          @click="selectedCategory = 'all'"
          :class="[
            'flex-1 py-1.5 px-2 rounded-md transition-all text-center',
            selectedCategory === 'all'
              ? 'bg-white text-slate-800 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          Toutes ({{ routes.length }})
        </button>
        <button
          @click="selectedCategory = 'autoroute'"
          :class="[
            'flex-1 py-1.5 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1',
            selectedCategory === 'autoroute'
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-blue-700'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-blue-400"></span>
          Autoroutes
        </button>
        <button
          @click="selectedCategory = 'national'"
          :class="[
            'flex-1 py-1.5 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1',
            selectedCategory === 'national'
              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-emerald-700'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          Routes
        </button>
      </div>

      <!-- Multi-select & Sort Toolbar -->
      <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
        <!-- Master Checkbox Toggle -->
        <button
          @click="toggleSelectAllVisible"
          class="flex items-center gap-1.5 font-medium hover:text-blue-600 transition-colors py-0.5"
          :title="isAllVisibleSelected ? 'Tout désélectionner' : 'Sélectionner toutes les routes visibles'"
        >
          <CheckSquare v-if="isAllVisibleSelected" class="w-4 h-4 text-blue-600" />
          <Square v-else class="w-4 h-4 text-slate-400" />
          <span>{{ isAllVisibleSelected ? 'Désélectionner' : 'Tout sélectionner' }}</span>
        </button>

        <!-- Sort Bar -->
        <div class="flex items-center gap-1">
          <button
            @click="toggleSort('number')"
            class="px-2 py-1 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
            :class="{ 'font-semibold text-blue-600 bg-blue-50': sorting[0]?.id === 'number' }"
            title="Trier par numéro"
          >
            N°
            <ArrowUpDown class="w-3 h-3" />
          </button>
          <button
            @click="toggleSort('name')"
            class="px-2 py-1 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
            :class="{ 'font-semibold text-blue-600 bg-blue-50': sorting[0]?.id === 'name' }"
            title="Trier par nom"
          >
            Nom
            <ArrowUpDown class="w-3 h-3" />
          </button>
          <button
            @click="toggleSort('lengthKm')"
            class="px-2 py-1 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
            :class="{ 'font-semibold text-blue-600 bg-blue-50': sorting[0]?.id === 'lengthKm' }"
            title="Trier par distance"
          >
            Distance
            <ArrowUpDown class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Active Multi-Selection Banner -->
    <div
      v-if="selectedRouteIds.length > 0"
      class="px-4 py-2 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between text-xs text-amber-900"
    >
      <div class="flex items-center gap-1.5 font-medium">
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>
          <strong>{{ selectedRouteIds.length }}</strong>
          {{ selectedRouteIds.length > 1 ? 'routes sélectionnées' : 'route sélectionnée' }}
        </span>
      </div>
      <button
        @click="emit('clearSelection')"
        class="text-amber-700 hover:text-amber-900 underline font-semibold flex items-center gap-1"
      >
        <X class="w-3.5 h-3.5" />
        Désélectionner tout
      </button>
    </div>

    <!-- Route List (Powered by TanStack Table rows) -->
    <div class="flex-1 overflow-y-auto divide-y divide-slate-100">
      <div
        v-if="isLoading"
        class="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2"
      >
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Chargement des routes du Québec...
      </div>

      <div
        v-else-if="table.getRowModel().rows.length === 0"
        class="p-8 text-center text-sm text-slate-500"
      >
        <RouteIcon class="w-8 h-8 mx-auto text-slate-300 mb-2" />
        Aucune route ne correspond à votre recherche.
      </div>

      <div
        v-else
        v-for="row in table.getRowModel().rows"
        :key="row.original.id"
        @click="emit('toggleRoute', row.original.id)"
        :class="[
          'p-3.5 cursor-pointer transition-all flex items-start gap-3 text-left relative group',
          isSelected(row.original.id)
            ? 'bg-amber-50/80 border-l-4 border-l-orange-500 shadow-xs'
            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
        ]"
      >
        <!-- Checkbox Indicator -->
        <div class="shrink-0 pt-2.5">
          <div
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
            :class="isSelected(row.original.id) ? 'bg-orange-500 border-orange-600 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'"
          >
            <Check v-if="isSelected(row.original.id)" class="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        <!-- Route Shield Badge -->
        <div class="shrink-0 pt-0.5">
          <!-- Autoroute Shield (Quebec Blue) -->
          <div
            v-if="row.original.category === 'autoroute'"
            class="w-11 h-11 rounded-md bg-blue-600 text-white flex flex-col items-center justify-center shadow-xs border-2 border-white ring-1 ring-blue-700"
          >
            <span class="text-[9px] font-extrabold uppercase tracking-tighter leading-none text-blue-100">A</span>
            <span class="text-sm font-black leading-tight">{{ row.original.number }}</span>
          </div>

          <!-- Route Shield (Quebec Green) -->
          <div
            v-else
            class="w-11 h-11 rounded-lg bg-emerald-600 text-white flex flex-col items-center justify-center shadow-xs border-2 border-white ring-1 ring-emerald-700"
          >
            <span class="text-[9px] font-extrabold uppercase tracking-tighter leading-none text-emerald-100">RTE</span>
            <span class="text-sm font-black leading-tight">{{ row.original.number }}</span>
          </div>
        </div>

        <!-- Route Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <h3
              class="text-sm font-semibold truncate"
              :class="isSelected(row.original.id) ? 'text-amber-950 font-bold' : 'text-slate-800'"
            >
              {{ row.original.name }}
            </h3>
            <span class="shrink-0 text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {{ row.original.lengthKm }} km
            </span>
          </div>

          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
            <MapPin class="w-3 h-3 text-slate-400 shrink-0" />
            <span class="truncate">{{ row.original.startPoint }} → {{ row.original.endPoint }}</span>
          </p>

          <p class="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {{ row.original.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
      <span>{{ table.getRowModel().rows.length }} routes affichées</span>
      <span class="text-slate-400">TanStack Table v8</span>
    </div>
  </aside>
</template>
