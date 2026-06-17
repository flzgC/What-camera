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
  <div class="uploader" :class="{ dragging: isDragging }" @click="triggerFileInput" @drop="handleDrop"
    @dragover="handleDragOver" @dragleave="handleDragLeave">
    <el-icon :size="48">
      <Upload />
    </el-icon>
    <p class="uploader-text">点击或拖拽上传图片</p>
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileSelect" />
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 40px;
  border: 1px dashed var(--border);
  cursor: pointer;
  transition: all 0.25s ease;
  background: var(--bg);
}

/* 背景装饰 */
.uploader::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(154, 109, 255, 0.05) 0%, transparent 50%, rgba(255, 140, 80, 0.05) 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.uploader:hover,
.uploader.dragging {
  border-color: var(--text-muted);
  background: var(--bg-subtle);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.uploader:hover::before,
.uploader.dragging::before {
  opacity: 1;
}

.uploader :deep(.el-icon) {
  color: var(--text-muted);
  transition: color 0.25s ease;
  filter: drop-shadow(0 2px 8px rgba(154, 109, 255, 0.3));
}

.uploader:hover :deep(.el-icon) {
  color: var(--text-light);
  transform: translateY(-3px);
  filter: drop-shadow(0 4px 12px rgba(154, 109, 255, 0.4));
}

.uploader-text {
  margin-top: 16px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-secondary);
  text-transform: uppercase;
  transition: color 0.25s ease;
}

.uploader:hover .uploader-text {
  color: var(--text-h);
}
</style>
