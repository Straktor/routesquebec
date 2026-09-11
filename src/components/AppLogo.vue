<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string;
  }>(),
  {
    size: 36,
  }
);
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    :width="size"
    :height="size"
    class="shrink-0 select-none overflow-visible"
    aria-label="Logo Routes du Québec"
  >
    <!-- Solid Black Quebec Highway Shield -->
    <path d="M 256 32
             C 292 16 334 16 366 42
             C 402 30 442 40 466 74
             C 478 120 478 236 478 274
             C 478 376 372 452 256 486
             C 140 452 34 376 34 274
             C 34 236 34 120 46 74
             C 70 40 110 30 146 42
             C 178 16 220 16 256 32 Z"
          fill="#000000" />

    <!-- White Inner Accent Contour -->
    <path d="M 256 46
             C 288 32 326 32 356 56
             C 390 44 426 54 448 84
             C 458 126 458 232 458 266
             C 458 360 360 430 256 462
             C 152 430 54 360 54 266
             C 54 232 54 126 64 84
             C 86 54 122 44 156 56
             C 186 32 224 32 256 46 Z"
          fill="none"
          stroke="#FFFFFF"
          stroke-width="8" />

    <!-- FLEUR-DE-LYS (Clean, Minimalist White Silhouette) -->
    <g transform="translate(256, 142)">
      <!-- Center Petal -->
      <path d="M 0 -58
               C 8 -38 13 -18 13 -2
               C 13 14 6 24 0 30
               C -6 24 -13 14 -13 -2
               C -13 -18 -8 -38 0 -58 Z"
            fill="#FFFFFF" />

      <!-- Left Petal -->
      <path d="M -7 24
               C -26 20 -52 10 -58 -16
               C -61 -28 -53 -36 -44 -36
               C -33 -36 -27 -25 -22 -12
               C -17 4 -12 16 -3 22 Z"
            fill="#FFFFFF" />

      <!-- Right Petal -->
      <path d="M 7 24
               C 26 20 52 10 58 -16
               C 61 -28 53 -36 44 -36
               C 33 -36 27 -25 22 -12
               C 17 4 12 16 3 22 Z"
            fill="#FFFFFF" />

      <!-- Horizontal Ring Bar -->
      <rect x="-30" y="20" width="60" height="10" fill="#FFFFFF" rx="2" />

      <!-- Base Leaves -->
      <path d="M -14 34
               C -14 48 -24 57 -35 60
               C -20 62 -8 55 -3 44
               C 2 55 14 62 29 60
               C 18 57 8 48 8 34 Z"
            fill="#FFFFFF" />
    </g>

    <!-- HIGHWAY OVERPASS (Clean Minimalist White Pictogram) -->
    <!-- Upper Highway Lines (Receding Under Bridge) -->
    <line x1="222" y1="230" x2="202" y2="280" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />
    <line x1="290" y1="230" x2="310" y2="280" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />

    <!-- Lower Highway Lines (Foreground Exiting Bridge) -->
    <line x1="184" y1="330" x2="134" y2="430" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />
    <line x1="328" y1="330" x2="378" y2="430" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />

    <!-- Center Dashed Line -->
    <line x1="256" y1="234" x2="256" y2="278" stroke="#FFFFFF" stroke-width="8" stroke-dasharray="14 10" stroke-linecap="round" />
    <line x1="256" y1="332" x2="256" y2="430" stroke="#FFFFFF" stroke-width="10" stroke-dasharray="20 14" stroke-linecap="round" />

    <!-- Overpass Horizontal Bridge Deck -->
    <rect x="94" y="286" width="324" height="38" rx="6" fill="#FFFFFF" />
  </svg>
</template>
