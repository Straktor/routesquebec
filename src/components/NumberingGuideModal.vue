<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import {
  X,
  Compass,
  ArrowRightLeft,
  ArrowUpDown,
  Navigation,
  BookOpen,
} from '@lucide/vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
      <!-- Backdrop -->
      <div
        @click="emit('close')"
        class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-fade-in"
      ></div>

      <!-- Modal Content -->
      <div
        class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-scale-up"
      >
        <!-- Header -->
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
              <BookOpen class="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 class="font-bold text-base leading-tight">
                Guide de numérotation routière au Québec
              </h2>
              <p class="text-xs text-slate-400">
                Normes et conventions du Ministère des Transports du Québec (MTQ)
              </p>
            </div>
          </div>
          <button
            @click="emit('close')"
            class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          <!-- Section 1: Orientation (Pairs vs Impairs) -->
          <div class="space-y-3">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Compass class="w-4 h-4 text-blue-600" />
              1. L'orientation des axes : Règle des pairs et impairs
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col gap-1.5">
                <div class="flex items-center gap-2 font-semibold text-blue-900">
                  <ArrowRightLeft class="w-4 h-4 text-blue-600" />
                  <span>Numéros Pairs = Est-Ouest</span>
                </div>
                <p class="text-xs text-slate-600">
                  Parallèles au fleuve Saint-Laurent.
                </p>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">A-20</span>
                  <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">A-40</span>
                  <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">A-30</span>
                  <span class="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold">R-132</span>
                  <span class="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold">R-138</span>
                </div>
              </div>

              <div class="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 flex flex-col gap-1.5">
                <div class="flex items-center gap-2 font-semibold text-purple-900">
                  <ArrowUpDown class="w-4 h-4 text-purple-600" />
                  <span>Numéros Impairs = Nord-Sud</span>
                </div>
                <p class="text-xs text-slate-600">
                  Perpendiculaires au fleuve ou reliant les frontières.
                </p>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">A-15</span>
                  <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">A-55</span>
                  <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">A-73</span>
                  <span class="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold">R-117</span>
                  <span class="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold">R-175</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Autoroutes 2 vs 3 chiffres -->
          <div class="space-y-3">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Navigation class="w-4 h-4 text-blue-600" />
              2. Les Autoroutes (Série 1 à 999)
            </h3>
            <div class="space-y-2.5">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div class="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1 text-blue-700">
                  Autoroutes principales (1 à 99)
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Grands corridors interurbains transquébécois ou transcanadiens (ex. : <strong>A-20</strong> traverse le sud du fleuve, <strong>A-40</strong> la rive-nord).
                </p>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="font-semibold text-slate-800 text-xs uppercase tracking-wider text-blue-700">
                  Autoroutes collectrices, boucles et antennes (100 à 999)
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Le numéro à trois chiffres fait référence à l'autoroute mère (les deux derniers chiffres) :
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div class="p-2 bg-white rounded border border-slate-200">
                    <span class="font-bold text-slate-800">Premier chiffre Pair (4xx, 6xx) :</span>
                    <p class="text-slate-500 mt-0.5">
                      Voie de contournement ou rocade.<br />
                      <em>Ex. : A-640 (contourne A-40 au nord), A-440.</em>
                    </p>
                  </div>
                  <div class="p-2 bg-white rounded border border-slate-200">
                    <span class="font-bold text-slate-800">Premier chiffre Impair (5xx, 7xx, 9xx) :</span>
                    <p class="text-slate-500 mt-0.5">
                      Antenne, éperon ou accès urbain direct.<br />
                      <em>Ex. : A-520 (accès aéroport), A-720, A-973.</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Routes régionales et nationales (100 à 300) -->
          <div class="space-y-3">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              3. Les Routes Nationales et Régionales (100 à 399)
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div class="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div class="font-bold text-emerald-900 mb-1">Série 100 (Nationales)</div>
                <p class="text-slate-600 leading-relaxed">
                  Routes interrégionales majeures reliant les grands pôles et frontières.
                  <br /><br />
                  <strong>Règle Rive-Sud / Rive-Nord :</strong>
                  <br />
                  • <strong>Route 132 :</strong> Rive-Sud & Gaspésie.
                  <br />
                  • <strong>Route 138 :</strong> Rive-Nord & Côte-Nord.
                </p>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div class="font-bold text-slate-800 mb-1">Série 200 (Régionales Sud)</div>
                <p class="text-slate-600 leading-relaxed">
                  Routes secondaires situées <strong>au sud</strong> du fleuve Saint-Laurent (Montérégie, Estrie, Chaudière-Appalaches, Bas-Saint-Laurent).
                </p>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div class="font-bold text-slate-800 mb-1">Série 300 (Régionales Nord)</div>
                <p class="text-slate-600 leading-relaxed">
                  Routes secondaires situées <strong>au nord</strong> du fleuve Saint-Laurent (Laurentides, Lanaudière, Mauricie, Saguenay, Abitibi).
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Source : Ministère des Transports et de la Mobilité durable du Québec</span>
          <button
            @click="emit('close')"
            class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
