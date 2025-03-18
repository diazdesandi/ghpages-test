<script setup lang="ts">
import { useDragAndDrop } from '@/composables/components'
import { useStore } from '@/store/useStore'
import { ref } from 'vue'
import type { Target } from '@/interfaces'
import { useTabs } from '@/composables/components/useTabs'

type FileHandlerProps = {
  target: Target
}

const props = defineProps<FileHandlerProps>()

const store = useStore()
const { addTab } = useTabs()
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop()

const handleFile = async (file: File) => {
  error.value = null
  successMessage.value = null
  
  // Validate file type
  if (!file.name.endsWith('.csv')) {
    error.value = 'Please upload a CSV file'
    return
  }

  console.log(file)
  
  try {
    // Always load into csv1 first, then csv2
    const currentTarget = store.csv1 === null ? 'csv1' : 'csv2';
    await store.loadCsv(file, currentTarget)
    addTab(file.name, currentTarget)
    successMessage.value = `Successfully loaded ${file.name}`;
  } catch (e) {
    error.value = 'Failed to load CSV file'
  }
}
</script>

<template>
  <div 
    class="file-drop-zone"
    :class="{ 
      'dragging': isDragging,
      'success': successMessage,
      'error': error 
    }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="(e) => handleDrop(e, handleFile)"
  >
    <div class="drop-content">
      <p v-if="!error && !successMessage">Drag and drop a CSV file here</p>
      <p v-else-if="successMessage" class="success-message">{{ successMessage }}</p>
      <p v-else class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.file-drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background-color: #f8f8f8;
  cursor: pointer;
}

.dragging {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.error-message {
  color: #f44336;
}

.success {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.success-message {
  color: #4caf50;
}

.dropped-image {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}
</style>