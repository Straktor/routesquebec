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
  <header class="h-14 sm:h-16 bg-white text-black border-b-[4px] sm:border-b-[5px] border-black flex items-center justify-between px-3 sm:px-6 z-40 shrink-0 select-none">
    <div class="flex items-center gap-2 sm:gap-4 min-w-0">
      <!-- Sidebar / Map Toggle Button -->
      <button
        @click="emit('toggleSidebar')"
        class="h-9 sm:h-10 px-2 sm:px-3 bg-white hover:bg-black text-black hover:text-white border-[3px] border-black font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
        :title="isSidebarOpen ? 'Voir la carte' : 'Ouvrir la liste'"
      >
        <span class="sm:hidden">{{ isSidebarOpen ? '[CARTE]' : '[LISTE]' }}</span>
        <span class="hidden sm:inline">{{ isSidebarOpen ? '[← FERMER]' : '[LISTE →]' }}</span>
      </button>

      <!-- App Title -->
      <div class="min-w-0">
        <div class="flex items-baseline gap-1.5 sm:gap-2">
          <h1
            class="text-base sm:text-2xl font-black uppercase tracking-tight text-black leading-none truncate"
            style="font-family: var(--font-headline)"
          >
            <span class="sm:hidden">ROUTES // QC</span>
            <span class="hidden sm:inline">ROUTES // QUÉBEC</span>
          </h1>
          <span class="hidden lg:inline-block text-[10px] font-mono uppercase tracking-widest bg-black text-white px-1 py-0.2 font-bold">
            MTQ
          </span>
        </div>
        <p class="text-[10px] font-mono text-black/60 tracking-tight hidden md:block">
          BASE GÉOGRAPHIQUE & NOMENCLATURE BRUTE
        </p>
      </div>
    </div>

    <!-- Active Selection Indicator (Desktop & Mobile) -->
    <div
      v-if="selectedCount > 0"
      class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-[#FFA500] border-[2px] sm:border-[3px] border-black text-[10px] sm:text-xs font-mono font-bold uppercase shrink-0"
    >
      <span>
        {{ selectedCount }} <span class="hidden sm:inline">{{ selectedCount > 1 ? 'ACTIVES' : 'ACTIVE' }}</span>
        <span class="hidden md:inline"> // {{ selectedDistanceKm.toLocaleString() }} KM</span>
      </span>
      <button
        @click="emit('clearSelection')"
        class="bg-black text-white hover:bg-white hover:text-black border border-black px-1 text-[9px] uppercase font-bold tracking-tight cursor-pointer"
        title="Désélectionner tout"
      >
        [X]
      </button>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="hidden xl:flex items-center gap-3 text-xs font-mono font-bold mr-2">
        <span>{{ totalRoutes }} AXES</span>
        <span class="text-black/50">//</span>
        <span>{{ totalDistanceKm.toLocaleString() }} KM</span>
      </div>

      <!-- Numbering Guide Button -->
      <button
        @click="emit('openGuide')"
        class="h-9 sm:h-10 px-2.5 sm:px-4 bg-black hover:bg-white text-white hover:text-black border-[3px] border-black font-mono text-[11px] sm:text-xs font-bold uppercase tracking-[1px] sm:tracking-[2px] transition-colors cursor-pointer"
      >
        <span class="sm:hidden">GUIDE</span>
        <span class="hidden sm:inline">GUIDE MTQ</span>
      </button>
    </div>
  </header>
</template>
