import { fsCanvas } from './lib/fscanvas.js'
import { registerKeyboard } from './lib/keyboard.js'
import { rafLoop } from './lib/loop.js'
import { canvasMousePosition } from './lib/mouse.js'
import seedrandom from 'seedrandom'

const rng = seedrandom('hello.');
const rndInt = (min, max) => min + Math.floor((max - min) * rng())

const canvas = fsCanvas(100, 100)
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const putPixel = (x, y, r, g, b, a) => {
    const offset = 4 * (x + canvas.width * y)
    imageData.data[offset] = r
    imageData.data[offset + 1] = g
    imageData.data[offset + 2] = b
    imageData.data[offset + 3] = a
}
const clear = () => {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
clear()

const inBounds = (x, y) => (x > 0) && (x < canvas.width) && (y > 0) && (y < canvas.height)
const pointer = { x: 0, y: 0, clicked: false, type : 1 }
document.body.addEventListener('mousemove', e => canvasMousePosition(canvas, e, pointer))
document.body.addEventListener('mousedown', e => pointer.clicked = true)
document.body.addEventListener('mouseup', e => pointer.clicked = false)

const field = new Array(canvas.width * canvas.height)
const fieldGet = (x, y) => field[x + canvas.width * y]
const fieldSet = (x, y, v) => field[x + canvas.width * y] = v
const fieldMoveTo = (x, y, p) => {
    fieldSet(p.x, p.y, undefined)
    fieldSet(x, y, p)
}


const particles = []

const cols = [
    undefined,
    [0xe3, 0xdb, 0x65], // sand
    [0x00, 0x00, 0xee] // water
]

{
    cols.forEach((col, i) => {
        if (col) {
            const button = document.createElement('button')
            const [r, g, b] = col
            button.style['background-color'] = `rgb(${r},${g},${b})`
            button.style.width = '30px'
            button.style.height = '30px'
            button.onclick = () => pointer.type = i
            document.body.append(button)
        }
    })
}


class Particle {
    constructor(type, x, y, dx, dy) {
        Object.assign(this, { type, x, y, dx, dy })
    }
    moveTo(x, y) {
        putPixel(this.x, this.y, 0, 0, 0, 255)
        fieldMoveTo(x, y, this)
        this.x = x
        this.y = y
        putPixel(this.x, this.y, ...cols[this.type], 255)
    }
}


for (let i = 0; i < 1000; i++) {
    const p = new Particle(
        rndInt(1, 2),
        rndInt(0, canvas.width),
        rndInt(0, canvas.height),
    )
    if (fieldGet(p.x, p.y) === undefined) {
        fieldSet(p.x, p.y, p)
        particles.push(p)
    }
}

rafLoop((delta, time) => {

    if (pointer.clicked) {
        console.log('click')
        const p = new Particle(
            pointer.type,
            Math.floor(pointer.x),
            Math.floor(pointer.y),
        )
        if (fieldGet(p.x, p.y) === undefined) {
            fieldSet(p.x, p.y, p)
            particles.push(p)
        }
    }

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (p.type === 1) {
            const succ = [
                [p.x, p.y + 1],
                [p.x - 1, p.y + 1],
                [p.x + 1, p.y + 1]
            ]
            for (let s = 0; s < succ.length; s++) {
                const [x, y] = succ[s]
                if (inBounds(x, y)) {
                    if (fieldGet(x, y) === undefined) {
                        p.moveTo(x, y)
                        break;
                    }
                }
            }
        } else if (p.type === 2) {
            const succ = [
                [p.x, p.y + 1],
                [p.x - 1, p.y + 1],
                [p.x + 1, p.y + 1],
                [p.x - 1, p.y],
                [p.x + 1, p.y],
            ]
            for (let s = 0; s < succ.length; s++) {
                const [x, y] = succ[s]
                if (inBounds(x, y)) {
                    if (fieldGet(x, y) === undefined) {
                        p.moveTo(x, y)
                        break;
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0)

})