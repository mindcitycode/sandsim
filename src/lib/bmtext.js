import { loadImage } from "./image"

export const Writer = async () => {
    const image = await loadImage('/assets/4x4.png')
    const side = 4
    const stride = image.width / side
    const source = character => {
        const code = character.charCodeAt(0)
        const n = code - 32
        const i = n % stride
        const j = Math.floor(n / stride)
        const x = i * side
        const y = j * side
        return [x, y, side, side]
    }
    return (ctx, x, y, character) => ctx.drawImage(image, ...source(character), x, y, side, side)
}
// usage 
/*
const xx = async () => {
    const write = await Writer()
    const helloworld = 'Hello World, ABC, 123 ! OO'
    helloworld.split('').forEach( (c,i) => {
        write(ctx,10+i*4,10,c)
    })   
}
xx()
*/