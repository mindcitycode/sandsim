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
const pointer = { x: 0, y: 0 }
document.body.addEventListener('mousemove', e => canvasMousePosition(canvas, e, pointer))
const field = new Array(canvas.width * canvas.height)
const fieldGet = (x, y) => field[x + canvas.width * y]
const fieldSet = (x, y, v) => field[x + canvas.width * y] = v
const fieldMoveTo = (x, y, p) => {
    fieldSet(p.x, p.y, undefined)
    fieldSet(x, y, p)
}


const particles = []

class Particle {
    constructor(type, x, y, dx, dy) {
        Object.assign(this, { type, x, y, dx, dy })
    }
    moveTo(x, y) {
        putPixel(this.x, this.y, 0, 0, 0, 255)
        fieldMoveTo(x, y, this)
        this.x = x
        this.y = y
    }
}


for (let i = 0; i < 1000; i++) {
    const p = new Particle(
        1,
        rndInt(0, canvas.width),
        rndInt(0, canvas.height),
    )
    if (fieldGet(p.x, p.y) === undefined) {
        fieldSet(p.x, p.y, p)
        particles.push(p)
    }
}


rafLoop((delta, time) => {

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (p.type === 1) {
            const isDown = (p.y === (canvas.height - 1))
            if (!isDown) {
                const cell_b = fieldGet(p.x, p.y + 1)
                if (cell_b === undefined) {
                    p.moveTo(p.x, p.y + 1)
                    continue
                }
            }
            const isLeft = (p.y === (canvas.height - 1))
            if (!isLeft) {
                const cell_bl = fieldGet(p.x - 1, p.y + 1)
                if (cell_bl === undefined) {
                    p.moveTo(p.x - 1, p.y + 1)
                    continue
                }
            }
            const isRight = (p.y === (canvas.height - 1))
            if (!isRight) {
                const cell_br = fieldGet(p.x + 1, p.y + 1)
                if (cell_br === undefined) {
                    p.moveTo(p.x + 1, p.y + 1)
                    continue
                }
            }
        }
    }

    // draw bitmap
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        let col
        if (p.type === 1){
            col = [0xe3, 0xdb, 0x65]
        }
        putPixel(p.x, p.y, ...col,255)
    }

    // blit
    //  clear()
    ctx.putImageData(imageData, 0, 0)

})