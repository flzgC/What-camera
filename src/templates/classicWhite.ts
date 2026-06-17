import type { Template } from '../types'

/**
 * 经典白色相框模板
 * 适合大多数照片，简洁优雅
 */
export const classicWhite: Template = {
    id: 'classic-white',
    name: '经典白框',
    width: 1200,
    height: 1600,

    background: '#FFFFFF',

    frame: {
        padding: 80,
        borderColor: '#E0E0E0',
        borderWidth: 2
    },

    layout: {
        image: {
            x: 80,
            y: 80,
            width: 1040,
            height: 1040
        },

        textBlocks: [
            {
                key: 'make',
                x: 600,
                y: 1200,
                fontSize: 24,
                color: '#333333',
                fontWeight: 600,
                textAlign: 'center'
            },
            {
                key: 'model',
                x: 600,
                y: 1240,
                fontSize: 20,
                color: '#666666',
                textAlign: 'center'
            },
            {
                key: 'focalLength',
                x: 200,
                y: 1480,
                fontSize: 18,
                color: '#888888',
                textAlign: 'left'
            },
            {
                key: 'exposureTime',
                x: 600,
                y: 1480,
                fontSize: 18,
                color: '#888888',
                textAlign: 'center'
            },
            {
                key: 'fNumber',
                x: 1000,
                y: 1480,
                fontSize: 18,
                color: '#888888',
                textAlign: 'right'
            },
            {
                key: 'iso',
                x: 200,
                y: 1530,
                fontSize: 18,
                color: '#888888',
                textAlign: 'left'
            },
            {
                key: 'createTime',
                x: 1000,
                y: 1530,
                fontSize: 18,
                color: '#888888',
                textAlign: 'right'
            }
        ]
    }
}
