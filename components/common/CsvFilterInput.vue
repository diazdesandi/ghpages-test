<script setup lang="ts">
import { Input } from "@/components/ui";
import { type Table } from "@tanstack/vue-table";

defineProps<{
  table: Table<any>;
  filterColumnKey?: string;
}>();
</script>

<template>
  <Input
    v-if="filterColumnKey"
    class="max-w-sm"
    :placeholder="`Filter ${filterColumnKey}...`"
    :model-value="table.getColumn(filterColumnKey)?.getFilterValue() as string"
    @update:model-value="
      table.getColumn(filterColumnKey)?.setFilterValue($event)
    "
  />
</template> 