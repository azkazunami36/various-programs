//@ts-check

addEventListener("load", () => {
    const keyType = new class {
        constructor() {
            addEventListener("keydown", keyName => { if (!keyName.repeat) this.clicked(keyName.key) })
            addEventListener("keyup", keyName => this.unclicked(keyName.key))
        }
        /**
         * @type {{[keyName: string]: {clicked: boolean,data:any}}}
         */
        #list = {}
        /**
         * @type {(keyName: {keyName: string, clicked: boolean, data:any}) => void} 
         */
        #clickEvent = () => { }
        /**
         * @param {(keyName: {keyName: string, clicked: boolean, data:any}) => void} callback 
         */
        keyChange(callback) { this.#clickEvent = callback }
        /**
         * @param {string} keyName 
         */
        clicked(keyName) {
            if (this.#list[keyName] === undefined) this.#list[keyName] = {
                clicked: false,
                data: {}
            };
            this.#list[keyName].clicked = true
            this.#clickEvent({ keyName: keyName, ...this.#list[keyName] })
        }
        /**
         * @param {string} keyName 
         */
        unclicked(keyName) {
            if (this.#list[keyName] === undefined) this.#list[keyName] = {
                clicked: false,
                data: {}
            };
            this.#list[keyName].clicked = false
            this.#clickEvent({ keyName: keyName, ...this.#list[keyName] })
        }
        /**
         * @param {string} keyName 
         * @returns {boolean}
         */
        isClick(keyName) { return (this.#list[keyName]) ? true : false }
        /**
         * @returns {{[keyName: string]: {clicked: boolean, data: any};}}
         */
        isAllClick() { return this.#list }
    }
    const PlayerClass = class {
        constructor() { }
        /**
         * @type {{x: number, y: number}}
         */
        location = {
            x: 0,
            y: 0
        }
    }
    const setting = {
        speed: 20
    }
    const mainPlayer = new PlayerClass()
    keyType.keyChange(keyName => {
        if (keyName.clicked) {
            keyName.data.clickTime = Date.now()
        }
    })
    let fps = 0
    setInterval(() => {
        const fpsHTML = document.getElementById("fps")
        if (fpsHTML) {
            fpsHTML.innerHTML = String(fps)
            fpsHTML.style.top = String(document.body.clientHeight - fpsHTML.clientHeight)
            fpsHTML.style.left = String(document.body.clientWidth - fpsHTML.clientWidth)
        }
        fps = 0
    }, 1000);
    /**
     * 
     * @param {string} ElementID 
     */
    const getElementById = ElementID => {
        const element = document.getElementById(ElementID)
        if (element) return element
        console.log("エラーが発生しました。Elementが取得できません。")
        return document.createElement("a")
    }
    /**
     * ミリ秒を元に、時間通りにどの速度で進むかを決め、0から始まる相対的な座標を出力します。
     * @param {number} startTime 開始時間を入力してください。ズレる事に座標は変化します。
     * @param {number} speed １秒で移動しきる値を入力してください。100を入れると、１秒で100増えます。
     * @returns 
     */
    const movecalcer = (startTime, speed) => {
        return ((Date.now() - startTime) / 1000) * speed
    };
    const displayManager = new class {
        viewStatusState = true
        fpscalcnow = {
            fps: 0,
            startTime: 0
        }
        fpsState = 0
        constructor() {
            this.windowFresh()
        }
        /**
         * @private
         */
        windowFresh() {
            if ((Date.now() - this.fpscalcnow.startTime) > 1000) {
                this.fpsState = this.fpscalcnow.fps
                this.fpscalcnow = {
                    fps: 0,
                    startTime: Date.now()
                }
            }
            if (this.viewStatusState) window.requestAnimationFrame(() => { this.windowFresh() })
        }
        /**
         * @param {boolean} status
         */
        set viewStatus(status) { this.viewStatusState = status; this.windowFresh() }
        get fpsChange() { return this.fpsState }
    }

})
