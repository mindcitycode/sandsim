import { fsCanvas } from './lib/fscanvas.js'
import { registerKeyboard } from './lib/keyboard.js'
import { rafLoop } from './lib/loop.js'
import { canvasMousePosition } from './lib/mouse.js'
import seedrandom from 'seedrandom'
import { clamp } from './lib/clamp.js'
const rng = seedrandom('hello.');
const rndInt = (min, max) => min + Math.floor((max - min) * rng())

const canvas = fsCanvas(200, 200)

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
const pointer = { x: 0, y: 0, clicked: false, type: 1 }
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
    [0xe3, 0xdb, 0x65],  // sand
    [0x00, 0x00, 0xee],  // water
    [0xaa, 0xaa, 0xaa],  // smoke
    [0xff, 0x05, 0x03],  // fire
    [0x85, 0x5E, 0x42],  // wood
    [0x00, 0xff, 0xa0],  // acid
    [0xff, 0xff, 0xff],   // salt
    [0xff, 0xc0, 0xcb],   // gas
    [0x0f, 0xf0, 0xff]   // speed
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
    {
        const info = document.createElement('span')
        info.id = 'particle-count'
        info.setCount = count => info.textContent = `${count} particles`
        info.setCount(0)
        info.style.height = '30px'
        info.style['font-family'] = 'monospace'
        info.style.color = 'white'
        document.body.append(info)
    }
}


class Particle {
    constructor(type, x, y, dx, dy, ttl = -1) {
        Object.assign(this, { type, x, y, dx, dy, ttl })
        this.col = [...cols[this.type]]
        this.col[0] = clamp(this.col[0] + rndInt(-20, 20), 0, 255)
        this.col[1] = clamp(this.col[1] + rndInt(-20, 20), 0, 255)
        this.col[2] = clamp(this.col[2] + rndInt(-20, 20), 0, 255)
    }
    getColor() {
        return this.col
    }
    moveTo(x, y) {
        putPixel(this.x, this.y, 0, 0, 0, 255)
        fieldMoveTo(x, y, this)
        this.x = x
        this.y = y
        putPixel(this.x, this.y, ...this.getColor(), 255)
    }
    kill() {
        putPixel(this.x, this.y, 0, 0, 0, 255)
        fieldSet(this.x, this.y, undefined)
        this.type = 0
    }
    age() {
        if (this.ttl > 0) {
            this.ttl--
            if (this.ttl === 0) {
                this.kill()
            }
        }
    }
    reduceTtl(to) {
        const min = Math.max(1, to)
        if (this.ttl === -1) {
            this.ttl = min
        } else {
            this.ttl = Math.min(this.ttl, min)
        }
    }
    swapWith(other) {
        const ox = other.x
        const oy = other.y
        other.x = this.x
        other.y = this.y
        this.x = ox
        this.y = oy
        fieldSet(this.x, this.y, this)
        fieldSet(other.x, other.y, other)
        putPixel(this.x, this.y, ...this.getColor(), 255)
        putPixel(other.x, other.y, ...other.getColor(), 255)
    }
}


for (let i = 0; i < 0; i++) {
    const p = new Particle(
        rndInt(1, 3),
        rndInt(0, canvas.width),
        rndInt(0, canvas.height),
    )
    if (fieldGet(p.x, p.y) === undefined) {
        fieldSet(p.x, p.y, p)
        particles.push(p)
        p.moveTo(p.x, p.y)
    }
}
rafLoop((delta, time) => {

    if (pointer.clicked) {
        for (let count = 0; count < 10; count++) {
            const ttl = (pointer.type === 3) ? rndInt(30, 90) : (pointer.type === 4) ? rndInt(100, 260) : undefined
            const a = rng() * Math.PI * 2
            const r = rng() * 5
            const x = Math.floor(pointer.x + r * Math.cos(a))
            const y = Math.floor(pointer.y + r * Math.sin(a))
            const dx = (pointer.type === 9) ? (-1 + rng() * 3) : 0
            const dy = (pointer.type === 9) ? (-1 + rng() * 3) : 0
            if (inBounds(x, y)) {
                const p = new Particle(
                    pointer.type,
                    Math.floor(x),
                    Math.floor(y),
                    dx,
                    dy,
                    ttl
                )
                if (fieldGet(p.x, p.y) === undefined) {
                    particles.push(p)
                    p.moveTo(p.x, p.y)
                }
            }
        }
    }

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.age()
        if (p.type === 1) {
            const succ = [
                [p.x, p.y + 1],
                [p.x - 1, p.y + 1],
                [p.x + 1, p.y + 1]
            ]
            let updated = false
            for (let s = 0; s < succ.length; s++) {
                const [x, y] = succ[s]
                if (inBounds(x, y)) {
                    if (fieldGet(x, y) === undefined) {
                        p.moveTo(x, y)
                        break;
                    }
                }
            }
            if (!updated) {
                if (inBounds(p.x, p.y + 1)) {
                    const found = fieldGet(p.x, p.y + 1)
                    if (found && found.type === 2) {
                        if (Math.random() > 0.8)
                            p.swapWith(found)
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
                    const found = fieldGet(x, y)
                    if (found === undefined) {
                        p.moveTo(x, y)
                        break;
                    }
                }
            }
        } if (p.type === 3) {
            const succ = [
                [p.x, p.y - 1],
                [p.x - 1, p.y - 1],
                [p.x + 1, p.y - 1]
            ]
            if (rng() > 0.5) {
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
        } if (p.type === 4) {
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
            {
                // push smoke
                const x = p.x
                const y = p.y - 1
                if (Math.random() > 0.95)
                    if (inBounds(x, y)) {
                        if (fieldGet(x, y) === undefined) {
                            const p_smoke = new Particle(
                                3,
                                x, y,
                                0,
                                0,
                                rndInt(30, 60)
                            )
                            fieldSet(p_smoke.x, p_smoke.y, p_smoke)
                            particles.push(p_smoke)
                        }
                    }
            }
        } else if (p.type === 6) {
            {
                const neigs = [
                    [p.x, p.y + 1],
                    [p.x, p.y - 1],
                ]
                for (let n = 0; n < neigs.length; n++) {
                    const [x, y] = neigs[n]
                    if (inBounds(x, y)) {
                        const nei = fieldGet(x, y)
                        if (nei && nei.type !== 6) {
                            nei.reduceTtl(rndInt(10, 30))
                            p.reduceTtl(rndInt(20, 50))
                            break;
                        }
                    }
                }
            }
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

        } else if (p.type === 7) {
            const succ = [
                [p.x, p.y + 1],
                [p.x - 1, p.y + 1],
                [p.x + 1, p.y + 1]
            ]
            for (let s = 0; s < succ.length; s++) {
                const [x, y] = succ[s]
                if (inBounds(x, y)) {
                    const found = fieldGet(x, y)
                    if (found === undefined) {
                        p.moveTo(x, y)
                        break;
                    } else if (found.type === 2) {
                        // disolve in water
                        p.reduceTtl(rndInt(20, 50))
                    }
                }
            }

        } else if (p.type === 8) {
            const x = p.x + ((rng() > 0.5) ? 1 : -1)
            const y = p.y + ((rng() > 0.75) ? 1 : -1) // tendancy to go up
            if (inBounds(x, y)) {
                if (fieldGet(x, y) === undefined) {
                    p.moveTo(x, y)
                }
            }
        } else if (p.type === 9) {
            p.dy += 0.1
            const x = Math.floor(p.x + p.dx)
            const y = Math.floor(p.y + p.dy)
            if (inBounds(x, y)) {
                const found = fieldGet(x, y)
                if (found === undefined) {
                    p.moveTo(x, y)
                } else if (found.type === 2) {
                    p.type = 2
                }
            }
        }


        if (p.ttl === 0) {
            const currentLast = particles[particles.length - 1]
            particles[i] = currentLast
            particles.length--
            i--
        }


    }

    document.getElementById('particle-count').setCount(particles.length)
    ctx.putImageData(imageData, 0, 0)

})