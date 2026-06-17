import type { Template } from '../types'
import { classicWhite } from './classicWhite'
import { darkModern } from './darkModern'

/**
 * 所有可用模板注册表
 */
export const templates: Template[] = [classicWhite, darkModern]

/**
 * 根据 ID 获取模板
 */
export function getTemplateById(id: string): Template | undefined {
    return templates.find(t => t.id === id)
}
