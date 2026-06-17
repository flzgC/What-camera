import type { Template, PhotoMeta } from '../types'

/**
 * 预加载图片为 HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

/**
 * 渲染相框到 Canvas（自适应横向/纵向照片）
 * @param imageFile 用户选择的图片文件
 * @param template 选中的模板（用于样式参考）
 * @param meta EXIF 元数据
 * @returns 渲染完成的 Canvas 元素
 */
export async function renderFrame(
    imageFile: File,
    template: Template,
    meta: PhotoMeta
): Promise<HTMLCanvasElement> {
    const imageUrl = URL.createObjectURL(imageFile)
    let img: HTMLImageElement

    try {
        img = await loadImage(imageUrl)
    } finally {
        URL.revokeObjectURL(imageUrl)
    }

    // 判断照片方向
    const isPortrait = img.height > img.width

    // 信息栏尺寸
    const barSize = 100 // 信息栏尺寸
    const padding = 20  // 信息栏内边距

    let canvasWidth: number
    let canvasHeight: number
    let imageX: number
    let imageY: number
    let barX: number
    let barWidth: number
    let barHeight: number

    if (isPortrait) {
        // 纵向照片：信息栏在右侧
        canvasWidth = img.width + barSize
        canvasHeight = img.height
        imageX = 0
        imageY = 0
        barX = img.width
        barWidth = barSize
        barHeight = canvasHeight
    } else {
        // 横向照片：信息栏在底部
        canvasWidth = img.width
        canvasHeight = img.height + barSize
        imageX = 0
        imageY = 0
        barX = 0
        barWidth = canvasWidth
        barHeight = barSize
    }

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const ctx = canvas.getContext('2d')!
    if (!ctx) {
        throw new Error('无法获取 Canvas 上下文')
    }

    // 1. 绘制背景
    ctx.fillStyle = template.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. 绘制图片（原始尺寸，不裁剪）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    ctx.drawImage(img, imageX, imageY, img.width, img.height)
    ctx.shadowColor = 'transparent'

    // 3. 绘制边框
    if (template.frame.borderWidth > 0) {
        ctx.strokeStyle = template.frame.borderColor
        ctx.lineWidth = template.frame.borderWidth
        ctx.strokeRect(
            imageX - template.frame.borderWidth / 2,
            imageY - template.frame.borderWidth / 2,
            img.width + template.frame.borderWidth,
            img.height + template.frame.borderWidth
        )
    }

    // 4. 绘制文字块（自适应布局）
    const textBlocks = template.layout.textBlocks
    if (isPortrait) {
        // 纵向：文字从上到下排列在右侧信息栏
        let currentY = padding + 10

        for (const block of textBlocks) {
            let value = ''
            if (block.key === 'make') {
                const parts: string[] = []
                if (meta.make) parts.push(meta.make)
                if (meta.model) parts.push(meta.model)
                value = parts.join(' ') || ''
            } else {
                const raw = meta[block.key]
                if (raw !== undefined) {
                    value = String(raw)
                }
            }

            if (!value) continue

            const label = block.label ? `${block.label}: ` : ''
            const fontStyle = block.fontStyle || 'normal'
            const fontWeight = block.fontWeight || 400

            // 缩小字体以适应横向信息栏
            const fontSize = Math.min(block.fontSize, barWidth - padding * 2 - 10)
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px system-ui, sans-serif`
            ctx.fillStyle = block.color
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'

            // 检查是否会超出底部
            if (currentY + fontSize > barHeight - padding) {
                break
            }

            ctx.fillText(label, barX + barWidth / 2, currentY)
            ctx.fillText(value, barX + barWidth / 2, currentY + fontSize + 2)

            currentY += (fontSize + 2) * 2 + 15
        }
    } else {
        // 横向：保持底部布局
        for (const block of textBlocks) {
            let value = ''

            if (block.key === 'make') {
                const parts: string[] = []
                if (meta.make) parts.push(meta.make)
                if (meta.model) parts.push(meta.model)
                value = parts.join(' ') || ''
            } else {
                const raw = meta[block.key]
                if (raw !== undefined) {
                    value = String(raw)
                }
            }

            if (!value) continue

            const label = block.label ? `${block.label}: ` : ''
            const fontStyle = block.fontStyle || 'normal'
            const fontWeight = block.fontWeight || 400
            ctx.font = `${fontStyle} ${fontWeight} ${block.fontSize}px system-ui, sans-serif`
            ctx.fillStyle = block.color
            ctx.textAlign = block.textAlign || 'left'
            ctx.textBaseline = 'top'

            // 计算Y坐标：模板原始Y坐标 + 底部信息栏偏移
            const yOffset = img.height - template.layout.image.height
            ctx.fillText(`${label}${value}`, block.x, block.y + yOffset)
        }
    }

    return canvas
}

/**
 * 导出 Canvas 为图片并触发下载
 * @param canvas 渲染完成的 Canvas
 * @param filename 下载文件名
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename = 'photo-frame.png'): void {
    canvas.toBlob((blob) => {
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        // 清理
        setTimeout(() => {
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }, 100)
    }, 'image/png')
}
