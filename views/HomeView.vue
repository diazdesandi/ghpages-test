<script setup lang="ts">
import { TabsComponent, CsvComponent, FileHandler } from "@/components/common";
import { useStore } from "@/store/useStore";

const store = useStore();

const tabs = [
  { name: "Results", component: CsvComponent },
  { name: "CSV 1", component: CsvComponent, csvData: () => store.csv1 },
  { name: "CSV 2", component: CsvComponent, csvData: () => store.csv2 },
];
</script>
<template>
  <div class="flex flex-col px-5 py-4">
    <TabsComponent :tabs="tabs" />
  </div>
  <div class="flex flex-row gap-4">
    <h2 class="text-lg font-bold">Upload CSV Files</h2>
    <div class="flex flex-row gap-4">
      <p class="text-sm text-gray-500">CSV 1</p>
      <FileHandler target="csv1" />
    </div>
    <div class="flex flex-row gap-4">
      <p class="text-sm text-gray-500">CSV 2</p>
      <FileHandler target="csv2" />
    </div>
  </div>
</template>
