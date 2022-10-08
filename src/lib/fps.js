export const FrameTimer = (targetMs = 16, maxMs = 16*4) => {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 30
    const ctx = canvas.getContext('2d')
    const msToPx = ms => ms / maxMs * canvas.width
    const update = deltaMs => {

        ctx.fillStyle = 'rgba(0,255,0,0.025)'
        ctx.fillRect(0, 0, msToPx(targetMs), canvas.height)

        ctx.fillStyle = 'rgba(255,0,0,0.025)'
        ctx.fillRect(msToPx(targetMs), 0, canvas.width, canvas.height)

        const deltaX = deltaMs / maxMs * canvas.width
        ctx.fillStyle = 'black'
        ctx.fillRect(deltaX, 0, 1, canvas.height)

    }
    return {
        update,
        canvas
    }
}