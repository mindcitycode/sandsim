export const loadImage = src => {
    return new Promise((accept, reject) => {
        const image = new Image()
        image.onload = () => accept(image)
        image.onerror = reject
        image.src = src
    })
}