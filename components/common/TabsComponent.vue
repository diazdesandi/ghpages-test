<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import type { Component } from "vue";

interface Tab {
  name: string;
  component: Component;
}

const props = defineProps<{
  tabs: Tab[];
}>();

const defaultTab = ref(props.tabs[0].name);
</script>
<template>
  <Tabs :default-value="defaultTab" class="space-y-4">
    <TabsList>
      <TabsTrigger v-for="tab in tabs" :key="tab.name" :value="tab.name">
        {{ tab.name }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.name" :value="tab.name">
      <div class="flex flex-1 flex-col gap-4 px-4 py-10">
        <h1 class="text-xl font-bold">{{ tab.name }}</h1>
        <component :is="tab.component" />
      </div>
    </TabsContent>
  </Tabs>
</template>
