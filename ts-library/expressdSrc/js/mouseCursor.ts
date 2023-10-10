export class mouseCursor {
    constructor (element: HTMLElement) {
        const mouseCursor = document.createElement("div")
        mouseCursor.style.width = "50px"
        mouseCursor.style.height = "50px"
        mouseCursor.style.zIndex = "9999"
        mouseCursor.style.position = "absolute"
        mouseCursor.style.cursor = "none"
        mouseCursor.style.pointerEvents = "none"
        const image = document.createElement("img")
        image.style.filter = "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3)) drop-shadow(-1px 0px 1px rgba(0, 0, 0, 0.1))"
        image.src = "svgIcon/mouseCursor/default.svg"
        mouseCursor.appendChild(image)
        element.appendChild(mouseCursor)
        addEventListener("pointermove", e => {
            mouseCursor.style.top = (e.clientY - 25) + "px"
            mouseCursor.style.left = (e.clientX - 25) + "px"
        })
    }
}
