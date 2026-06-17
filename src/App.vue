<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Download, Loading } from '@element-plus/icons-vue'
import { usePhotoFrame } from './composables/usePhotoFrame'
import { templates } from './templates'
import ImageUploader from './components/ImageUploader.vue'
import TemplateSelector from './components/TemplateSelector.vue'

const {
  imageUrl,
  meta,
  selectedTemplate,
  isRendering,
  previewCanvas,
  handleImageUpload,
  selectAndRender,
  exportImage,
  reset
} = usePhotoFrame()

const canvasContainer = ref<HTMLDivElement | null>(null)
const selectedTemplateId = ref<string | null>(null)

watch(previewCanvas, async (canvas) => {
  if (canvas && canvasContainer.value) {
    await nextTick()
    canvasContainer.value.innerHTML = ''
    canvas.style.maxWidth = '100%'
    canvas.style.height = 'auto'
    canvasContainer.value.appendChild(canvas)
  }
})

async function onSelectTemplate(template: typeof templates[number]) {
  selectedTemplateId.value = template.id
  try {
    await selectAndRender(template)
  } catch (e) {
    console.error('渲染失败:', e)
  }
}

async function onUpload(file: File) {
  try {
    await handleImageUpload(file)
    if (selectedTemplate.value) {
      await selectAndRender(selectedTemplate.value)
    }
  } catch (e) {
    console.error('上传失败:', e)
  }
}

function onExport() {
  exportImage()
}

function onReset() {
  reset()
  selectedTemplateId.value = null
  if (canvasContainer.value) {
    canvasContainer.value.innerHTML = ''
  }
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">什么相机拍哒</h1>
      <p class="app-subtitle">EXIF 相框生成器</p>
      <div class="divider"></div>
    </header>

    <main class="app-main">
      <aside class="panel-left">
        <div v-if="!imageUrl" class="upload-section">
          <ImageUploader @upload="onUpload" />
        </div>

        <div v-else class="uploaded-section">
          <img :src="imageUrl" alt="Uploaded" class="uploaded-preview" />

          <div v-if="Object.keys(meta).length > 0" class="exif-info">
            <h4>EXIF 信息</h4>
            <div class="exif-grid">
              <div v-if="meta.make" class="exif-item">
                <span class="label">厂商</span>
                <span class="value">{{ meta.make }}</span>
              </div>
              <div v-if="meta.model" class="exif-item">
                <span class="label">型号</span>
                <span class="value">{{ meta.model }}</span>
              </div>
              <div v-if="meta.iso" class="exif-item">
                <span class="label">ISO</span>
                <span class="value">{{ meta.iso }}</span>
              </div>
              <div v-if="meta.focalLength" class="exif-item">
                <span class="label">焦距</span>
                <span class="value">{{ meta.focalLength }}</span>
              </div>
              <div v-if="meta.exposureTime" class="exif-item">
                <span class="label">快门</span>
                <span class="value">{{ meta.exposureTime }}</span>
              </div>
              <div v-if="meta.fNumber" class="exif-item">
                <span class="label">光圈</span>
                <span class="value">f/{{ meta.fNumber }}</span>
              </div>
              <div v-if="meta.createTime" class="exif-item">
                <span class="label">时间</span>
                <span class="value">{{ meta.createTime }}</span>
              </div>
            </div>
          </div>
        </div>

        <TemplateSelector v-if="imageUrl" :templates="templates" :selected-id="selectedTemplateId"
          @select="onSelectTemplate" />
      </aside>

      <aside class="panel-right">
        <div v-if="!previewCanvas" class="preview-placeholder">
          <div class="placeholder-icon">📸</div>
          <p>上传图片并选择模板 <br /> 预览将在这里显示</p>
        </div>

        <template v-else>
          <div class="preview-content">
            <div ref="canvasContainer" class="canvas-container" />
          </div>

          <div class="preview-actions">
            <el-button class="btn btn-primary" :icon="Download" :loading="isRendering" @click="onExport">
              下载图片
            </el-button>
            <el-button class="btn btn-secondary" @click="onReset">
              重新开始
            </el-button>
          </div>
        </template>

        <Transition name="fade">
          <div v-if="isRendering" class="rendering-overlay">
            <el-icon :size="32" class="is-loading">
              <Loading />
            </el-icon>
            <p>正在渲染</p>
          </div>
        </Transition>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 48px 56px;
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  margin-bottom: 56px;
  padding: 24px 0;
}

.app-title {
  font-family: var(--heading);
  font-size: 38px;
  font-weight: 300;
  letter-spacing: 4px;
  margin: 0 0 14px 0;
  color: var(--text-h);
}

.app-subtitle {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 4px;
  color: var(--text-secondary);
  margin: 0;
  text-transform: uppercase;
}

.divider {
  width: 40px;
  height: 1px;
  background: var(--accent);
  margin: 20px auto 0;
  opacity: 0.6;
}

.app-main {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 48px;
  align-items: start;
}

@media (max-width: 1200px) {
  .app-container {
    padding: 36px 28px;
  }

  .app-title {
    font-size: 40px;
  }

  .app-main {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

.panel-left,
.panel-right {
  background: var(--gradient-card);
  border: 1px solid var(--border-light);
  border-radius: 0;
  padding: 32px;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.panel-left::before,
.panel-right::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle at top right, var(--accent-glow), transparent 70%);
  pointer-events: none;
}

.panel-left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-subtle);
  pointer-events: none;
  border-radius: inherit;
}

.upload-section,
.uploaded-section {
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

.uploaded-preview {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  margin-bottom: 20px;
  background: var(--bg-subtle);
}

.exif-info {
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid var(--border-light);
}

.exif-info h4 {
  font-family: var(--heading);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0 0 14px 0;
  color: var(--text-secondary);
}

.exif-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 16px;
}

.exif-item {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  background: var(--bg-raised);
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.exif-item:hover {
  border-color: var(--border-accent);
  transform: translateY(-1px);
}

.exif-item .label {
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 2px;
}

.exif-item .value {
  font-size: 14px;
  font-weight: 300;
  color: var(--text-h);
  font-family: var(--mono);
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  border: 1px solid var(--border-light);
  background: var(--bg);
}

.placeholder-icon {
  font-size: 36px;
  margin-bottom: 16px;
  opacity: 0.2;
  filter: grayscale(1);
}

.preview-placeholder p {
  font-size: 12px;
  text-align: center;
  letter-spacing: 0.8px;
  line-height: 1.8;
  color: var(--text-muted);
}

.preview-content {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.canvas-container {
  overflow: hidden;
  background: var(--bg-subtle);
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.canvas-container img,
.canvas-container canvas {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
  position: relative;
  z-index: 1;
}

.rendering-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.rendering-overlay p {
  margin-top: 16px;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
