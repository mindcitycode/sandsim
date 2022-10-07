export const fsCanvas = (width, height) => {
    const vh = 100 * width / height
    const $style = document.createElement('style')
    $style.textContent = `
body { 
    background-color : black;
    margin:0;
    border:0;
    padding : 0;
}
canvas {
    background-color : black;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    width : min(100vw,${vh}vh);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);    
}
`
    document.head.appendChild($style)
    const $c = document.createElement('canvas')
    $c.width = width
    $c.height = height
    document.body.appendChild($c)
    return $c
}