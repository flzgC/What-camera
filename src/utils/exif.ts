import exifr from 'exifr'
import type { PhotoMeta } from '../types'

/**
 * EXIF 元数据解析缓存
 */
const exifCache = new Map<string, PhotoMeta>()

/**
 * 标准化 EXIF 数据到 PhotoMeta 接口
 */
function normalizeExif(raw: Record<string, unknown>): PhotoMeta {
    const meta: PhotoMeta = {}

    if (raw.Make) {
        meta.make = String(raw.Make).trim()
    }

    if (raw.Model) {
        meta.model = String(raw.Model).trim()
    }

    if (raw.ISO) {
        meta.iso = Number(raw.ISO)
    }

    if (raw.FocalLength) {
        const focal = Number(raw.FocalLength)
        if (!Number.isNaN(focal)) {
            meta.focalLength = `${Math.round(focal)}mm`
        }
    }

    if (raw.ExposureTime) {
        const exposure = Number(raw.ExposureTime)
        if (!Number.isNaN(exposure) && exposure > 0) {
            meta.exposureTime = exposure >= 1
                ? `${exposure}s`
                : `1/${Math.round(1 / exposure)}s`
        }
    }

    if (raw.FNumber) {
        const fNum = Number(raw.FNumber)
        if (!Number.isNaN(fNum)) {
            meta.fNumber = fNum
        }
    }

    if (raw.DateTimeOriginal) {
        const date = raw.DateTimeOriginal instanceof Date
            ? raw.DateTimeOriginal
            : new Date(raw.DateTimeOriginal as string | number)
        if (!Number.isNaN(date.getTime())) {
            meta.createTime = formatDateTime(date)
        }
    }

    return meta
}

/**
 * 格式化日期时间
 */
function formatDateTime(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}`
}

/**
 * 解析图片文件的 EXIF 元数据
 * 每个文件只解析一次，结果被缓存
 * @param file 用户上传的图片文件
 * @returns 标准化的 PhotoMeta 对象
 */
export async function parseExif(file: File): Promise<PhotoMeta> {
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`

    if (exifCache.has(cacheKey)) {
        return exifCache.get(cacheKey)!
    }

    try {
        const raw = await exifr.parse(file)
        const meta = raw ? normalizeExif(raw) : {}
        exifCache.set(cacheKey, meta)
        return meta
    } catch {
        return {}
    }
}

/**
 * 清除 EXIF 缓存
 */
export function clearExifCache(): void {
    exifCache.clear()
}
