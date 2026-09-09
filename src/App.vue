<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoutes } from './composables/useRoutes';
import Navbar from './components/Navbar.vue';
import RouteSidebar from './components/RouteSidebar.vue';
import MapView from './components/MapView.vue';

const { data: routesData, isLoading, error } = useRoutes();

const routes = computed(() => routesData.value ?? []);

const selectedRouteId = ref<string | null>(null);
const isSidebarOpen = ref(true);

const selectedRoute = computed(() => {
  if (!selectedRouteId.value) return null;
  return routes.value.find(r => r.id === selectedRouteId.value) || null;
});

const totalDistanceKm = computed(() => {
  return routes.value.reduce((acc, r) => acc + r.lengthKm, 0);
});

function handleSelectRoute(id: string | null) {
  selectedRouteId.value = id;
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden bg-slate-900">
    <!-- Navbar Header -->
    <Navbar
      :is-sidebar-open="isSidebarOpen"
      :total-routes="routes.length"
      :total-distance-km="totalDistanceKm"
      :selected-route="selectedRoute"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content (Sidebar + Map) -->
    <div class="flex flex-1 relative overflow-hidden">
      <!-- Sidebar container with responsive sliding -->
      <div
        :class="[
          'transition-all duration-300 ease-in-out z-20 shrink-0 h-full',
          isSidebarOpen ? 'w-full sm:w-96 md:w-[420px]' : 'w-0 overflow-hidden'
        ]"
      >
        <RouteSidebar
          v-show="isSidebarOpen"
          :routes="routes"
          :selected-route-id="selectedRouteId"
          :is-loading="isLoading"
          @select-route="handleSelectRoute"
        />
      </div>

      <!-- Map Container -->
      <main class="flex-1 h-full relative overflow-hidden">
        <!-- Error Banner -->
        <div
          v-if="error"
          class="absolute top-4 left-4 z-[1000] bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm"
        >
          Erreur lors du chargement des routes: {{ error.message }}
        </div>

        <MapView
          :routes="routes"
          :selected-route-id="selectedRouteId"
          @select-route="handleSelectRoute"
        />
      </main>
    </div>
  </div>
</template>
