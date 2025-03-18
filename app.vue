<script setup lang="ts">
import { Header, SideBar } from "@/components/layout";
import { HomeView } from "@/views";
import { computed } from 'vue';
import FileHandler from '@/components/common/FileHandler.vue';
import Tabs from '@/components/common/Tabs.vue';
import CsvComponent from '@/components/common/CsvComponent.vue';
import { useStore } from '@/store/useStore';
import { useTabs } from './composables/components/useTabs';

const store = useStore();
const { activeTab } = useTabs();

const comparisonResult = computed(() => {
  if (activeTab.value) {
      const tabs = useTabs().tabs.value;
      if (tabs.length < 2) return null;
      return store.compareCsv(tabs[0].target, tabs[1].target);
  }
  return null
});

const intersectionResult = computed(() => {
  if (activeTab.value) {
      const tabs = useTabs().tabs.value;
      if (tabs.length < 2) return null;
      return store.getIntersection();
  }
  return null
});
</script>
<template>
  <div class="grid h-screen w-full pl-[56px]">
    <SideBar />
    <div class="flex flex-col">
      <Header />
      <HomeView />
    </div>
  </div>
</template>
