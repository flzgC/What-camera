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
 * 将图片适配到目标区域（保持比例，居中裁剪/填充）
 */
function fitImage(
    img: HTMLImageElement,
    targetX: number,
    targetY: number,
    targetW: number,
    targetH: number
) {
    const imgRatio = img.width / img.height
    const targetRatio = targetW / targetH

    let drawX: number
    let drawY: number
    let drawW: number
    let drawH: number

    if (imgRatio > targetRatio) {
        // 图片更宽，按高度适配
        drawH = targetH
        drawW = drawH * imgRatio
        drawX = targetX + (targetW - drawW) / 2
        drawY = targetY
    } else {
        // 图片更高，按宽度适配
        drawW = targetW
        drawH = drawW / imgRatio
        drawX = targetX
        drawY = targetY + (targetH - drawH) / 2
    }

    return { drawX, drawY, drawW, drawH }
}

/**
 * 渲染相框到 Canvas
 * @param imageFile 用户选择的图片文件
 * @param template 选中的模板
 * @param meta EXIF 元数据
 * @returns 渲染完成的 Canvas 元素
 */
export async function renderFrame(
    imageFile: File,
    template: Template,
    meta: PhotoMeta
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    canvas.width = template.width
    canvas.height = template.height

    const ctx = canvas.getContext('2d')!
    if (!ctx) {
        throw new Error('无法获取 Canvas 上下文')
    }

    // 1. 绘制背景
    ctx.fillStyle = template.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. 加载并绘制图片
    const imageUrl = URL.createObjectURL(imageFile)
    try {
        const img = await loadImage(imageUrl)

        const { drawX, drawY, drawW, drawH } = fitImage(
            img,
            template.layout.image.x,
            template.layout.image.y,
            template.layout.image.width,
            template.layout.image.height
        )

        // 可选：绘制阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 4
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.shadowColor = 'transparent'
    } finally {
        URL.revokeObjectURL(imageUrl)
    }

    // 3. 绘制边框
    if (template.frame.borderWidth > 0) {
        ctx.strokeStyle = template.frame.borderColor
        ctx.lineWidth = template.frame.borderWidth
        ctx.strokeRect(
            template.layout.image.x - template.frame.borderWidth / 2,
            template.layout.image.y - template.frame.borderWidth / 2,
            template.layout.image.width + template.frame.borderWidth,
            template.layout.image.height + template.frame.borderWidth
        )
    }

    // 4. 绘制文字块
    for (const block of template.layout.textBlocks) {
        let value = ''

        // 特殊处理：如果是 make, 尝试合并 make 和 model
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

        ctx.font = `${block.fontWeight || 400} ${block.fontSize}px system-ui, sans-serif`
        ctx.fillStyle = block.color
        ctx.textAlign = block.textAlign || 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`${label}${value}`, block.x, block.y)
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
