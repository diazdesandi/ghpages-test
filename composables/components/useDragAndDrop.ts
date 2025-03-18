// useDragAndDrop.ts
import { ref } from 'vue'

export function useDragAndDrop() {
  const isDragging = ref(false)

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = true
  }

  const handleDragLeave = () => {
    isDragging.value = false
  }

  const handleDrop = (event: DragEvent, callback: (file: File) => void) => {
    event.preventDefault()
    isDragging.value = false
    if (event.dataTransfer?.files.length) {
      const droppedFile = event.dataTransfer.files[0]
      callback(droppedFile)
    }
  }

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}