export interface SumMouseEvent {
    altKey: boolean;
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    metaKey: boolean;
    movementX: number;
    movementY: number;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    relatedTarget: EventTarget | null;
    screenX: number;
    screenY: number;
    shiftKey: boolean;
    x: number;
    y: number;
    target: EventTarget | null;
}

export class mouseCursor {
    #mouseEvTrigger: {
        mousedown: ((e: SumMouseEvent) => void)[]
        mousemove: ((e: SumMouseEvent) => void)[]
        mouseup: ((e: SumMouseEvent) => void)[]
    } = {
            mousedown: [],
            mousemove: [],
            mouseup: [],
        }
    #body: HTMLElement
    constructor(element: HTMLElement) {
        this.#body = element
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
        this.#body.appendChild(mouseCursor)
        const body = this.#body
        function mouseEventMod(e: MouseEvent) {
            const mouseEvent = {
                altKey: e.altKey,
                button: e.button,
                buttons: e.buttons,
                clientX: e.clientX,
                clientY: e.clientY,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                movementX: e.movementX,
                movementY: e.movementY,
                offsetX: e.offsetX,
                offsetY: e.offsetY,
                pageX: e.pageX,
                pageY: e.pageY,
                relatedTarget: e.relatedTarget,
                screenX: e.screenX,
                screenY: e.screenY,
                shiftKey: e.shiftKey,
                x: e.x,
                y: e.y,
                target: e.target
            }
            if (mouseEvent.clientX < 0) mouseEvent.clientX = 0
            if (mouseEvent.clientY < 0) mouseEvent.clientY = 0
            if (mouseEvent.clientX > body.clientWidth) mouseEvent.clientX = body.clientWidth
            if (mouseEvent.clientY > body.clientHeight) mouseEvent.clientY = body.clientHeight
            return mouseEvent
        }
        addEventListener("pointerdown", e => {
            const mouseEvent = mouseEventMod(e)
            for (let i = 0; i !== this.#mouseEvTrigger.mousedown.length; i++) this.#mouseEvTrigger.mousedown[i](mouseEvent)
        })
        addEventListener("pointermove", e => {
            const mouseEvent = mouseEventMod(e)
            mouseCursor.style.top = (mouseEvent.clientY - 25) + "px"
            mouseCursor.style.left = (mouseEvent.clientX - 25) + "px"
            for (let i = 0; i !== this.#mouseEvTrigger.mousemove.length; i++) this.#mouseEvTrigger.mousemove[i](mouseEvent)
        })
        addEventListener("pointerup", e => {
            const mouseEvent = mouseEventMod(e)
            for (let i = 0; i !== this.#mouseEvTrigger.mouseup.length; i++) this.#mouseEvTrigger.mouseup[i](mouseEvent)
        })
    }
    mousedown(callback: (e: MouseEvent) => void) {
        this.#mouseEvTrigger.mousedown.push(callback)
    }
    mousemove(callback: (e: MouseEvent) => void) {
        this.#mouseEvTrigger.mousemove.push(callback)
    }
    mouseup(callback: (e: MouseEvent) => void) {
        this.#mouseEvTrigger.mouseup.push(callback)
    }
}
