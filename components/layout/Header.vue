<script setup lang="ts">
import { DarkModeButton } from "@/components/common";
</script>
<template>
  <header
    class="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4"
  >
    <h1 class="scroll-m-20 text-3xl font-extrabold tracking-tight">
      CSV Comparison
    </h1>
    <div class="ml-auto">
      <DarkModeButton />
    </div>
  </header>
</template>
