import seedrandom from 'seedrandom';
import { FrameTimer } from './lib/fps.js'
import { canvasMousePosition } from './lib/mouse.js'

const rng = seedrandom('hello.');

export const pointerShapes = [
    {
        symbol: '⬤',
        getPoints: (px, py) => {
            const points = []
            for (let count = 0; count < 10; count++) {
                const a = rng() * Math.PI * 2
                const r = rng() * 5
                const x = Math.floor(px + r * Math.cos(a))
                const y = Math.floor(py + r * Math.sin(a))
                points.push({ x, y })
            }
            return points
        },
    },
    {
        symbol: '⏹',
        getPoints: (px, py) => {
            const points = []
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    const x = px + i - 5
                    const y = py + j - 5
                    points.push({ x, y })
                }
            }
            return points
        }
    }
]

export const createUi = (cols, canvas) => {

    // pointer
    const pointer = { x: 0, y: 0, clicked: false, type: 1, shape: 0 }
    document.body.addEventListener('mousemove', e => canvasMousePosition(canvas, e, pointer))
    document.body.addEventListener('mousedown', e => pointer.clicked = true)
    document.body.addEventListener('mouseup', e => pointer.clicked = false)


    const frameTimer = FrameTimer()
    {
        const toolbar = document.createElement('div')
        toolbar.classList.add('toolbar')
        toolbar.style.display = 'flex'
        toolbar.style.position = 'fixed'
        toolbar.style.width = '100%'
        document.body.append(toolbar)
        {
            const style = document.createElement('style')
            style.textContent = 'div.toolbar button { border : 0px; border-radius : 4px; }'
            toolbar.append(style)
        }
        {
            toolbar.append(frameTimer.canvas)
            frameTimer.update()
        }
        {

            pointerShapes.forEach((k, i) => {
                const button = document.createElement('button')
                button.textContent = k.symbol
                button.style['background-color'] = 'white'
                button.style.width = '30px'
                button.style.height = '30px'
                button.onclick = () => pointer.shape = i
                toolbar.append(button)
            })

            cols.forEach((col, i) => {
                if (col) {
                    const button = document.createElement('button')
                    const [r, g, b] = col
                    button.textContent = "."
                    button.style['background-color'] = `rgb(${r},${g},${b})`
                    button.style.width = '30px'
                    button.style.height = '30px'
                    button.onclick = () => pointer.type = i
                    toolbar.append(button)
                }
            })
            {
                const info = document.createElement('span')
                info.id = 'particle-count'
                info.setCount = count => info.textContent = `${count} particles`
                info.setCount(0)
                info.style.height = '30px'
                info.style['font-family'] = 'monospace'
                info.style.color = 'white'
                toolbar.append(info)
            }

        }
    }
    return {
        frameTimer,
        pointer,
        setParticleCount: count => document.getElementById('particle-count').setCount(count)
    }
}