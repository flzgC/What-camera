<script setup lang="ts">
import type { Template } from '../types'

defineProps<{
  templates: Template[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [template: Template]
}>()
</script>

<template>
  <div class="template-selector">
    <h3 class="section-title">选择相框模板</h3>
    <div class="template-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        :class="{ active: selectedId === template.id }"
        @click="emit('select', template)"
      >
        <div
          class="template-preview"
          :style="{ backgroundColor: template.background }"
        >
          <div
            class="template-frame"
            :style="{
              borderColor: template.frame.borderColor,
              borderWidth: `${template.frame.borderWidth}px`
            }"
          />
        </div>
        <span class="template-name">{{ template.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-selector {
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
  margin-bottom: 16px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: var(--accent);
}

.template-card.active {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.template-preview {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.template-frame {
  width: 70%;
  height: 70%;
  border-style: solid;
  border-radius: 2px;
}

.template-name {
  font-size: 14px;
  color: var(--text);
}
</style>
