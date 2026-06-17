/**
 * 标准化的照片 EXIF 元数据
 * 不直接暴露原始 EXIF 数据
 */
export interface PhotoMeta {
    make?: string
    model?: string
    iso?: number
    focalLength?: string
    exposureTime?: string
    fNumber?: number
    createTime?: string
}

/**
 * 相框模板定义（纯数据驱动）
 */
export interface Template {
    id: string
    name: string
    width: number
    height: number

    // 背景颜色
    background: string

    // 边框定义
    frame: {
        padding: number
        borderColor: string
        borderWidth: number
    }

    // 布局定义
    layout: {
        // 图片位置与尺寸
        image: {
            x: number
            y: number
            width: number
            height: number
        }

        // 文字块定义
        textBlocks: Array<{
            key: keyof PhotoMeta
            label?: string
            x: number
            y: number
            fontSize: number
            color: string
            fontWeight?: number
            textAlign?: CanvasTextAlign
        }>
    }
}
