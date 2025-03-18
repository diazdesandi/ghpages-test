<script setup lang="ts">
import { useTabs } from '@/composables/components/useTabs';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { XIcon } from 'lucide-vue-next'
import { computed } from 'vue';
import CsvComponent from './CsvComponent.vue';

const { tabs, activeTabId, setActiveTab, removeTab } = useTabs();

// Convert activeTabId to string since shadcn expects string values
const modelValue = computed(() => activeTabId.value?.toString() || '');
</script>

<template>
  <Tabs
    :model-value="modelValue"
    @update:model-value="(value) => setActiveTab(Number(value))"
    class="w-[400px]"
  >
    <TabsList class="grid w-full grid-cols-3">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.id"
        :value="tab.id.toString()"
        class="flex items-center gap-2"
      >
        {{ tab.name }}
        <button
          @click.stop="removeTab(tab.id)"
          class="inline-flex h-4 w-4 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <XIcon class="h-3 w-3" />
        </button>
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="tab in tabs"
      :key="tab.id"
      :value="tab.id.toString()"
      class="mt-4"
    >
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <CsvComponent :csv-data="tab.content" />
      </div>
    </TabsContent>
  </Tabs>
</template>

<style scoped>
/* Add some basic styling for tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #ccc;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.tab.active {
  border-color: #ccc;
  border-bottom-color: transparent;
}

.close-tab {
  margin-left: 0.5rem;
  cursor: pointer;
  color: #f00; /* Example: red color for close button */
}
</style> 