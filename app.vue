<script setup lang="ts">
import { Header, SideBar } from "@/components/layout";
import { HomeView } from "@/views";
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
