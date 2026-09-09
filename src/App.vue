<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoutes } from './composables/useRoutes';
import Navbar from './components/Navbar.vue';
import RouteSidebar from './components/RouteSidebar.vue';
import MapView from './components/MapView.vue';
import NumberingGuideModal from './components/NumberingGuideModal.vue';

const { data: routesData, isLoading, error } = useRoutes();

const routes = computed(() => routesData.value ?? []);

const selectedRouteIds = ref<string[]>([]);
const isSidebarOpen = ref(true);
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
          'transition-all duration-200 ease-linear z-30 shrink-0 h-full flex flex-col',
          isSidebarOpen
            ? 'absolute inset-0 md:relative md:w-[440px] w-full bg-white'
            : 'w-0 overflow-hidden'
        ]"
      >
        <RouteSidebar
          v-show="isSidebarOpen"
          :routes="routes"
          :selected-route-ids="selectedRouteIds"
          :is-loading="isLoading"
          class="flex-1 min-h-0"
          @toggle-route="handleToggleRoute"
          @select-all="handleSelectAll"
          @clear-selection="handleClearSelection"
          @set-selection="handleSetSelection"
        />

        <!-- Mobile Floating Sticky Switch to Map -->
        <div
          v-if="isSidebarOpen"
          class="md:hidden p-3 bg-black text-white border-t-[3px] border-black shrink-0"
        >
          <button
            @click="isSidebarOpen = false"
            class="w-full py-2.5 px-4 bg-white hover:bg-black text-black hover:text-white border-[3px] border-white font-mono text-xs font-bold uppercase tracking-[2px] transition-colors cursor-pointer text-center"
          >
            VOIR SUR LA CARTE {{ selectedRouteIds.length > 0 ? `(${selectedRouteIds.length})` : '' }} →
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
          @toggle-route="handleToggleRoute"
          @clear-selection="handleClearSelection"
          @set-selection="handleSetSelection"
          @open-guide="isGuideOpen = true"
        />
      </main>
    </div>

    <!-- Numbering System Guide Modal -->
    <NumberingGuideModal
      :is-open="isGuideOpen"
      @close="isGuideOpen = false"
    />
  </div>
</template>
