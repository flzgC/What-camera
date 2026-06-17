import type { Template } from '../types'

/**
 * 经典白色相框模板
 * 适合大多数照片，简洁优雅
 */
export const classicWhite: Template = {
    id: 'classic-white',
    name: '经典白框',
    width: 1400,
    height: 1000,

    background: '#FFFFFF',

    frame: {
        padding: 60,
        borderColor: '#E0E0E0',
        borderWidth: 1
    },

    layout: {
        image: {
            x: 60,
            y: 60,
            width: 1280,
            height: 720
        },

        textBlocks: [
            {
                key: 'make',
                x: 700,
                y: 860,
                fontSize: 28,
                color: '#333333',
                fontWeight: 700,
                fontStyle: 'italic',
                textAlign: 'center'
            },
            {
                key: 'exposureTime',
                x: 250,
                y: 920,
                fontSize: 16,
                color: '#666666',
                textAlign: 'left'
            },
            {
                key: 'iso',
                x: 500,
                y: 920,
                fontSize: 16,
                color: '#666666',
                textAlign: 'left'
            },
            {
                key: 'fNumber',
                x: 750,
                y: 920,
                fontSize: 16,
                color: '#666666',
                textAlign: 'left'
            }
        ]
    }
}
