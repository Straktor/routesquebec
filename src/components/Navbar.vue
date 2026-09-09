<script setup lang="ts">
defineProps<{
  isSidebarOpen: boolean;
  totalRoutes: number;
  totalDistanceKm: number;
  selectedCount: number;
  selectedDistanceKm: number;
}>();

const emit = defineEmits<{
  (e: 'toggleSidebar'): void;
  (e: 'clearSelection'): void;
  (e: 'openGuide'): void;
}>();
</script>

<template>
  <header class="h-16 bg-white text-black border-b-[5px] border-black flex items-center justify-between px-4 sm:px-6 z-30 shrink-0 select-none">
    <div class="flex items-center gap-4">
      <!-- Sidebar Toggle -->
      <button
        @click="emit('toggleSidebar')"
        class="h-10 px-3 bg-white hover:bg-black text-black hover:text-white border-[3px] border-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        :title="isSidebarOpen ? 'Masquer la liste' : 'Afficher la liste'"
      >
        {{ isSidebarOpen ? '[← FERMER]' : '[LISTE →]' }}
      </button>

      <!-- App Title -->
      <div>
        <div class="flex items-baseline gap-2">
          <h1 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-none" style="font-family: var(--font-headline)">
            ROUTES // QUÉBEC
          </h1>
          <span class="hidden md:inline-block text-[11px] font-mono uppercase tracking-widest bg-black text-white px-1.5 py-0.5 font-bold">
            MTQ v1.0
          </span>
        </div>
        <p class="text-[11px] font-mono text-black/70 tracking-tight hidden sm:block">
          BASE GÉOGRAPHIQUE & NOMENCLATURE BRUTE
        </p>
      </div>
    </div>

    <!-- Center Active Multi-Selection Indicator -->
    <div
      v-if="selectedCount > 0"
      class="hidden md:flex items-center gap-3 px-3 py-1.5 bg-[#FFA500] border-[3px] border-black text-xs font-mono font-bold uppercase tracking-wider"
    >
      <span>
        {{ selectedCount }} {{ selectedCount > 1 ? 'ROUTES ACTIVES' : 'ROUTE ACTIVE' }} // {{ selectedDistanceKm.toLocaleString() }} KM
      </span>
      <button
        @click="emit('clearSelection')"
        class="bg-black text-white hover:bg-white hover:text-black border-2 border-black px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
      >
        [EFFACER]
      </button>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-3">
      <div class="hidden lg:flex items-center gap-3 text-xs font-mono font-bold mr-2">
        <span class="border-b-2 border-black">{{ totalRoutes }} AXES</span>
        <span class="text-black/50">//</span>
        <span>{{ totalDistanceKm.toLocaleString() }} KM</span>
      </div>

      <!-- Numbering Guide Button -->
      <button
        @click="emit('openGuide')"
        class="h-10 px-4 bg-black hover:bg-white text-white hover:text-black border-[3px] border-black font-mono text-xs font-bold uppercase tracking-[2px] transition-colors cursor-pointer"
      >
        GUIDE MTQ
      </button>
    </div>
  </header>
</template>
