<script setup lang="ts">
import { CsvComponent, FileHandler } from "@/components/common";
import { useStore } from "@/store/useStore";
import { useTabs } from "@/composables/components/useTabs";
import { computed, watch, nextTick } from "vue";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"
import { XIcon } from "lucide-vue-next";
import ComparisonOptions from '@/components/common/ComparisonOptions.vue'
import { ArrowRight } from 'lucide-vue-next';

const store = useStore();
const { tabs, activeTabId, activeTab, addTab, setActiveTab, addResultsTab, removeTab } = useTabs();

const comparisonResult = computed(() => {
  const { target1, target2 } = store.selectedTargets;
  if (target1 && target2) {
    return store.compareCsv(target1, target2);
  }
  return null;
});

const intersectionResult = computed(() => {
  const { target1, target2 } = store.selectedTargets;
  if (target1 && target2) {
    return store.getIntersection(target1, target2);
  }
  return null;
});

watch(
  activeTab,
  (newTab) => {
    if (newTab) {
      setActiveTab(newTab.id);
    }
  },
  { immediate: true }
);

// Add default tabs for comparison and intersection results
watch(
  tabs,
  async (newTabs) => {
    // Wait for the DOM to update before setting the active tab
    await nextTick();
    if (newTabs.length > 0 && !activeTabId.value) {
      setActiveTab(newTabs[0].id);
    }
  },
  { deep: true }
);

// Function to handle comparison
const handleCompare = () => {
  if (store.selectedTargets.target1 && store.selectedTargets.target2) {
    addResultsTab();
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100/40 p-8">
    <div class="flex flex-col gap-6">
      <!-- File Upload and Comparison Options Row -->
      <div class="flex gap-4">
        <!-- File Upload Card -->
        <Card class="w-[300px]">
          <CardContent class="p-4">
            <div class="flex flex-col gap-2">
              <h2 class="text-sm font-medium">Upload CSV Files</h2>
              <FileHandler target="csv1" />
            </div>
          </CardContent>
        </Card>

        <!-- Comparison Options -->
        <div class="flex-1">
          <ComparisonOptions />
        </div>
      </div>

      <!-- Tabs Card -->
      <Card v-if="tabs.length > 0">
        <CardContent class="p-6">
          <Tabs
            :model-value="activeTabId?.toString()"
            @update:model-value="(value) => setActiveTab(value)"
            class="w-full"
          >
            <TabsList class="w-full">
              <TabsTrigger
                v-for="tab in tabs"
                :key="tab.id"
                :value="tab.id"
                class="flex items-center gap-2"
              >
                {{ tab.name }}
                <button
                  @click.stop="removeTab(tab.id)"
                  class="inline-flex h-4 w-4 items-center justify-center rounded-sm opacity-70 hover:opacity-100"
                >
                  <XIcon class="h-3 w-3" />
                </button>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              v-for="tab in tabs"
              :key="tab.id"
              :value="tab.id"
              class="mt-4"
            >
              <div class="rounded-lg border bg-card p-6 shadow-sm">
                <!-- Show comparison results for results tab -->
                <div v-if="tab.target === 'results' && comparisonResult">
                  <h3 class="mb-4 text-lg font-semibold">Comparison Results</h3>
                  <div class="space-y-4">
                    <div v-if="comparisonResult.onlyInCsv1.length">
                      <h4 class="mb-2 font-medium">Only in First File:</h4>
                      <CsvComponent :csv-data="comparisonResult.onlyInCsv1.join('\n')" />
                    </div>
                    <div v-if="comparisonResult.onlyInCsv2.length">
                      <h4 class="mb-2 font-medium">Only in Second File:</h4>
                      <CsvComponent :csv-data="comparisonResult.onlyInCsv2.join('\n')" />
                    </div>
                  </div>
                </div>
                <!-- Show CSV content for regular tabs -->
                <div v-else>
                  <CsvComponent :csv-data="store[tab.target]" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style>
.bg-gray-100\/40 {
  background-color: rgb(243 244 246 / 0.4);
}
</style>
