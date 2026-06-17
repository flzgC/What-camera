<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { Download, Loading } from '@element-plus/icons-vue'
import { usePhotoFrame } from '../composables/usePhotoFrame'
import { templates } from '../templates'
import ImageUploader from '../components/ImageUploader.vue'
import TemplateSelector from '../components/TemplateSelector.vue'

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
let resizeObserver: ResizeObserver | null = null

/**
 * 根据容器实际尺寸，强制计算并设置 Canvas 的 CSS 显示尺寸（contain 模式）
 */
function fitCanvasToContainer() {
    const canvas = previewCanvas.value
    const container = canvasContainer.value
    if (!canvas || !container) return

    // 获取容器的实际像素尺寸
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return

    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // 计算缩放比例，确保图片完整显示（相当于 CSS object-fit: contain）
    const scaleX = w / imgWidth
    const scaleY = h / imgHeight
    const scale = Math.min(scaleX, scaleY)

    // 计算显示尺寸
    canvas.style.width = `${Math.floor(imgWidth * scale)}px`
    canvas.style.height = `${Math.floor(imgHeight * scale)}px`
    canvas.style.maxWidth = 'none'
    canvas.style.maxHeight = 'none'
}

// 监听 canvas 变化，渲染到 DOM 并启动 ResizeObserver
watch(previewCanvas, async (canvas) => {
    if (canvas && canvasContainer.value) {
        await nextTick()
        canvasContainer.value.innerHTML = ''
        canvas.style.display = 'block'
        canvasContainer.value.appendChild(canvas)

        // 启动 ResizeObserver 监听容器尺寸变化
        if (!resizeObserver) {
            resizeObserver = new ResizeObserver(() => {
                fitCanvasToContainer()
            })
            resizeObserver.observe(canvasContainer.value)
        }

        // 初始计算一次
        await nextTick()
        fitCanvasToContainer()
    }
})

onBeforeUnmount(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
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
        // 如果已有选中模板，自动渲染
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
            <h1 class="app-title">什么相机拍哒！</h1>
            <p class="app-subtitle">本地相框生成器 · 无需上传 · EXIF 自动显示</p>
        </header>

        <main class="app-main">
            <!-- 左侧面板 -->
            <aside class="panel-left">
                <!-- 图片上传 -->
                <div v-if="!imageUrl" class="upload-section">
                    <ImageUploader @upload="onUpload" />
                </div>

                <!-- 已上传图片预览 -->
                <div v-else class="uploaded-section">
                    <img :src="imageUrl" alt="Uploaded" class="uploaded-preview" />

                    <!-- EXIF 信息展示 -->
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

                <!-- 模板选择 -->
                <TemplateSelector v-if="imageUrl" :templates="templates" :selected-id="selectedTemplateId"
                    @select="onSelectTemplate" />
            </aside>

            <!-- 右侧预览面板 -->
            <aside class="panel-right">
                <div v-if="!previewCanvas" class="preview-placeholder">
                    <p>上传图片并选择模板后，预览将在这里显示</p>
                </div>

                <div v-else class="preview-content">
                    <div ref="canvasContainer" class="canvas-container" />

                    <div class="preview-actions">
                        <el-button type="primary" :icon="Download" :loading="isRendering" @click="onExport">
                            下载图片
                        </el-button>
                        <el-button :icon="Download" @click="onReset">
                            重新开始
                        </el-button>
                    </div>
                </div>

                <div v-if="isRendering" class="rendering-overlay">
                    <el-icon :size="32" class="is-loading">
                        <Loading />
                    </el-icon>
                    <p>正在渲染...</p>
                </div>
            </aside>
        </main>
    </div>
</template>

<style scoped>
.app-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
}

.app-header {
    text-align: center;
    margin-bottom: 24px;
    flex-shrink: 0;
}

.app-title {
    font-size: 28px;
    color: var(--text-h);
    margin: 0 0 4px 0;
}

.app-subtitle {
    font-size: 13px;
    color: var(--text);
    margin: 0;
}

.app-main {
    flex: 1;
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 24px;
    min-height: 0;
}

@media (max-width: 1024px) {
    .app-main {
        grid-template-columns: 1fr;
    }
}

.panel-left,
.panel-right {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.upload-section {
    margin-bottom: 24px;
}

.uploaded-section {
    margin-bottom: 24px;
}

.uploaded-preview {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
    border-radius: 8px;
    margin-bottom: 16px;
}

.exif-info h4 {
    font-size: 16px;
    color: var(--text-h);
    margin: 0 0 12px 0;
}

.exif-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.exif-item {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background: var(--accent-bg);
    border-radius: 6px;
}

.exif-item .label {
    font-size: 12px;
    color: var(--text);
}

.exif-item .value {
    font-size: 14px;
    color: var(--text-h);
    font-weight: 500;
}

.preview-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--border);
    border-radius: 8px;
    min-height: 0;
}

.preview-placeholder p {
    color: var(--text);
    text-align: center;
}

.canvas-container {
    flex: 1;
    display: flex;
    min-height: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 12px;
    box-sizing: border-box;
}

.canvas-container canvas {
    max-width: 100% !important;
    max-height: 100% !important;
    width: auto !important;
    height: auto !important;
    display: block;
    min-width: 0 !important;
    min-height: 0 !important;
    object-fit: contain;
    margin: auto;
}

.preview-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-shrink: 0;
    padding: 16px 0 0;
}

.rendering-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 1000;
}

.preview-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    gap: 16px;
    padding: 0 10px;
}
</style>
