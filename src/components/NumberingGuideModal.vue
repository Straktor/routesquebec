<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

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
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none"
    >
      <!-- Modal Backdrop (Solid semi-opaque black) -->
      <div
        @click="emit('close')"
        class="fixed inset-0 bg-black/80 transition-opacity"
      ></div>

      <!-- Modal Card (Elevated: 5px black border, square, no shadow) -->
      <div
        class="relative w-full max-w-2xl bg-white border-[5px] border-black overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        <!-- Header (Surface Inverted: black fill, white text) -->
        <div class="px-6 py-4 bg-black text-white flex items-center justify-between border-b-[3px] border-black shrink-0">
          <div>
            <h2
              class="text-lg sm:text-xl font-black uppercase tracking-tight"
              style="font-family: var(--font-headline)"
            >
              GUIDE DE NUMÉROTATION // MTQ
            </h2>
            <p class="text-xs font-mono text-white/70 tracking-tight">
              STANDARDS ET RÈGLES DE NOMENCLATURE DU RÉSEAU QUÉBÉCOIS
            </p>
          </div>
          <button
            @click="emit('close')"
            class="px-2.5 py-1 bg-white hover:bg-black text-black hover:text-white border-2 border-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            [X]
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6 text-black text-sm">
          <!-- Section 1: Orientation (Pairs vs Impairs) -->
          <div class="space-y-3">
            <h3
              class="text-base font-black uppercase tracking-tight border-b-[3px] border-black pb-1.5"
              style="font-family: var(--font-headline)"
            >
              1. ORIENTATION GÉOGRAPHIQUE : PAIRS VS IMPAIRS
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Even -->
              <div class="p-4 bg-[#F0F0F0] border-[3px] border-black space-y-2">
                <div class="font-mono font-bold text-xs uppercase tracking-wider bg-black text-white px-2 py-0.5 inline-block">
                  PAIRS = EST-OUEST
                </div>
                <p class="text-xs font-mono leading-relaxed">
                  Axes parallèles à la trajectoire générale du fleuve Saint-Laurent.
                </p>
                <div class="flex flex-wrap gap-1.5 pt-1 font-mono text-xs">
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">A-20</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">A-40</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">A-30</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">R-132</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">R-138</span>
                </div>
              </div>

              <!-- Odd -->
              <div class="p-4 bg-[#F0F0F0] border-[3px] border-black space-y-2">
                <div class="font-mono font-bold text-xs uppercase tracking-wider bg-black text-white px-2 py-0.5 inline-block">
                  IMPAIRS = NORD-SUD
                </div>
                <p class="text-xs font-mono leading-relaxed">
                  Axes perpendiculaires au fleuve ou reliant les frontières provinciales/américaines.
                </p>
                <div class="flex flex-wrap gap-1.5 pt-1 font-mono text-xs">
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">A-15</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">A-55</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">A-73</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">R-117</span>
                  <span class="px-1.5 py-0.5 bg-white border-2 border-black font-bold">R-175</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Autoroutes 2 vs 3 chiffres -->
          <div class="space-y-3">
            <h3
              class="text-base font-black uppercase tracking-tight border-b-[3px] border-black pb-1.5"
              style="font-family: var(--font-headline)"
            >
              2. LES AUTOROUTES (SÉRIE 1 À 999)
            </h3>
            <div class="space-y-3 font-mono text-xs">
              <div class="p-3 bg-white border-[3px] border-black">
                <div class="font-bold uppercase tracking-wider mb-1 bg-black text-white px-2 py-0.5 inline-block">
                  CORRIDORS PRINCIPAUX (1 À 99)
                </div>
                <p class="mt-1.5 text-black/80 leading-relaxed">
                  Artères maîtresses interrégionales ou transcanadiennes reliant les métropoles (ex. : A-20, A-40, A-15, A-50).
                </p>
              </div>

              <div class="p-3 bg-[#F0F0F0] border-[3px] border-black space-y-2">
                <div class="font-bold uppercase tracking-wider mb-1">
                  AUTOROUTES AUXILIAIRES À TROIS CHIFFRES (100 À 999)
                </div>
                <p class="text-black/80">
                  Les deux derniers chiffres identifient l'autoroute mère :
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div class="p-2 bg-white border-2 border-black">
                    <span class="font-bold uppercase block text-black">1er CHIFFRE PAIR (4XX, 6XX) :</span>
                    <span class="text-black/70">Rocade ou voie de contournement (ex. : A-640 contourne A-40).</span>
                  </div>
                  <div class="p-2 bg-white border-2 border-black">
                    <span class="font-bold uppercase block text-black">1er CHIFFRE IMPAIR (5XX, 7XX, 9XX) :</span>
                    <span class="text-black/70">Antenne, éperon ou accès urbain direct (ex. : A-520, A-720, A-973).</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Routes régionales et nationales (100 à 399) -->
          <div class="space-y-3">
            <h3
              class="text-base font-black uppercase tracking-tight border-b-[3px] border-black pb-1.5"
              style="font-family: var(--font-headline)"
            >
              3. LES ROUTES NATIONALES ET RÉGIONALES (100 À 399)
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div class="p-3 bg-white border-[3px] border-black">
                <div class="font-bold uppercase mb-1">SÉRIE 100 (NATIONALES)</div>
                <p class="text-black/70 leading-relaxed">
                  Grands tronçons interrégionaux.<br/><br/>
                  • <strong>Route 132 :</strong> Rive-Sud.<br/>
                  • <strong>Route 138 :</strong> Rive-Nord.
                </p>
              </div>

              <div class="p-3 bg-white border-[3px] border-black">
                <div class="font-bold uppercase mb-1">SÉRIE 200 (RÉGIONALES SUD)</div>
                <p class="text-black/70 leading-relaxed">
                  Réseau collecteur secondaire situé <strong>au sud</strong> du fleuve Saint-Laurent.
                </p>
              </div>

              <div class="p-3 bg-white border-[3px] border-black">
                <div class="font-bold uppercase mb-1">SÉRIE 300 (RÉGIONALES NORD)</div>
                <p class="text-black/70 leading-relaxed">
                  Réseau collecteur secondaire situé <strong>au nord</strong> du fleuve Saint-Laurent.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 bg-[#F0F0F0] border-t-[3px] border-black flex items-center justify-between font-mono text-xs shrink-0">
          <span class="text-black/70 uppercase">RÉFÉRENCE : MINISTÈRE DES TRANSPORTS DU QUÉBEC</span>
          <button
            @click="emit('close')"
            class="px-5 py-2 bg-black hover:bg-white text-white hover:text-black border-[3px] border-black font-bold uppercase tracking-[2px] transition-colors cursor-pointer"
          >
            FERMER
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
