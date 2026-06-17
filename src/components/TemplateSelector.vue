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
    const targetWidth = 200
    const scale = targetWidth / template.width

    canvas.width = targetWidth
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
    margin-top: 32px;
}

.section-title {
    font-family: var(--heading);
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 3px;
    color: var(--text-muted);
    margin-bottom: 16px;
    text-transform: uppercase;
}

.template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
}

.template-card {
    position: relative;
    border: 1px solid var(--border-light);
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    background: var(--bg);
}

.template-card:hover {
    border-color: var(--border-accent);
}

.template-card.active {
    border-color: var(--text-h);
}

.template-card.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--text-h);
}

.template-preview-wrapper {
    display: flex;
    flex-direction: column;
}

.template-canvas {
    width: 100%;
    aspect-ratio: 7 / 5;
    display: block;
    background: var(--bg-subtle);
}

.template-label {
    padding: 8px 10px;
    font-size: 10px;
    letter-spacing: 2px;
    text-align: left;
    background: var(--bg);
    color: var(--text-secondary);
    font-weight: 400;
    text-transform: uppercase;
    border-top: 1px solid var(--border-light);
    transition: all 0.2s ease;
}

.template-card:hover .template-label {
    color: var(--text-h);
}
</style>
