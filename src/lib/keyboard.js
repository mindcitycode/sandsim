export const registerKeyboard = () => {
    const down = {}
    const onkeydown = e => down[e.code] = true
    const onkeyup = e => down[e.code] = false
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
    return down
}
