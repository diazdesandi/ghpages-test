<script setup lang="ts">
import { useCsvTable } from "@/composables/components/"; // Import the composable
import CsvFilterInput from "@/components/common/CsvFilterInput.vue";
import CsvColumnVisibilityDropdown from "@/components/common/CsvColumnVisibilityDropdown.vue";
import CsvTable from "@/components/common/CsvTable.vue";
import CsvPaginationControls from "@/components/common/CsvPaginationControls.vue";

const props = defineProps<{
  csvData?: string;
}>();

const { table, filterColumnKey } = useCsvTable(props.csvData);
</script>

<template>
  <div v-if="csvData" class="w-full">
    <div class="flex items-center justify-between py-4">
      <CsvFilterInput :table="table" :filter-column-key="filterColumnKey" />
      <CsvColumnVisibilityDropdown :table="table" />
    </div>
    <CsvTable :table="table" />
    <CsvPaginationControls :table="table" />
  </div>
  <div v-else class="text-center text-gray-500">
    No data available
  </div>
</template>
