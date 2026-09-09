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
  Route as RouteIcon,
  FolderTree,
  BookOpen,
  ArrowRightLeft,
  ArrowUpDown,
  Compass,
  RefreshCw,
  GitFork,
  Navigation,
  MapPin,
  Check,
  X
} from 'lucide-vue-next';
import type { RouteCategory, RouteInfo } from '../types/route';
import { ROUTE_SECTIONS, type RouteSectionGroup, getRouteTypeInfo } from '../utils/routeSections';

const props = withDefaults(
  defineProps<{
    routes: RouteInfo[];
    selectedRouteIds: string[];
    isLoading?: boolean;
    activeTab?: 'routes' | 'nomenclature';
  }>(),
  {
    activeTab: 'routes',
  }
);

const emit = defineEmits<{
  (e: 'toggleRoute', id: string): void;
  (e: 'selectAll', ids: string[]): void;
  (e: 'clearSelection'): void;
  (e: 'setSelection', ids: string[]): void;
  (e: 'openGuide'): void;
  (e: 'update:activeTab', tab: 'routes' | 'nomenclature'): void;
  (e: 'close'): void;
}>();

// Tab state: 'routes' (Explorer) vs 'nomenclature' (Groups)
const activeTab = computed({
  get: () => props.activeTab,
  set: (val: 'routes' | 'nomenclature') => emit('update:activeTab', val),
});

// Tab 1: Route Explorer state
const selectedCategory = ref<'all' | RouteCategory>('all');
const globalFilter = ref('');
const sorting = ref<SortingState>([{ id: 'number', desc: false }]);

// Tab 2: Nomenclature state
const nomenclatureFilter = ref('');

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

function isSelected(id: string) {
  return props.selectedRouteIds.includes(id);
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

// Nomenclature helper functions
function getSectionRoutes(section: RouteSectionGroup): RouteInfo[] {
  return props.routes.filter(section.matcher);
}

function getSectionCount(section: RouteSectionGroup): number {
  return getSectionRoutes(section).length;
}

function getSectionSelectedCount(section: RouteSectionGroup): number {
  return getSectionRoutes(section).filter(r => isSelected(r.id)).length;
}

function isSectionAllSelected(section: RouteSectionGroup): boolean {
  const matching = getSectionRoutes(section);
  if (matching.length === 0) return false;
  return matching.every(r => isSelected(r.id));
}

function selectBySection(section: RouteSectionGroup) {
  const matchingIds = getSectionRoutes(section).map(r => r.id);
  if (matchingIds.length === 0) return;

  if (isSectionAllSelected(section)) {
    const removeSet = new Set(matchingIds);
    const remaining = props.selectedRouteIds.filter(id => !removeSet.has(id));
    emit('setSelection', remaining);
  } else {
    const merged = Array.from(new Set([...props.selectedRouteIds, ...matchingIds]));
    emit('setSelection', merged);
  }
}

// Filtered sections for Tab 2
const filteredSections = computed(() => {
  if (!nomenclatureFilter.value) return ROUTE_SECTIONS;
  const q = nomenclatureFilter.value.toLowerCase().trim();
  return ROUTE_SECTIONS.filter(s =>
    s.label.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.shortLabel.toLowerCase().includes(q)
  );
});

// Icon component mapper for sections
function getSectionIcon(iconName: string) {
  switch (iconName) {
    case 'ArrowRightLeft': return ArrowRightLeft;
    case 'ArrowUpDown': return ArrowUpDown;
    case 'Route': return RouteIcon;
    case 'RefreshCw': return RefreshCw;
    case 'GitFork': return GitFork;
    case 'Compass': return Compass;
    case 'Navigation': return Navigation;
    default: return MapPin;
  }
}
</script>

<template>
  <aside class="flex h-full bg-white border-r-[5px] border-black select-none overflow-hidden">
    <!-- VS CODE ACTIVITY BAR (Desktop only: vertical strip on the left) -->
    <div class="hidden md:flex w-[52px] bg-[#181818] text-[#CCCCCC] flex-col items-center justify-between py-2 border-r-[3px] border-black shrink-0 z-10">
      <!-- Top View Tabs -->
      <div class="flex flex-col w-full items-center gap-1">
        <!-- Tab 1: Routes Explorer -->
        <button
          @click="activeTab = 'routes'"
          title="Explorateur de routes"
          :class="[
            'w-full h-13 flex flex-col items-center justify-center relative transition-colors cursor-pointer group',
            activeTab === 'routes'
              ? 'text-white border-l-[3px] border-white bg-[#252526]'
              : 'text-[#888888] hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
          ]"
        >
          <RouteIcon :size="20" />
          <span class="text-[8px] font-mono font-bold mt-1 tracking-tighter">ROUTES</span>
          <!-- Active Count Badge -->
          <span
            v-if="selectedRouteIds.length > 0"
            class="absolute top-1 right-1 px-1 py-0.2 bg-[#0055FF] text-white font-mono text-[8px] font-bold border border-black"
          >
            {{ selectedRouteIds.length }}
          </span>
        </button>

        <!-- Tab 2: Nomenclature / Groups -->
        <button
          @click="activeTab = 'nomenclature'"
          title="Nomenclature & Groupes MTQ"
          :class="[
            'w-full h-13 flex flex-col items-center justify-center relative transition-colors cursor-pointer group',
            activeTab === 'nomenclature'
              ? 'text-white border-l-[3px] border-white bg-[#252526]'
              : 'text-[#888888] hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
          ]"
        >
          <FolderTree :size="20" />
          <span class="text-[8px] font-mono font-bold mt-1 tracking-tighter">GROUPES</span>
          <span
            class="absolute top-1 right-1 px-1 py-0.2 bg-[#A822FF] text-white font-mono text-[8px] font-bold border border-black"
          >
            {{ ROUTE_SECTIONS.length }}
          </span>
        </button>
      </div>

      <!-- Bottom Actions: MTQ Guide -->
      <div class="flex flex-col w-full items-center">
        <button
          @click="emit('openGuide')"
          title="Guide officiel MTQ"
          class="w-full h-12 flex flex-col items-center justify-center text-[#888888] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <BookOpen :size="18" />
          <span class="text-[8px] font-mono font-bold mt-0.5 tracking-tighter">GUIDE</span>
        </button>
      </div>
    </div>

    <!-- MAIN SIDEBAR CONTENT PANEL -->
    <div class="flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
      <!-- Top Tab Header Bar -->
      <div class="h-10 bg-[#EFEFEF] border-b-[3px] border-black flex items-center justify-between px-3 shrink-0">
        <!-- Desktop: VS Code style tab headers -->
        <div class="hidden md:flex items-center gap-1 font-mono text-[11px] font-bold tracking-wider">
          <button
            @click="activeTab = 'routes'"
            :class="[
              'px-2.5 py-1 uppercase transition-colors cursor-pointer border-[2px]',
              activeTab === 'routes'
                ? 'bg-black text-white border-black'
                : 'bg-transparent text-black border-transparent hover:border-black/30'
            ]"
          >
            ROUTES ({{ routes.length }})
          </button>
          <button
            @click="activeTab = 'nomenclature'"
            :class="[
              'px-2.5 py-1 uppercase transition-colors cursor-pointer border-[2px]',
              activeTab === 'nomenclature'
                ? 'bg-black text-white border-black'
                : 'bg-transparent text-black border-transparent hover:border-black/30'
            ]"
          >
            GROUPES MTQ ({{ ROUTE_SECTIONS.length }})
          </button>
        </div>

        <!-- Mobile: Native App View Title & Close Action -->
        <div class="md:hidden flex items-center justify-between w-full font-mono text-xs font-bold">
          <span class="uppercase tracking-wider flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 bg-black"></span>
            {{ activeTab === 'routes' ? `ROUTES (${table.getRowModel().rows.length}/${routes.length})` : `GROUPES MTQ (${ROUTE_SECTIONS.length})` }}
          </span>
          <button
            @click="emit('close')"
            class="px-2 py-1 bg-black hover:bg-black/80 text-white font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-black"
          >
            [X CARTE]
          </button>
        </div>

        <span class="text-[10px] font-mono font-bold text-black/50 hidden md:inline uppercase">
          {{ activeTab === 'routes' ? `${table.getRowModel().rows.length} AFFICHÉES` : '3 FAMILLES' }}
        </span>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 1: ROUTES EXPLORER                                            -->
      <!-- ================================================================= -->
      <div v-show="activeTab === 'routes'" class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Search & Filter Header -->
        <div class="p-3.5 border-b-[3px] border-black bg-white space-y-2.5 shrink-0">
          <!-- Search Input -->
          <div>
            <label class="block font-mono text-[10px] font-bold uppercase tracking-[1px] text-black mb-1">
              RECHERCHER //
            </label>
            <div class="relative">
              <input
                v-model="globalFilter"
                type="text"
                placeholder="N° OU VILLE (20, 138, GASPÉ)..."
                class="w-full px-3 py-2 text-sm bg-[#F0F0F0] hover:bg-[#E8E8E8] text-black border-[3px] border-black focus:border-[4px] focus:bg-white focus:outline-none font-mono transition-all placeholder:text-black/40 uppercase"
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
            <div class="grid grid-cols-2 gap-1.5 sm:flex sm:gap-1.5">
              <button
                @click="selectedCategory = 'all'"
                :class="[
                  'py-1 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors truncate',
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
                  'py-1 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors truncate',
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
                  'py-1 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors truncate',
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
                  'py-1 px-1.5 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-center cursor-pointer transition-colors truncate',
                  selectedCategory === 'regional'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                ]"
              >
                RÉGIONALES ({{ routes.filter(r => r.category === 'regional').length }})
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
            :class="[
              'p-3 cursor-pointer transition-colors flex items-start gap-2.5 text-left relative',
              isSelected(row.original.id)
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F5F5F5]'
            ]"
          >
            <!-- Checkbox -->
            <div class="shrink-0 pt-0.5">
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

            <!-- Route Square Badge -->
            <div class="shrink-0">
              <div
                class="w-10 h-10 border-[2px] flex flex-col items-center justify-center font-mono font-black transition-colors"
                :style="{
                  borderColor: getRouteTypeInfo(row.original).color,
                  backgroundColor: isSelected(row.original.id) ? '#FFFFFF' : '#000000',
                  color: isSelected(row.original.id) ? getRouteTypeInfo(row.original).color : '#FFFFFF'
                }"
              >
                <span class="text-[8px] uppercase tracking-tighter leading-none">
                  {{ row.original.category === 'autoroute' ? 'A' : 'RTE' }}
                </span>
                <span class="text-xs leading-tight font-black">
                  {{ row.original.number }}
                </span>
              </div>
            </div>

            <!-- Route Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <span
                  class="text-[8px] font-mono font-bold uppercase px-1 py-0.2 border"
                  :style="{
                    borderColor: getRouteTypeInfo(row.original).color,
                    backgroundColor: isSelected(row.original.id) ? getRouteTypeInfo(row.original).color : 'transparent',
                    color: isSelected(row.original.id) ? (getRouteTypeInfo(row.original).badgeText || '#FFFFFF') : getRouteTypeInfo(row.original).color
                  }"
                >
                  {{ getRouteTypeInfo(row.original).shortLabel }}
                </span>
                <span
                  class="shrink-0 text-[10px] font-mono font-bold border px-1 uppercase"
                  :class="isSelected(row.original.id) ? 'border-white bg-white text-black' : 'border-black bg-black text-white'"
                >
                  {{ row.original.lengthKm }} KM
                </span>
              </div>

              <h3
                class="text-xs font-bold tracking-tight truncate uppercase"
                :class="isSelected(row.original.id) ? 'text-white' : 'text-black'"
                style="font-family: var(--font-headline)"
              >
                {{ row.original.name }}
              </h3>

              <p
                class="text-[10px] font-mono uppercase tracking-tight mt-0.5 truncate"
                :class="isSelected(row.original.id) ? 'text-white/80' : 'text-black/70'"
              >
                {{ row.original.startPoint }} → {{ row.original.endPoint }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Stats -->
        <div class="p-2.5 bg-white border-t-[3px] border-black text-[11px] font-mono font-bold uppercase flex items-center justify-between shrink-0">
          <span>{{ table.getRowModel().rows.length }} AXES AFFICHÉS</span>
          <span class="text-black/60">MTQ // QUÉBEC</span>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 2: NOMENCLATURE & GROUPS                                      -->
      <!-- ================================================================= -->
      <div v-show="activeTab === 'nomenclature'" class="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F7F7F7]">
        <!-- Search & Control Header -->
        <div class="p-3.5 border-b-[3px] border-black bg-white space-y-2 shrink-0">
          <div>
            <label class="block font-mono text-[10px] font-bold uppercase tracking-[1px] text-black mb-1">
              FILTRER LES GROUPES //
            </label>
            <div class="relative">
              <input
                v-model="nomenclatureFilter"
                type="text"
                placeholder="RECHERCHER UN GROUPE (PAIRS, ROCADES, RIVE-SUD)..."
                class="w-full px-3 py-1.5 text-xs bg-[#F0F0F0] hover:bg-[#E8E8E8] text-black border-[2px] border-black focus:border-[3px] focus:bg-white focus:outline-none font-mono uppercase transition-all"
              />
              <button
                v-if="nomenclatureFilter"
                @click="nomenclatureFilter = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 font-mono font-bold text-xs hover:text-[#FF0000] px-1 cursor-pointer"
              >
                [X]
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] font-mono font-bold pt-1">
            <span class="text-black/60 uppercase">CLASSIFICATION OFFICIELLE MTQ</span>
            <button
              @click="emit('openGuide')"
              class="text-[#0055FF] hover:underline uppercase cursor-pointer"
            >
              [VOIR LE GUIDE COMPLET]
            </button>
          </div>
        </div>

        <!-- Groups Container -->
        <div class="flex-1 overflow-y-auto p-3 space-y-4">
          <!-- 1. ORIENTATION (PAIRS / IMPAIRS) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between border-b-2 border-black pb-1">
              <div class="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <ArrowRightLeft :size="14" />
                <span>1. AXES ET ORIENTATION DU FLEUVE</span>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="sec in filteredSections.filter(s => s.category === 'orientation')"
                :key="sec.id"
                class="border-[3px] border-black bg-white p-3 space-y-2.5 transition-shadow hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <component :is="getSectionIcon(sec.iconName)" :size="16" />
                      <h4 class="font-bold text-xs font-mono uppercase">{{ sec.label }}</h4>
                    </div>
                    <p class="text-[10px] font-mono text-black/70 mt-1 leading-snug">
                      {{ sec.description }}
                    </p>
                  </div>

                  <div class="shrink-0 text-right">
                    <span class="px-1.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold">
                      {{ getSectionSelectedCount(sec) }}/{{ getSectionCount(sec) }}
                    </span>
                  </div>
                </div>

                <!-- Action Button -->
                <button
                  @click="selectBySection(sec)"
                  class="w-full py-1.5 px-3 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  :class="[
                    isSectionAllSelected(sec)
                      ? 'bg-black text-white hover:bg-[#CC0000] hover:border-[#CC0000]'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  ]"
                >
                  <component :is="isSectionAllSelected(sec) ? X : Check" :size="12" />
                  <span>{{ isSectionAllSelected(sec) ? 'DÉ-SÉLECTIONNER LE GROUPE' : 'SÉLECTIONNER TOUT LE GROUPE' }}</span>
                </button>

                <!-- Route Chips Preview -->
                <div class="flex flex-wrap gap-1 pt-1 border-t border-black/20 max-h-24 overflow-y-auto">
                  <button
                    v-for="r in getSectionRoutes(sec)"
                    :key="r.id"
                    @click.stop="emit('toggleRoute', r.id)"
                    class="px-1.5 py-0.5 border text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    :style="{
                      borderColor: isSelected(r.id) ? '#000000' : getRouteTypeInfo(r).color,
                      backgroundColor: isSelected(r.id) ? '#000000' : '#FFFFFF',
                      color: isSelected(r.id) ? '#FFFFFF' : '#000000'
                    }"
                    :title="r.name"
                  >
                    {{ r.id }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. HIÉRARCHIE MTQ -->
          <div class="space-y-2">
            <div class="flex items-center justify-between border-b-2 border-black pb-1">
              <div class="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <FolderTree :size="14" />
                <span>2. HIÉRARCHIE & CLASSIFICATION MTQ</span>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="sec in filteredSections.filter(s => s.category === 'hierarchy')"
                :key="sec.id"
                class="border-[3px] border-black bg-white p-3 space-y-2.5 transition-shadow hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <component :is="getSectionIcon(sec.iconName)" :size="16" />
                      <h4 class="font-bold text-xs font-mono uppercase">{{ sec.label }}</h4>
                    </div>
                    <p class="text-[10px] font-mono text-black/70 mt-1 leading-snug">
                      {{ sec.description }}
                    </p>
                  </div>

                  <div class="shrink-0 text-right">
                    <span class="px-1.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold">
                      {{ getSectionSelectedCount(sec) }}/{{ getSectionCount(sec) }}
                    </span>
                  </div>
                </div>

                <!-- Action Button -->
                <button
                  @click="selectBySection(sec)"
                  class="w-full py-1.5 px-3 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  :class="[
                    isSectionAllSelected(sec)
                      ? 'bg-black text-white hover:bg-[#CC0000] hover:border-[#CC0000]'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  ]"
                >
                  <component :is="isSectionAllSelected(sec) ? X : Check" :size="12" />
                  <span>{{ isSectionAllSelected(sec) ? 'DÉ-SÉLECTIONNER LE GROUPE' : 'SÉLECTIONNER TOUT LE GROUPE' }}</span>
                </button>

                <!-- Route Chips Preview -->
                <div class="flex flex-wrap gap-1 pt-1 border-t border-black/20 max-h-24 overflow-y-auto">
                  <button
                    v-for="r in getSectionRoutes(sec)"
                    :key="r.id"
                    @click.stop="emit('toggleRoute', r.id)"
                    class="px-1.5 py-0.5 border text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    :style="{
                      borderColor: isSelected(r.id) ? '#000000' : getRouteTypeInfo(r).color,
                      backgroundColor: isSelected(r.id) ? '#000000' : '#FFFFFF',
                      color: isSelected(r.id) ? '#FFFFFF' : '#000000'
                    }"
                    :title="r.name"
                  >
                    {{ r.id }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. GÉOGRAPHIE DU SAINT-LAURENT -->
          <div class="space-y-2">
            <div class="flex items-center justify-between border-b-2 border-black pb-1">
              <div class="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Navigation :size="14" />
                <span>3. SITUATION GÉOGRAPHIQUE / RIVES</span>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="sec in filteredSections.filter(s => s.category === 'geography')"
                :key="sec.id"
                class="border-[3px] border-black bg-white p-3 space-y-2.5 transition-shadow hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <component :is="getSectionIcon(sec.iconName)" :size="16" />
                      <h4 class="font-bold text-xs font-mono uppercase">{{ sec.label }}</h4>
                    </div>
                    <p class="text-[10px] font-mono text-black/70 mt-1 leading-snug">
                      {{ sec.description }}
                    </p>
                  </div>

                  <div class="shrink-0 text-right">
                    <span class="px-1.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold">
                      {{ getSectionSelectedCount(sec) }}/{{ getSectionCount(sec) }}
                    </span>
                  </div>
                </div>

                <!-- Action Button -->
                <button
                  @click="selectBySection(sec)"
                  class="w-full py-1.5 px-3 border-[2px] border-black font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  :class="[
                    isSectionAllSelected(sec)
                      ? 'bg-black text-white hover:bg-[#CC0000] hover:border-[#CC0000]'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  ]"
                >
                  <component :is="isSectionAllSelected(sec) ? X : Check" :size="12" />
                  <span>{{ isSectionAllSelected(sec) ? 'DÉ-SÉLECTIONNER LE GROUPE' : 'SÉLECTIONNER TOUT LE GROUPE' }}</span>
                </button>

                <!-- Route Chips Preview -->
                <div class="flex flex-wrap gap-1 pt-1 border-t border-black/20 max-h-24 overflow-y-auto">
                  <button
                    v-for="r in getSectionRoutes(sec)"
                    :key="r.id"
                    @click.stop="emit('toggleRoute', r.id)"
                    class="px-1.5 py-0.5 border text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    :style="{
                      borderColor: isSelected(r.id) ? '#000000' : getRouteTypeInfo(r).color,
                      backgroundColor: isSelected(r.id) ? '#000000' : '#FFFFFF',
                      color: isSelected(r.id) ? '#FFFFFF' : '#000000'
                    }"
                    :title="r.name"
                  >
                    {{ r.id }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="p-2.5 bg-white border-t-[3px] border-black text-[11px] font-mono font-bold uppercase flex items-center justify-between shrink-0">
          <span>{{ ROUTE_SECTIONS.length }} GROUPES DE CLASSIFICATION</span>
          <button
            v-if="selectedRouteIds.length > 0"
            @click="emit('clearSelection')"
            class="text-[#FFA500] hover:underline cursor-pointer"
          >
            [TOUT DÉCOCHÉ]
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
