<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoutes } from './composables/useRoutes';
import Navbar from './components/Navbar.vue';
import RouteSidebar from './components/RouteSidebar.vue';
import MapView from './components/MapView.vue';
import NumberingGuideModal from './components/NumberingGuideModal.vue';
import {
  Map as MapIcon,
  Route as RouteIcon,
  FolderTree,
  BookOpen
} from 'lucide-vue-next';

const { data: routesData, isLoading, error } = useRoutes();

const routes = computed(() => routesData.value ?? []);

const selectedRouteIds = ref<string[]>([]);
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
const isSidebarOpen = ref(!isMobile.value);
const activeTab = ref<'routes' | 'nomenclature'>('routes');
const isGuideOpen = ref(false);

const totalDistanceKm = computed(() => {
  return routes.value.reduce((acc, r) => acc + r.lengthKm, 0);
});

const selectedDistanceKm = computed(() => {
  return routes.value
    .filter(r => selectedRouteIds.value.includes(r.id))
    .reduce((acc, r) => acc + r.lengthKm, 0);
});

function handleToggleRoute(id: string) {
  if (selectedRouteIds.value.includes(id)) {
    selectedRouteIds.value = selectedRouteIds.value.filter(item => item !== id);
  } else {
    selectedRouteIds.value = [...selectedRouteIds.value, id];
  }
}

function handleSelectAll(ids: string[]) {
  const merged = new Set([...selectedRouteIds.value, ...ids]);
  selectedRouteIds.value = Array.from(merged);
}

function handleClearSelection() {
  selectedRouteIds.value = [];
}

function handleSetSelection(ids: string[]) {
  selectedRouteIds.value = ids;
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function openMobileTab(tab: 'routes' | 'nomenclature') {
  activeTab.value = tab;
  isSidebarOpen.value = true;
}
</script>

<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden bg-white text-black font-sans">
    <!-- Navbar Header -->
    <Navbar
      :is-sidebar-open="isSidebarOpen"
      :total-routes="routes.length"
      :total-distance-km="totalDistanceKm"
      :selected-count="selectedRouteIds.length"
      :selected-distance-km="selectedDistanceKm"
      @toggle-sidebar="toggleSidebar"
      @clear-selection="handleClearSelection"
      @open-guide="isGuideOpen = true"
    />

    <!-- Main Content (Sidebar + Map) -->
    <div class="flex flex-1 relative overflow-hidden bg-white">
      <!-- Sidebar container with responsive sliding -->
      <div
        :class="[
          'transition-all duration-200 ease-linear z-[1050] md:z-20 shrink-0 h-full flex flex-col',
          isSidebarOpen
            ? 'absolute inset-0 md:relative md:w-[490px] w-full bg-white'
            : 'hidden md:flex md:w-0 overflow-hidden pointer-events-none'
        ]"
      >
        <RouteSidebar
          v-show="isSidebarOpen"
          v-model:active-tab="activeTab"
          :routes="routes"
          :selected-route-ids="selectedRouteIds"
          :is-loading="isLoading"
          class="flex-1 min-h-0"
          @toggle-route="handleToggleRoute"
          @select-all="handleSelectAll"
          @clear-selection="handleClearSelection"
          @set-selection="handleSetSelection"
          @open-guide="isGuideOpen = true"
          @close="isSidebarOpen = false"
        />

        <!-- Mobile Floating Sticky Switch to Map when routes are selected -->
        <div
          v-if="isSidebarOpen && selectedRouteIds.length > 0"
          class="md:hidden p-2.5 bg-black text-white border-t-[3px] border-black shrink-0"
        >
          <button
            @click="isSidebarOpen = false"
            class="w-full py-2.5 px-3 bg-white hover:bg-black text-black hover:text-white border-[2px] border-white font-mono text-xs font-bold uppercase tracking-[1px] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
          >
            <span>VOIR SUR LA CARTE</span>
            <span class="bg-[#0055FF] text-white px-1.5 py-0.5 text-[10px]">{{ selectedRouteIds.length }}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <!-- Map Container -->
      <main class="flex-1 h-full relative overflow-hidden bg-[#F0F0F0]">
        <!-- Error Banner -->
        <div
          v-if="error"
          class="absolute top-4 left-4 z-[1000] bg-[#FF0000] text-white border-[3px] border-black font-mono font-bold text-xs uppercase px-4 py-3"
        >
          [ERREUR SYSTÈME] {{ error.message }}
        </div>

        <MapView
          :routes="routes"
          :selected-route-ids="selectedRouteIds"
          :is-sidebar-open="isSidebarOpen"
          @toggle-route="handleToggleRoute"
          @clear-selection="handleClearSelection"
          @set-selection="handleSetSelection"
          @open-guide="isGuideOpen = true"
        />
      </main>
    </div>

    <!-- Mobile Native App Bottom Navigation Bar (PWA & Mobile Only) -->
    <nav
      class="md:hidden bg-[#181818] border-t-[3px] border-black flex items-stretch z-[1100] shrink-0 pb-safe select-none"
    >
      <!-- CARTE Tab -->
      <button
        @click="isSidebarOpen = false"
        :class="[
          'flex-1 h-13 flex flex-col items-center justify-center relative transition-colors cursor-pointer border-t-[3px]',
          !isSidebarOpen
            ? 'bg-[#252526] text-white border-[#0055FF]'
            : 'text-[#888888] border-transparent hover:text-white'
        ]"
      >
        <MapIcon :size="18" />
        <span class="text-[9px] font-mono font-bold mt-0.5 tracking-wider uppercase">CARTE</span>
        <span
          v-if="selectedRouteIds.length > 0 && !isSidebarOpen"
          class="absolute top-1.5 right-1/4 translate-x-2 px-1 py-0.2 bg-[#FFA500] text-black font-mono text-[8px] font-bold border border-black"
        >
          {{ selectedRouteIds.length }}
        </span>
      </button>

      <!-- ROUTES Tab -->
      <button
        @click="openMobileTab('routes')"
        :class="[
          'flex-1 h-13 flex flex-col items-center justify-center relative transition-colors cursor-pointer border-t-[3px]',
          isSidebarOpen && activeTab === 'routes'
            ? 'bg-[#252526] text-white border-[#0055FF]'
            : 'text-[#888888] border-transparent hover:text-white'
        ]"
      >
        <RouteIcon :size="18" />
        <span class="text-[9px] font-mono font-bold mt-0.5 tracking-wider uppercase">ROUTES</span>
        <span
          v-if="selectedRouteIds.length > 0"
          class="absolute top-1.5 right-1/4 translate-x-2 px-1 py-0.2 bg-[#0055FF] text-white font-mono text-[8px] font-bold border border-black"
        >
          {{ selectedRouteIds.length }}
        </span>
      </button>

      <!-- GROUPES Tab -->
      <button
        @click="openMobileTab('nomenclature')"
        :class="[
          'flex-1 h-13 flex flex-col items-center justify-center relative transition-colors cursor-pointer border-t-[3px]',
          isSidebarOpen && activeTab === 'nomenclature'
            ? 'bg-[#252526] text-white border-[#0055FF]'
            : 'text-[#888888] border-transparent hover:text-white'
        ]"
      >
        <FolderTree :size="18" />
        <span class="text-[9px] font-mono font-bold mt-0.5 tracking-wider uppercase">GROUPES</span>
      </button>

      <!-- GUIDE Tab -->
      <button
        @click="isGuideOpen = true"
        class="flex-1 h-13 flex flex-col items-center justify-center relative text-[#888888] hover:text-white border-t-[3px] border-transparent transition-colors cursor-pointer"
      >
        <BookOpen :size="18" />
        <span class="text-[9px] font-mono font-bold mt-0.5 tracking-wider uppercase">GUIDE</span>
      </button>
    </nav>

    <!-- Numbering System Guide Modal -->
    <NumberingGuideModal
      :is-open="isGuideOpen"
      @close="isGuideOpen = false"
    />
  </div>
</template>
