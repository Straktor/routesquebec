<script setup lang="ts">
import {
  Map,
  PanelLeftClose,
  PanelLeft,
  Route,
  X,
  Info,
} from '@lucide/vue';

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
  <header class="h-14 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-4 z-30 shrink-0 select-none shadow-md">
    <div class="flex items-center gap-3">
      <!-- Sidebar Toggle (Mobile & Desktop) -->
      <button
        @click="emit('toggleSidebar')"
        class="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        :title="isSidebarOpen ? 'Masquer la liste' : 'Afficher la liste'"
      >
        <PanelLeftClose v-if="isSidebarOpen" class="w-5 h-5" />
        <PanelLeft v-else class="w-5 h-5" />
      </button>

      <!-- App Brand -->
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
          <Route class="w-5 h-5 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-bold text-sm sm:text-base leading-none tracking-tight">
              Routes du Québec
            </h1>
            <span class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Vue 3 + TanStack
            </span>
          </div>
          <p class="text-[11px] text-slate-400 leading-tight hidden sm:block">
            Carte interactive des autoroutes et routes nationales
          </p>
        </div>
      </div>
    </div>

    <!-- Center Active Multi-Selection Pill -->
    <div
      v-if="selectedCount > 0"
      class="hidden md:flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs animate-fade-in"
    >
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
      <span class="font-semibold text-amber-200">
        {{ selectedCount }} {{ selectedCount > 1 ? 'routes sélectionnées' : 'route sélectionnée' }}
      </span>
      <span class="text-amber-300/80">({{ selectedDistanceKm.toLocaleString() }} km)</span>
      <button
        @click="emit('clearSelection')"
        class="ml-1 text-amber-300 hover:text-white hover:bg-amber-500/30 rounded p-0.5 transition-colors cursor-pointer"
        title="Désélectionner tout"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Right Stats & Links -->
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="hidden lg:flex items-center gap-4 text-xs text-slate-300 mr-2">
        <div class="flex items-center gap-1.5">
          <Map class="w-3.5 h-3.5 text-blue-400" />
          <span><strong>{{ totalRoutes }}</strong> routes</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-400">
          <span><strong>{{ totalDistanceKm.toLocaleString() }}</strong> km</span>
        </div>
      </div>

      <!-- Numbering Guide Button -->
      <button
        @click="emit('openGuide')"
        class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-700 cursor-pointer"
        title="Comment sont numérotées les routes ?"
      >
        <Info class="w-3.5 h-3.5 text-blue-400" />
        <span class="hidden sm:inline">Guide de numérotation</span>
        <span class="sm:hidden">Guide</span>
      </button>

      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
        title="GitHub"
      >
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </a>
    </div>
  </header>
</template>
