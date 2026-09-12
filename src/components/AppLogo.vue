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
    class="shrink-0 select-none"
    aria-label="Logo Routes du Québec"
  >
    <!-- Solid Black Square -->
    <rect width="512" height="512" fill="#000000" />

    <!-- Clean White Directional Arrow -->
    <path d="M 256 96 L 400 240 L 312 240 L 312 416 L 200 416 L 200 240 L 112 240 Z" fill="#FFFFFF" />
  </svg>
</template>
