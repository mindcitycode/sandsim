export const canvasMousePosition = (canvas, evt, pointer = { x: undefined, y: undefined }) => {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    pointer.x = (evt.clientX - rect.left) * scaleX   // scale mouse coordinates after they have
    pointer.y = (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
}