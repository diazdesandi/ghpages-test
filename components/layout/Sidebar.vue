<script setup lang="ts">
import { ScanText } from 'lucide-vue-next'
import { Button } from '@/components/ui'
</script>
<template>
  <aside class="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
    <div class="border-b p-2">
      <Button variant="ghost" size="icon" aria-label="Home">
        <ScanText class="size-6 fill-foreground" />
      </Button>
    </div>
  </aside>
</template>