<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import type { Template } from '../types'

const props = defineProps<{
    templates: Template[]
    selectedId: string | null
}>()

const emit = defineEmits<{
    select: [template: Template]
}>()

// 模拟数据用于预览
const previewMeta = {
    make: 'NIKON',
    model: 'Z6 II',
    iso: 100,
    exposureTime: '1/250s',
    fNumber: 2.8,
    focalLength: '50mm',
    createTime: '2024-06-17 15:30'
}

/**
 * 渲染模板预览图到 canvas
 */
async function renderTemplatePreview(canvas: HTMLCanvasElement, template: Template) {
    const scale = canvas.width / template.width
    canvas.width = template.width * scale
    canvas.height = template.height * scale

    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    ctx.scale(scale, scale)

    // 1. 绘制背景
    ctx.fillStyle = template.background
    ctx.fillRect(0, 0, template.width, template.height)

    // 2. 绘制图片占位区（用灰色填充）
    const imgArea = template.layout.image

    // 模拟照片比例，用灰色占位
    ctx.fillStyle = template.background === '#FFFFFF' ? '#F0F0F0' : '#2A2A2A'
    ctx.fillRect(imgArea.x, imgArea.y, imgArea.width, imgArea.height)

    // 绘制边框
    if (template.frame.borderWidth > 0) {
        ctx.strokeStyle = template.frame.borderColor
        ctx.lineWidth = template.frame.borderWidth
        ctx.strokeRect(
            imgArea.x - template.frame.borderWidth / 2,
            imgArea.y - template.frame.borderWidth / 2,
            imgArea.width + template.frame.borderWidth,
            imgArea.height + template.frame.borderWidth
        )
    }

    // 3. 绘制文字块
    for (const block of template.layout.textBlocks) {
        let value = ''

        if (block.key === 'make') {
            value = previewMeta.make || ''
        } else {
            const raw = previewMeta[block.key]
            if (raw !== undefined) {
                value = String(raw)
            }
        }

        if (!value) continue

        const fontStyle = block.fontStyle || 'normal'
        const fontWeight = block.fontWeight || 400
        ctx.font = `${fontStyle} ${fontWeight} ${block.fontSize}px system-ui, sans-serif`
        ctx.fillStyle = block.color
        ctx.textAlign = block.textAlign || 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(value, block.x, block.y)
    }
}

function setCanvasRef(el: unknown, id: string) {
    if (el instanceof HTMLCanvasElement) {
        canvasRefs.value.set(id, el)
    }
}

const canvasRefs = ref<Map<string, HTMLCanvasElement>>(new Map())

onMounted(() => {
    nextTick(() => {
        renderAllPreviews()
    })
})

// 当模板列表变化时重新渲染
watch(() => props.templates, () => {
    nextTick(() => {
        renderAllPreviews()
    })
}, { deep: true })

function renderAllPreviews() {
    props.templates.forEach((template) => {
        const canvas = canvasRefs.value.get(template.id)
        if (canvas) {
            canvas.width = 200
            renderTemplatePreview(canvas, template)
        }
    })
}
</script>

<template>
    <div class="template-selector">
        <h3 class="section-title">选择相框模板</h3>
        <div class="template-grid">
            <div v-for="template in templates" :key="template.id" class="template-card"
                :class="{ active: selectedId === template.id }" @click="emit('select', template)">
                <div class="template-preview-wrapper">
                    <canvas :ref="(el: unknown) => setCanvasRef(el, template.id)" class="template-canvas"
                        :data-template-id="template.id" />
                    <div class="template-label">{{ template.name }}</div>
                </div>
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
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.template-card {
    border: 2px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;
}

.template-card:hover {
    border-color: var(--accent);
}

.template-card.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-bg);
}

.template-preview-wrapper {
    display: flex;
    flex-direction: column;
}

.template-canvas {
    width: 100%;
    aspect-ratio: 7 / 5;
    display: block;
}

.template-label {
    padding: 8px;
    font-size: 14px;
    text-align: center;
    background: var(--bg);
    color: var(--text);
    font-weight: 500;
}
</style>
