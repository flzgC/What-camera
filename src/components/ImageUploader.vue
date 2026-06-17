<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@element-plus/icons-vue'

const emit = defineEmits<{
  upload: [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('upload', file)
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('upload', file)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function triggerFileInput() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    class="uploader"
    :class="{ dragging: isDragging }"
    @click="triggerFileInput"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <el-icon :size="48"><Upload /></el-icon>
    <p class="uploader-text">点击或拖拽上传图片</p>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.uploader:hover,
.uploader.dragging {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.uploader-text {
  margin-top: 16px;
  font-size: 16px;
  color: var(--text);
}
</style>
