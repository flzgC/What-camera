import type { Template } from '../types'

/**
 * 深色现代相框模板
 * 适合夜景和暗调照片
 */
export const darkModern: Template = {
    id: 'dark-modern',
    name: '深色现代',
    width: 1400,
    height: 1000,

    background: '#1A1A1A',

    frame: {
        padding: 60,
        borderColor: '#333333',
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
                x: 80,
                y: 860,
                fontSize: 28,
                color: '#FFFFFF',
                fontWeight: 700,
                fontStyle: 'italic',
                textAlign: 'center'
            },
            {
                key: 'exposureTime',
                x: 250,
                y: 920,
                fontSize: 16,
                color: '#AAAAAA',
                textAlign: 'left'
            },
            {
                key: 'iso',
                x: 500,
                y: 920,
                fontSize: 16,
                color: '#AAAAAA',
                textAlign: 'left'
            },
            {
                key: 'fNumber',
                x: 750,
                y: 920,
                fontSize: 16,
                color: '#AAAAAA',
                textAlign: 'left'
            }
        ]
    }
}
