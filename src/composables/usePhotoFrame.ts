import { ref } from 'vue'
import type { PhotoMeta, Template } from '../types'
import { parseExif } from '../utils/exif'
import { renderFrame, downloadCanvas } from '../utils/canvas'

/**
 * 核心业务逻辑的 composable
 * 管理图片上传、EXIF 解析、模板选择和渲染导出
 */
export function usePhotoFrame() {
    const imageFile = ref<File | null>(null)
    const imageUrl = ref<string | null>(null)
    const meta = ref<PhotoMeta>({})
    const selectedTemplate = ref<Template | null>(null)
    const isRendering = ref(false)
    const previewCanvas = ref<HTMLCanvasElement | null>(null)

    /**
     * 处理用户上传图片
     */
    async function handleImageUpload(file: File) {
        imageFile.value = file
        imageUrl.value = URL.createObjectURL(file)

        // 解析 EXIF 元数据
        meta.value = await parseExif(file)
    }

    /**
     * 选择模板并渲染
     */
    async function selectAndRender(template: Template) {
        if (!imageFile.value) {
            throw new Error('请先上传图片')
        }

        selectedTemplate.value = template
        isRendering.value = true

        try {
            previewCanvas.value = await renderFrame(
                imageFile.value,
                template,
                meta.value
            )
        } finally {
            isRendering.value = false
        }
    }

    /**
     * 导出并下载图片
     */
    function exportImage(): void {
        if (!previewCanvas.value) {
            throw new Error('没有可导出的渲染结果')
        }
        if (!imageFile.value) {
            throw new Error('原图片文件丢失')
        }
        if (!selectedTemplate.value) {
            throw new Error('未选择模板')
        }

        // 提取原文件名（去掉扩展名）
        const originalName = imageFile.value.name.replace(/\.[^.]+$/, '')
        const templateName = selectedTemplate.value.name

        // 生成文件名：原照片名字-模板名字.png
        const filename = `${originalName}-${templateName}.png`

        downloadCanvas(previewCanvas.value, filename)
    }

    /**
     * 重置状态
     */
    function reset() {
        if (imageUrl.value) {
            URL.revokeObjectURL(imageUrl.value)
        }
        imageFile.value = null
        imageUrl.value = null
        meta.value = {}
        selectedTemplate.value = null
        previewCanvas.value = null
    }

    return {
        imageFile,
        imageUrl,
        meta,
        selectedTemplate,
        isRendering,
        previewCanvas,
        handleImageUpload,
        selectAndRender,
        exportImage,
        reset
    }
}
