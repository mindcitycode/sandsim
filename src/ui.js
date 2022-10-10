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
import './ui.css'
export const createUi = (cols, canvas) => {

    // pointer
    const pointer = { x: 0, y: 0, clicked: false, type: 1, shape: 0 }
    document.body.addEventListener('mousemove', e => canvasMousePosition(canvas, e, pointer))
    document.body.addEventListener('mousedown', e => pointer.clicked = true)
    document.body.addEventListener('mouseup', e => pointer.clicked = false)

    const Separator = () => {
        const e = document.createElement('div')
        e.classList.add('separator')
        return e
    }

    const toolbar = document.createElement('div')
    toolbar.classList.add('toolbar')
    document.body.append(toolbar)
 
 
    const frameTimer = FrameTimer()
    {
        toolbar.append(frameTimer.canvas)
        frameTimer.update()
    }
    toolbar.append(Separator())
    {

        pointerShapes.forEach((k, i) => {
            const button = document.createElement('button')
            button.classList.add('shape')
            button.textContent = k.symbol
            button.onclick = () => pointer.shape = i
            toolbar.append(button)
        })
    }
    toolbar.append(Separator())
    {
        cols.forEach((col, i) => {
            if (col) {
                const button = document.createElement('button')
                const [r, g, b] = col
                button.textContent = "."
                button.style['background-color'] = `rgb(${r},${g},${b})`
                button.onclick = () => pointer.type = i
                toolbar.append(button)
            }
        })
        toolbar.append(Separator())
        {
            const info = document.createElement('span')
            info.id = 'particle-count'
            info.setCount = count => info.textContent = `${count} particles`
            info.setCount(0)
            toolbar.append(info)
        }

    }
    return {
        frameTimer,
        pointer,
        setParticleCount: count => document.getElementById('particle-count').setCount(count)
    }
}