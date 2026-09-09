<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

type GuideTab = 'all' | 'orientation' | 'autoroutes' | 'routes' | 'signaux';
const activeTab = ref<GuideTab>('all');

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
      class="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 select-none"
    >
      <!-- Modal Backdrop -->
      <div
        @click="emit('close')"
        class="fixed inset-0 bg-black/80 transition-opacity"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-4xl bg-white border-[5px] border-black overflow-hidden flex flex-col max-h-[94vh] z-10"
      >
        <!-- Header -->
        <div class="px-4 sm:px-6 py-3.5 bg-black text-white flex items-center justify-between border-b-[3px] border-black shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 bg-white text-black font-mono font-black text-[10px] uppercase">
                DOC // MTQ
              </span>
              <h2
                class="text-base sm:text-xl font-black uppercase tracking-tight"
                style="font-family: var(--font-headline)"
              >
                GUIDE DE NUMÉROTATION DU RÉSEAU ROUTIER
              </h2>
            </div>
            <p class="text-[11px] sm:text-xs font-mono text-white/70 tracking-tight mt-0.5">
              STANDARDS OFFICIELS DU MINISTÈRE DES TRANSPORTS DU QUÉBEC
            </p>
          </div>
          <button
            @click="emit('close')"
            class="px-2.5 py-1 bg-white hover:bg-[#FF0000] text-black hover:text-white border-2 border-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            [X]
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex flex-wrap items-center gap-1 p-2 sm:px-6 bg-[#E5E5E5] border-b-[3px] border-black text-xs font-mono font-bold shrink-0">
          <button
            @click="activeTab = 'all'"
            :class="[
              'px-2.5 py-1 border-2 border-black uppercase text-[11px] transition-colors cursor-pointer',
              activeTab === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            TOUT VOIR
          </button>
          <button
            @click="activeTab = 'orientation'"
            :class="[
              'px-2.5 py-1 border-2 border-black uppercase text-[11px] transition-colors cursor-pointer',
              activeTab === 'orientation' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            1. ORIENTATION & FLEUVE
          </button>
          <button
            @click="activeTab = 'autoroutes'"
            :class="[
              'px-2.5 py-1 border-2 border-black uppercase text-[11px] transition-colors cursor-pointer',
              activeTab === 'autoroutes' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            2. AUTOROUTES (1-999)
          </button>
          <button
            @click="activeTab = 'routes'"
            :class="[
              'px-2.5 py-1 border-2 border-black uppercase text-[11px] transition-colors cursor-pointer',
              activeTab === 'routes' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            3. ROUTES (100, 200, 300)
          </button>
          <button
            @click="activeTab = 'signaux'"
            :class="[
              'px-2.5 py-1 border-2 border-black uppercase text-[11px] transition-colors cursor-pointer',
              activeTab === 'signaux' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
            ]"
          >
            4. BOUCLIERS & SORTIES
          </button>
        </div>

        <!-- Body Scrollable Content -->
        <div class="p-4 sm:p-6 overflow-y-auto space-y-8 text-black text-sm">

          <!-- ======================================================== -->
          <!-- SECTION 1: ORIENTATION (PAIRS VS IMPAIRS)                 -->
          <!-- ======================================================== -->
          <div v-if="activeTab === 'all' || activeTab === 'orientation'" class="space-y-4">
            <div class="flex items-center gap-2 border-b-[3px] border-black pb-2">
              <span class="w-4 h-4 bg-black text-white font-mono text-[10px] flex items-center justify-center font-bold">1</span>
              <h3
                class="text-base sm:text-lg font-black uppercase tracking-tight"
                style="font-family: var(--font-headline)"
              >
                ORIENTATION GÉOGRAPHIQUE : L'AXE DU FLEUVE
              </h3>
            </div>

            <p class="font-mono text-xs text-black/80 leading-relaxed">
              La géographie du Québec est dictée par le fleuve Saint-Laurent. Contrairement au réseau américain où les chiffres pairs vont strictement d'ouest en est et les impairs du sud au nord, le Québec oriente ses axes <strong>par rapport à l'écoulement du Saint-Laurent</strong>.
            </p>

            <!-- Graphic: Orientation Diagram -->
            <div class="p-4 bg-[#F5F5F5] border-[3px] border-black space-y-3">
              <div class="flex items-center justify-between font-mono text-[11px] font-bold uppercase border-b-2 border-black pb-1">
                <span>// SCHÉMA CARTOGRAPHIQUE : PAIRS VS IMPAIRS</span>
                <span class="text-black/60">SYSTÈME MTQ</span>
              </div>

              <!-- SVG Diagram -->
              <div class="w-full overflow-x-auto">
                <svg viewBox="0 0 700 230" class="w-full min-w-[550px] h-auto" style="font-family: var(--font-body), system-ui, sans-serif;">
                  <!-- Background grid -->
                  <rect x="0" y="0" width="700" height="230" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
                  <line x1="80" y1="0" x2="80" y2="230" stroke="#F3F4F6" stroke-width="1"/>
                  <line x1="220" y1="0" x2="220" y2="230" stroke="#F3F4F6" stroke-width="1"/>
                  <line x1="380" y1="0" x2="380" y2="230" stroke="#F3F4F6" stroke-width="1"/>
                  <line x1="540" y1="0" x2="540" y2="230" stroke="#F3F4F6" stroke-width="1"/>

                  <!-- Saint-Laurent River stylized path -->
                  <path d="M 40 170 Q 250 145 450 105 T 660 50" fill="none" stroke="#DBEAFE" stroke-width="32"/>
                  <path d="M 40 170 Q 250 145 450 105 T 660 50" fill="none" stroke="#3B82F6" stroke-width="3" stroke-dasharray="8,5"/>
                  <text x="430" y="112" fill="#1D4ED8" font-weight="700" font-size="11" letter-spacing="1" transform="rotate(-15 430 112)">
                    FLEUVE SAINT-LAURENT
                  </text>

                  <!-- Pair Highway (Even) Parallel to River -->
                  <path d="M 50 115 Q 260 90 460 55 T 650 20" fill="none" stroke="#000000" stroke-width="6"/>
                  <!-- Arrow heads -->
                  <polygon points="655,19 638,11 644,23" fill="#000000"/>
                  <polygon points="45,116 62,124 56,112" fill="#000000"/>

                  <!-- Even Axis Badge: Placed above curve with ample space -->
                  <rect x="190" y="55" width="340" height="28" fill="#000000"/>
                  <text x="360" y="74" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="12" letter-spacing="0.5">
                    PAIRS (EST ↔ OUEST) : PARALLÈLES AU FLEUVE
                  </text>

                  <!-- Impair Highway (Odd) Perpendicular to River -->
                  <line x1="150" y1="210" x2="150" y2="25" stroke="#DC2626" stroke-width="6"/>
                  <polygon points="150,18 143,34 157,34" fill="#DC2626"/>
                  <polygon points="150,217 143,201 157,201" fill="#DC2626"/>

                  <!-- Odd Axis Badge: Positioned completely to the right of the line with no overlap -->
                  <rect x="170" y="150" width="340" height="28" fill="#DC2626"/>
                  <text x="340" y="169" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="12" letter-spacing="0.5">
                    IMPAIRS (NORD ↕ SUD) : PERPENDICULAIRES
                  </text>

                  <!-- Cardinal points -->
                  <text x="25" y="215" fill="#6B7280" font-weight="700" font-size="10">OUEST (km 0)</text>
                  <text x="590" y="215" fill="#6B7280" font-weight="700" font-size="10">EST (&rarr; Océan)</text>
                  <text x="165" y="22" fill="#DC2626" font-weight="800" font-size="10">▲ NORD</text>
                  <text x="165" y="222" fill="#DC2626" font-weight="800" font-size="10">▼ SUD (Frontière)</text>
                </svg>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div class="p-3 bg-white border-2 border-black">
                  <div class="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 inline-block mb-1">
                    CHIFFRES PAIRS // EST-OUEST
                  </div>
                  <ul class="text-xs font-mono space-y-1 text-black/80 list-disc list-inside">
                    <li>Parallèles à la trajectoire fluviale.</li>
                    <li>Croissance du sud au nord : A-10 &rarr; A-20 &rarr; A-40 &rarr; A-50.</li>
                    <li>Exemples majeurs : <strong>A-20</strong> (Rive-Sud), <strong>A-40</strong> (Rive-Nord), <strong>A-30</strong> (Ceinture Sud).</li>
                  </ul>
                </div>

                <div class="p-3 bg-white border-2 border-black">
                  <div class="font-bold text-xs uppercase bg-[#DC2626] text-white px-2 py-0.5 inline-block mb-1">
                    CHIFFRES IMPAIRS // NORD-SUD
                  </div>
                  <ul class="text-xs font-mono space-y-1 text-black/80 list-disc list-inside">
                    <li>Perpendiculaires au fleuve ou voies transfrontalières.</li>
                    <li>Croissance de l'ouest vers l'est : A-5 &rarr; A-15 &rarr; A-55 &rarr; A-73 &rarr; A-85.</li>
                    <li>Relient les États-Unis ou l'Ontario aux régions boréales.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- SECTION 2: LES AUTOROUTES (1-99 vs 100-999)               -->
          <!-- ======================================================== -->
          <div v-if="activeTab === 'all' || activeTab === 'autoroutes'" class="space-y-4">
            <div class="flex items-center gap-2 border-b-[3px] border-black pb-2">
              <span class="w-4 h-4 bg-black text-white font-mono text-[10px] flex items-center justify-center font-bold">2</span>
              <h3
                class="text-base sm:text-lg font-black uppercase tracking-tight"
                style="font-family: var(--font-headline)"
              >
                AUTOROUTES : CORRIDORS, ROCADES ET ÉPERONS
              </h3>
            </div>

            <p class="font-mono text-xs text-black/80 leading-relaxed">
              Le numéro d'une autoroute québécoise indique directement sa hiérarchie fonctionnelle et son rôle dans la trame métropolitaine.
            </p>

            <!-- Graphic: Bypass vs Spur -->
            <div class="p-4 bg-[#F5F5F5] border-[3px] border-black space-y-3">
              <div class="font-mono text-[11px] font-bold uppercase border-b-2 border-black pb-1">
                // SCHÉMA : ROCADES (4XX / 6XX) VS ÉPERONS (5XX / 7XX / 9XX)
              </div>

              <div class="w-full overflow-x-auto">
                <svg viewBox="0 0 700 230" class="w-full min-w-[550px] h-auto" style="font-family: var(--font-body), system-ui, sans-serif;">
                  <rect x="0" y="0" width="700" height="230" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>

                  <!-- Main Freeway Spine (A-40) -->
                  <line x1="30" y1="110" x2="670" y2="110" stroke="#000000" stroke-width="7"/>
                  <rect x="220" y="95" width="260" height="30" fill="#000000"/>
                  <text x="350" y="115" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="12">
                    CORRIDOR PRINCIPAL (1 À 99)
                  </text>

                  <!-- Bypass (Rocade) 640 - loops around and rejoins -->
                  <path d="M 120 110 C 180 20, 520 20, 580 110" fill="none" stroke="#2563EB" stroke-width="5"/>
                  <circle cx="120" cy="110" r="5" fill="#000000"/>
                  <circle cx="580" cy="110" r="5" fill="#000000"/>
                  <rect x="200" y="12" width="300" height="26" fill="#2563EB"/>
                  <text x="350" y="29" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="11">
                    ROCADE (PAIR : 4XX, 6XX) // REJOINT L'AXE
                  </text>

                  <!-- Spur (Éperon / Antenne) 520 / 720 - branches off to terminal -->
                  <path d="M 190 110 C 220 165, 290 185, 410 185" fill="none" stroke="#DC2626" stroke-width="5"/>
                  <circle cx="190" cy="110" r="5" fill="#000000"/>
                  <rect x="390" y="170" width="290" height="30" fill="#DC2626"/>
                  <text x="535" y="190" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="11">
                    ÉPERON (IMPAIR : 5XX, 7XX) // TERMINUS
                  </text>
                </svg>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
                <div class="p-3 bg-white border-2 border-black space-y-1">
                  <div class="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 inline-block">
                    1 À 99 : CORRIDORS
                  </div>
                  <p class="text-xs font-mono text-black/80 leading-relaxed">
                    Artères maîtresses interrégionales reliant les grandes métropoles.
                  </p>
                  <div class="text-[11px] font-mono text-black font-bold pt-1">
                    Exemples : A-20, A-40, A-15, A-50, A-55.
                  </div>
                </div>

                <div class="p-3 bg-white border-2 border-black space-y-1">
                  <div class="font-bold text-xs uppercase bg-[#2563EB] text-white px-2 py-0.5 inline-block">
                    4XX / 6XX : ROCADES
                  </div>
                  <p class="text-xs font-mono text-black/80 leading-relaxed">
                    Premier chiffre <strong>pair</strong>. Voie de ceinture ou déviation contournant un centre urbain pour rejoindre l'axe principal.
                  </p>
                  <div class="text-[11px] font-mono text-black font-bold pt-1">
                    Exemples : A-640 (rive-nord de l'A-40), A-440.
                  </div>
                </div>

                <div class="p-3 bg-white border-2 border-black space-y-1">
                  <div class="font-bold text-xs uppercase bg-[#DC2626] text-white px-2 py-0.5 inline-block">
                    5XX / 7XX / 9XX : ÉPERONS
                  </div>
                  <p class="text-xs font-mono text-black/80 leading-relaxed">
                    Premier chiffre <strong>impair</strong>. Pénétrante urbaine ou bretelle reliant un pôle stratégique (centre-ville, aéroport) sans rejoindre l'axe.
                  </p>
                  <div class="text-[11px] font-mono text-black font-bold pt-1">
                    Exemples : A-520 (YUL), A-720 (Montréal), A-973 (Québec).
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- SECTION 3: ROUTES NATIONALES ET RÉGIONALES (100, 200, 300)-->
          <!-- ======================================================== -->
          <div v-if="activeTab === 'all' || activeTab === 'routes'" class="space-y-4">
            <div class="flex items-center gap-2 border-b-[3px] border-black pb-2">
              <span class="w-4 h-4 bg-black text-white font-mono text-[10px] flex items-center justify-center font-bold">3</span>
              <h3
                class="text-base sm:text-lg font-black uppercase tracking-tight"
                style="font-family: var(--font-headline)"
              >
                ROUTES : LA RÈGLE DU FLEUVE (SÉRIES 100, 200, 300)
              </h3>
            </div>

            <p class="font-mono text-xs text-black/80 leading-relaxed">
              Pour le réseau secondaire des routes numérotées, le Ministère applique une règle géographique absolue basée sur les rives du fleuve Saint-Laurent :
            </p>

            <!-- Graphic: River Cutaway Map -->
            <div class="p-4 bg-[#F5F5F5] border-[3px] border-black space-y-3">
              <div class="font-mono text-[11px] font-bold uppercase border-b-2 border-black pb-1">
                // SCHÉMA : ZONAGE DES ROUTES PAR RAPPORT AU FLEUVE
              </div>

              <div class="w-full overflow-x-auto">
                <svg viewBox="0 0 700 180" class="w-full min-w-[550px] h-auto" style="font-family: var(--font-body), system-ui, sans-serif;">
                  <rect x="0" y="0" width="700" height="180" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>

                  <!-- North Zone (Rive-Nord) -->
                  <rect x="15" y="10" width="670" height="46" fill="#F0FDF4" stroke="#16A34A" stroke-width="2"/>
                  <rect x="25" y="18" width="220" height="28" fill="#16A34A"/>
                  <text x="135" y="37" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="12">
                    RIVE-NORD : SÉRIE 300
                  </text>
                  <text x="260" y="37" fill="#15803D" font-weight="800" font-size="12">
                    + ROUTE 138 (COLONNE NORD)
                  </text>

                  <!-- Saint-Laurent River Channel -->
                  <rect x="15" y="64" width="670" height="50" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
                  <text x="350" y="95" text-anchor="middle" fill="#1D4ED8" font-weight="800" font-size="12" letter-spacing="1">
                    FLEUVE SAINT-LAURENT (LIGNE DE SÉPARATION DU RÉSEAU)
                  </text>

                  <!-- South Zone (Rive-Sud) -->
                  <rect x="15" y="122" width="670" height="46" fill="#FEF2F2" stroke="#DC2626" stroke-width="2"/>
                  <rect x="25" y="130" width="220" height="28" fill="#DC2626"/>
                  <text x="135" y="149" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="12">
                    RIVE-SUD : SÉRIE 200
                  </text>
                  <text x="260" y="149" fill="#B91C1C" font-weight="800" font-size="12">
                    + ROUTE 132 (COLONNE SUD)
                  </text>
                </svg>
              </div>

              <!-- Explanation Cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div class="p-3 bg-white border-2 border-black">
                  <div class="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 inline-block mb-1">
                    SÉRIE 100 : NATIONALES
                  </div>
                  <p class="text-xs font-mono text-black/80 leading-relaxed">
                    Tronçons majeurs reliant plusieurs régions administratives ou frontières.
                  </p>
                  <ul class="text-xs font-mono text-black/70 list-disc list-inside mt-2 space-y-1">
                    <li><strong>R-132 :</strong> Tour de la Gaspésie & Rive-Sud.</li>
                    <li><strong>R-138 :</strong> Chemin du Roy & Côte-Nord.</li>
                    <li><strong>R-117 :</strong> Transcanadienne Nord (Abitibi).</li>
                    <li><strong>R-155 / R-175 :</strong> Saguenay / Mauricie.</li>
                  </ul>
                </div>

                <div class="p-3 bg-white border-2 border-black">
                  <div class="font-bold text-xs uppercase bg-[#16A34A] text-white px-2 py-0.5 inline-block mb-1">
                    SÉRIE 300 : RIVE-NORD
                  </div>
                  <p class="text-xs font-mono text-black/80 leading-relaxed">
                    Réseau collecteur régional exclusivement situé <strong>au nord</strong> du fleuve.
                  </p>
                  <ul class="text-xs font-mono text-black/70 list-disc list-inside mt-2 space-y-1">
                    <li><strong>R-329 :</strong> Laurentides (St-Donat).</li>
                    <li><strong>R-344 :</strong> Basses-Laurentides / Oka.</li>
                    <li><strong>R-389 :</strong> Route Manicouagan - Fermont.</li>
                  </ul>
                </div>

                <div class="p-3 bg-white border-2 border-black">
                  <div class="font-bold text-xs uppercase bg-[#DC2626] text-white px-2 py-0.5 inline-block mb-1">
                    SÉRIE 200 : RIVE-SUD
                  </div>
                  <p class="text-xs font-mono text-black/80 leading-relaxed">
                    Réseau collecteur régional exclusivement situé <strong>au sud</strong> du fleuve.
                  </p>
                  <ul class="text-xs font-mono text-black/70 list-disc list-inside mt-2 space-y-1">
                    <li><strong>R-201 :</strong> Valleyfield / Montérégie.</li>
                    <li><strong>R-204 :</strong> Frontière Maine / Chaudière.</li>
                    <li><strong>R-289 :</strong> Témiscouata / Nouveau-Brunswick.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- SECTION 4: BOUCLIERS, SIGNAUX ET SORTIES KILOMÉTRIQUES   -->
          <!-- ======================================================== -->
          <div v-if="activeTab === 'all' || activeTab === 'signaux'" class="space-y-4">
            <div class="flex items-center gap-2 border-b-[3px] border-black pb-2">
              <span class="w-4 h-4 bg-black text-white font-mono text-[10px] flex items-center justify-center font-bold">4</span>
              <h3
                class="text-base sm:text-lg font-black uppercase tracking-tight"
                style="font-family: var(--font-headline)"
              >
                SIGNALISATION, BOUCLIERS ET SORTIES AU KILOMÈTRE
              </h3>
            </div>

            <!-- Authentic Shields Gallery -->
            <div class="p-4 bg-[#F5F5F5] border-[3px] border-black space-y-4">
              <div class="font-mono text-[11px] font-bold uppercase border-b-2 border-black pb-1">
                // LES BOUCLIERS OFFICIELS DU QUÉBEC
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <!-- Shield 1: Autoroute MTQ -->
                <div class="p-3 bg-white border-2 border-black flex flex-col items-center text-center space-y-2">
                  <svg viewBox="0 0 100 110" class="w-16 h-18">
                    <!-- Blue shield with border -->
                    <path d="M10 10 H90 V65 C90 90 50 105 50 105 C50 105 10 90 10 65 Z" fill="#003399" stroke="#000000" stroke-width="3"/>
                    <path d="M14 14 H86 V63 C86 85 50 99 50 99 C50 99 14 85 14 63 Z" fill="#003399" stroke="#FFFFFF" stroke-width="2.5"/>
                    <!-- Red Header -->
                    <path d="M14 14 H86 V36 H14 Z" fill="#EE2726"/>
                    <!-- 3 stylized white fleur-de-lys -->
                    <g fill="#FFFFFF">
                      <!-- Left fleur-de-lys -->
                      <path d="M 28 22 C 28 17, 32 17, 32 17 C 32 17, 36 17, 36 22 C 36 26, 32 29, 32 29 C 32 29, 28 26, 28 22 Z"/>
                      <!-- Center fleur-de-lys -->
                      <path d="M 46 22 C 46 16, 50 16, 50 16 C 50 16, 54 16, 54 22 C 54 27, 50 30, 50 30 C 50 30, 46 27, 46 22 Z"/>
                      <!-- Right fleur-de-lys -->
                      <path d="M 64 22 C 64 17, 68 17, 68 17 C 68 17, 72 17, 72 22 C 72 26, 68 29, 68 29 C 68 29, 64 26, 64 22 Z"/>
                    </g>
                    <!-- Digits -->
                    <text x="50" y="78" text-anchor="middle" fill="#FFFFFF" font-family="'Archivo Black', sans-serif" font-weight="900" font-size="34">
                      20
                    </text>
                  </svg>
                  <div>
                    <span class="font-bold text-xs uppercase block">BOUCLIER AUTOROUTE</span>
                    <span class="text-[10px] font-mono text-black/70">Fond bleu, bandeau rouge, 3 fleurs de lys blanches.</span>
                  </div>
                </div>

                <!-- Shield 2: Route MTQ -->
                <div class="p-3 bg-white border-2 border-black flex flex-col items-center text-center space-y-2">
                  <svg viewBox="0 0 100 100" class="w-16 h-16">
                    <rect x="8" y="8" width="84" height="84" rx="14" fill="#008000" stroke="#000000" stroke-width="3"/>
                    <rect x="12" y="12" width="76" height="76" rx="10" fill="#008000" stroke="#FFFFFF" stroke-width="2.5"/>
                    <line x1="14" y1="36" x2="86" y2="36" stroke="#FFFFFF" stroke-width="2"/>
                    <!-- 3 stylized white fleur-de-lys -->
                    <g fill="#FFFFFF">
                      <path d="M 28 22 C 28 17, 32 17, 32 17 C 32 17, 36 17, 36 22 C 36 26, 32 29, 32 29 C 32 29, 28 26, 28 22 Z"/>
                      <path d="M 46 22 C 46 16, 50 16, 50 16 C 50 16, 54 16, 54 22 C 54 27, 50 30, 50 30 C 50 30, 46 27, 46 22 Z"/>
                      <path d="M 64 22 C 64 17, 68 17, 68 17 C 68 17, 72 17, 72 22 C 72 26, 68 29, 68 29 C 68 29, 64 26, 64 22 Z"/>
                    </g>
                    <!-- Digits -->
                    <text x="50" y="74" text-anchor="middle" fill="#FFFFFF" font-family="'Archivo Black', sans-serif" font-weight="900" font-size="28">
                      138
                    </text>
                  </svg>
                  <div>
                    <span class="font-bold text-xs uppercase block">BOUCLIER ROUTE</span>
                    <span class="text-[10px] font-mono text-black/70">Fond vert officiel, carré arrondi, 3 fleurs de lys.</span>
                  </div>
                </div>

                <!-- Shield 3: Transcanadienne -->
                <div class="p-3 bg-white border-2 border-black flex flex-col items-center text-center space-y-2">
                  <svg viewBox="0 0 100 100" class="w-16 h-16">
                    <rect x="8" y="8" width="84" height="84" rx="10" fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
                    <rect x="12" y="12" width="76" height="76" rx="8" fill="#FFFFFF" stroke="#008000" stroke-width="3"/>
                    <!-- Green maple leaf silhouette -->
                    <path d="M50 20 L55 33 L68 28 L64 42 L78 48 L72 58 L80 66 L64 68 L60 80 L52 74 L50 86 L48 74 L40 80 L36 68 L20 66 L28 58 L22 48 L36 42 L32 28 L45 33 Z" fill="#008000"/>
                    <text x="50" y="58" text-anchor="middle" fill="#FFFFFF" font-family="'Archivo Black', sans-serif" font-weight="900" font-size="18">
                      TCH
                    </text>
                  </svg>
                  <div>
                    <span class="font-bold text-xs uppercase block">TRANSCANADIENNE</span>
                    <span class="text-[10px] font-mono text-black/70">Feuille d'érable verte (A-20, A-40, A-85, R-117).</span>
                  </div>
                </div>

                <!-- Shield 4: Sortie au km -->
                <div class="p-3 bg-white border-2 border-black flex flex-col items-center text-center space-y-2">
                  <svg viewBox="0 0 110 90" class="w-20 h-16">
                    <rect x="5" y="10" width="100" height="70" rx="6" fill="#008000" stroke="#000000" stroke-width="3"/>
                    <rect x="9" y="14" width="92" height="62" rx="4" fill="#008000" stroke="#FFFFFF" stroke-width="2"/>
                    <text x="55" y="36" text-anchor="middle" fill="#FFFFFF" font-family="'Work Sans', sans-serif" font-weight="bold" font-size="12" letter-spacing="1">
                      SORTIE
                    </text>
                    <text x="55" y="66" text-anchor="middle" fill="#FFFFFF" font-family="'Archivo Black', sans-serif" font-weight="900" font-size="24">
                      142
                    </text>
                  </svg>
                  <div>
                    <span class="font-bold text-xs uppercase block">SORTIE = KM</span>
                    <span class="text-[10px] font-mono text-black/70">Numérotation égale au chaînage kilométrique.</span>
                  </div>
                </div>
              </div>

              <!-- Rule explanation: Kilometer based exits -->
              <div class="p-3 bg-white border-2 border-black space-y-2">
                <div class="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 inline-block">
                  LA RÈGLE DES SORTIES KILOMÉTRIQUES DU QUÉBEC
                </div>
                <p class="text-xs font-mono text-black/80 leading-relaxed">
                  Contrairement à certains États ou provinces qui numérotent leurs sorties de manière consécutive (Sortie 1, Sortie 2, Sortie 3...), <strong>le Québec utilise le système kilométrique</strong> :
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div class="p-2 bg-[#F9F9F9] border border-black">
                    <strong>Axes Est-Ouest (ex: A-20) :</strong> Le kilomètre 0 débute à la frontière ontarienne (Rivière-Beaudette) et croît vers l'est. La sortie 142 est située à exactement 142 km de l'Ontario.
                  </div>
                  <div class="p-2 bg-[#F9F9F9] border border-black">
                    <strong>Axes Nord-Sud (ex: A-15, A-55) :</strong> Le kilomètre 0 débute au poste frontalier des États-Unis (Lacolle, Stanstead) et augmente vers le nord.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-4 sm:px-6 py-3 bg-[#F0F0F0] border-t-[3px] border-black flex items-center justify-between font-mono text-xs shrink-0">
          <span class="text-black/70 uppercase text-[10px] sm:text-xs">
            SOURCE : DIRECTION DU RÉSEAU DU MINISTÈRE DES TRANSPORTS ET DE LA MOBILITÉ DURABLE
          </span>
          <button
            @click="emit('close')"
            class="px-5 py-1.5 sm:py-2 bg-black hover:bg-white text-white hover:text-black border-[3px] border-black font-bold uppercase tracking-[2px] transition-colors cursor-pointer text-xs"
          >
            FERMER
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
