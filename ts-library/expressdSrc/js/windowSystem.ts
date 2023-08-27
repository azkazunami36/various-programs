import { wait } from "./handyTool.js"

interface windows {
    element: HTMLElement
    /** 縦の位置 */
    top: number
    /** 横の位置 */
    left: number
    /** 縦の大きさ */
    topSize: number
    /** 横の大きさ */
    leftSize: number
    /** フルスクリーン状態 */
    full: {
        /** フルスクリーンかどうか */
        is: boolean
        /** フルスクリーン前の縦座標の状態 */
        top: number
        /** フルスクリーン前の横座標の状態 */
        left: number
        topSize: number
        leftSize: number
    }
    depth: number
    option?: {
        front?: boolean
        background?: boolean
    }
}

/**
 * # Window System
 * Windowsでいうウィンドウマネージャーの役割をするクラスです。
 * ウィンドウのサイズや位置、重ね合わせなどの処理を管理します。マウス入力などの処理が内蔵されているため、ほぼ自動で管理されます。
 */
export class windowSystem {
    constructor(body: HTMLElement) {
        // マウスイベントです
        addEventListener("pointerdown", e => this.#mousedown(e))
        addEventListener("pointermove", e => this.#mousemove(e))
        addEventListener("pointerup", e => this.#mouseup(e))
        this.#body = body
    }
    /**
     * document.bodyにあたるものです。
     */
    #body: HTMLElement
    /**
     * @typedef {object} windows ウィンドウと見なした、クラスで作成したElementを保管しています。
     * @prop {HTMLElement} element
     * @prop {number} top 縦の位置
     * @prop {number} left 横の位置
     * @prop {number} topSize 縦の大きさ
     * @prop {number} leftSize 横の大きさ
     * @prop {object} full フルスクリーン状態
     * @prop {boolean} full.is フルスクリーンかどうか
     * @prop {number} full.top フルスクリーン前の縦座標の状態
     * @prop {number} full.left フルスクリーン前の横座標の状態
     * @prop {number} full.topSize フルスクリーン前の縦の大きさの状態
     * @prop {number} full.leftSize フルスクリーン前の横の大きさの状態
     * @prop {number} depth ウィンドウの奥行を決定
     * @prop {object} [option] ウィンドウの特別な設定
     * @prop {boolean} [option.front] 最前面に表示するかどうか(タスクバー等)
     * @prop {boolean} [option.background] 最背面に表示するかどうか(背景など)
     */
    /**
     * ウィンドウと見なした、クラスで作成したElementを保管しています。
     * @type {{[name: string]: windows | null}}
     */
    #windows: {[name: string]: windows | undefined} = {}
    /**
     * 移動中のウィンドウのid(識別名)やウィンドウバーからマウスの間のズレを記録します。
     */
    #moveingWindow: {
        /** IDを記録します。 */
        name: string
        /** マウスの間のズレ(縦) */
        top: number
        /** マウスの間のズレ(横) */
        left: number
    } | undefined
    /**
     * サイズ変更中のウィンドウのid(識別名)や変更中の箇所、その位置等を記録します。
     */
    #resizeingWindow: {
        /** ウィンドウの名前 */
        name: string
        /** 選択されたresizeのID名 */
        type: string
        /** 移動前の状態 */
        top: number
        /** 移動前の状態 */
        left: number
        /** 移動前の状態 */
        topSize: number
        /** 移動前の状態 */
        leftSize: number
        /** マウスの間のズレ */
        clientTop: number
        /** マウスの間のズレ */
        clientLeft: number
        clientX: number
        clientY: number
        windowBarLeftLength: number
        windowBarRightLength: number
    } | undefined
    /**
     * ウィンドウの初期位置を記録します。ウィンドウが複数起動した際、ばらばらに配置されるようになります。
     */
    #windowInitPosition = {
        top: 0,
        left: 0
    }
    /**
     * 最大化ボタンを最初から押しているかどうかの判定をします。
     */
    #fullscreenBtn: string | undefined
    /**
     * 最小化ボタンを最初から押しているかどうかの判定をします。
     */
    #miniwindowBtn: string | undefined
    /**
     * 閉じるボタンを最初から押しているかどうかの判定をします。
     */
    #closeBtn: string | undefined
    /**
     * ウィンドウサイズ変更要素のID(ClassName)
     */
    #windowSizeID = {
        /**
         * 中央のウィンドウサイズ変更ID
         * 上側
         */
        top: "window-resize-top-zone",
        /**
         * 中央のウィンドウサイズ変更ID
         * 左側
         */
        left: "window-resize-left-zone",
        /**
         * 中央のウィンドウサイズ変更ID
         * 右側
         */
        right: "window-resize-right-zone",
        /**
         * 中央のウィンドウサイズ変更ID
         * 下側
         */
        bottom: "window-resize-bottom-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 左上側(上)
         */
        topLeft: "window-resize-tL-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 左上側(左)
         */
        leftTop: "window-resize-lT-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 右上側(右)
         */
        rightTop: "window-resize-rT-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 左下側(下)
         */
        bottomLeft: "window-resize-bL-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 右上側(上)
         */
        topRight: "window-resize-tR-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 左下側(左)
         */
        leftBottom: "window-resize-lB-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 右下側(右)
         */
        rightBottom: "window-resize-rB-zone",
        /**
         * 端のウィンドウサイズ変更ID
         * 右下側(下)
         */
        bottomRight: "window-resize-bR-zone"
    }
    /**
     * クリックした時間が記録されます。クリックするたびに更新されます。
     * これは主にダブルクリックの判定に使用されます。
     */
    #clickTime = 0
    /**
     * ウィンドウの位置や状態を全て確認し、更新します。
     * @param {string?} [id] 識別名を指定すると、特定のウィンドウの状態だけ更新します。
     */
    async viewReflash(id) {
        const windows = this.#windows
        /** @param {string} id */
        async function reflash(id) {
            const stat = windows[id]
            if (stat) {
                const style = stat.element.style
                style.top = String(stat.top) + "px"
                style.left = String(stat.left) + "px"
                style.width = String(stat.leftSize) + "px"
                style.height = String(stat.topSize) + "px"
                style.zIndex = String(stat.depth)
            }
        }
        if (id) reflash(id)
        else {
            const ids = Object.keys(windows)
            for (let i = 0; i !== ids.length; i++) {
                const id = ids[i]
                reflash(id)
            }
        }
    }
    /**
     * ウィンドウの重ね合わせを管理します。
     * 機能と独特のデータが多いため、クラス化しました。
     */
    #windowDepthManage = new class {
        constructor(windowSystem: windowSystem) {
            this.#windowSystem = windowSystem
        }
        #depthListTemp: {[num: string]: string} | undefined
        depthList() {
            /**
             * 奥行順にidを並べ替えています。
             * @type {{[num: string]: string}}
             */
            const depthList = {}
            const ids = Object.keys(this.#windowSystem.#windows)
            for (let i = 0; i !== ids.length; i++) {
                const window = this.#windowSystem.#windows[ids[i]]
                if (window && !depthList[String(window.depth)]) depthList[String(window.depth)] = ids[i]
                else {
                    const front = this.#frontID(depthList)
                    if (front) depthList[String(front.num + 1)] = ids[i]
                }
            }
            return depthList
        }
        /**
         * ウィンドウが最も手前にあるものをIDとして返します。
         * @returns 最も手前だったウィンドウのIDと番号を出力します。
         */
        frontID() {
            this.windowDepthChange()
            if (this.#depthListTemp) return this.#frontID(this.#depthListTemp)
        }
        /**
         * depthListからidを元に現状の奥行を取得します。
         */
        getDepth(id: string) {
            this.windowDepthChange()
            if (this.#depthListTemp) return this.#getDepth(this.#depthListTemp, id)
        }
        /**
         * ウィンドウが最も手前にあるものをIDとして返します。
         * @returns 最も手前だったウィンドウのIDと番号を出力します。
         */
        #frontID(depthList: { [num: string]: string }) {
            let num = 0 // 最も手前のウィンドウの値を保存していく
            const depths = Object.keys(depthList)

            // numより手前の値なら上書き
            for (let i = 0; i !== depths.length; i++) if (num < Number(depths[i])) num = Number(depths[i])
            return {
                num,
                id: depthList[String(num)]
            }
        }
        /**
         * depthListからidを元に現状の奥行を取得します。
         */
        #getDepth(depthList: {[num: string]: string}, id: string) {
            const depthLen = Object.keys(depthList)
            for (let i = 0; i !== depthLen.length; i++) if (depthList[depthLen[i]] === id) return depthLen[i]
        }
        /**
         * depthList内の数字と数字の間に間隔がある場合、詰めます
         */
        #packmove(depthList: {[num: string]: string}) {
            const depths = Object.keys(depthList)
            const length = depths.length
            for (let i = 0; i !== length; i++) {
                if (!depthList[String(i)]) {
                    depthList[String(i)] = depthList[depths[i]]
                    delete depthList[depths[i]]
                }
            }
        }
        #windowSystem: windowSystem
        /**
         * ウィンドウの重ね合わせを管理します。
         * @param id 手前にしたいウィンドウを選択します。
         */
        async windowDepthChange(id?: string) {
            const depthList = this.depthList()
            this.#depthListTemp = depthList
            if (id) {
                const nowWindowDepth = this.#getDepth(depthList, id)
                const front = this.#frontID(depthList)
                if (nowWindowDepth && front) {
                    depthList[String(front.num + 1)] = depthList[nowWindowDepth]
                    delete depthList[nowWindowDepth]
                }
            }
            this.#packmove(depthList)
            // 適用
            const depthLen = Object.keys(depthList)
            for (let i = 0; i !== depthLen.length; i++) {
                const window = this.#windowSystem.#windows[depthList[depthLen[i]]]
                if (window) window.depth = Number(depthLen[i])
            }
            this.#windowSystem.viewReflash() // 反映
        }
    }(this)
    /**
     * 触れた要素の親要素がここで管理されているウィンドウであるかどうかを自動で確認します。
     * @param e 触れられた要素を入力
     * @param only マウスで選択された要素が別のWindow System管理のウィンドウでないことを保障
     * @returns 
     */
    #clickWindowId(e: HTMLElement, only?: boolean) {
        /**
         * Elementの仮置き場です。
         */
        let elementTemp: HTMLElement | undefined = e

        // 主にresizewindowゾーンをクリックされている場合に利用
        let id: string | undefined
        if (e.parentElement?.parentElement?.classList.contains("window-master"))
            id = (e.parentElement.parentElement.getElementsByClassName("window-body")[0] as HTMLElement)?.id
        else if (e.parentElement?.parentElement?.parentElement?.classList.contains("window-master"))
            id = (e.parentElement.parentElement.parentElement.getElementsByClassName("window-body")[0] as HTMLElement)?.id
        if (id && this.#windows[id]) return id // 上のifに一致したらリターン

        while (elementTemp) if (elementTemp.parentElement) if (
            elementTemp.parentElement.classList.contains("window-body")
            && !only
            && this.#windows[elementTemp.parentElement.id]
        ) {
            return elementTemp.parentElement.id
        } else elementTemp = elementTemp.parentElement
        else elementTemp = undefined
        return
    }
    /**
     * マウスのクリックイベントの受付です。
     */
    async #mousedown(e: MouseEvent) {
        let doubleClick = (() => {
            const nowTime = Date.now()
            if (nowTime - this.#clickTime < 200) {
                this.#clickTime = 0
                return true
            } else this.#clickTime = nowTime
            return false
        })()
        // ウィンドウドラッグ処理
        const target = (() => { // タイトルバーのクリック範囲を歪ませます。
            const target = e.target as HTMLElement
            if (target) {
                if (target.classList.contains("window-bar-left")) {
                    return target.parentElement as HTMLElement
                }
                if (target.classList.contains("window-title")) {
                    return target.parentElement?.parentElement as HTMLElement
                }
            }
            return target
        })()
        if (target) {
            const tar = target as HTMLElement
            if (tar) {
                const clickWindowId = this.#clickWindowId(tar)
                const clickWindowIdOnly = this.#clickWindowId(tar, true)
                if (target.classList.contains("window-bar") && target.parentElement) {
                    const stat = this.#windows[target.parentElement.id]
                    if (stat) {
                        this.#moveingWindow = {
                            name: target.parentElement.id,
                            top: e.clientY - stat.top,
                            left: e.clientX - stat.left
                        }
                    }
                    if (doubleClick) {
                        if (clickWindowIdOnly) {
                            this.#moveingWindow = null
                            this.fullscreenSetting(clickWindowIdOnly, true)
                        }
                    }
                }
                if (clickWindowId) {
                    this.#windowDepthManage.windowDepthChange(clickWindowId)
                    if (target.classList.contains("window-max")) this.#fullscreenBtn = clickWindowId // ウィンドウ最大化処理
                    if (target.classList.contains("window-min")) this.#miniwindowBtn = clickWindowId // ウィンドウ最大化処理
                    if (target.classList.contains("window-close")) this.#closeBtn = clickWindowId // ウィンドウ最大化処理
                    // ウィンドウサイズ変更処理
                    const windowSizegenre = Object.keys(this.#windowSizeID)
                    const type = (() => {
                        for (let i = 0; i !== windowSizegenre.length; i++)
                            if (target.classList.contains(this.#windowSizeID[windowSizegenre[i]]))
                                return this.#windowSizeID[windowSizegenre[i]]
                        return null
                    })()
                    if (type) {
                        const clickWindowId = this.#clickWindowId(tar, true)
                        if (clickWindowId) {
                            const stat = this.#windows[clickWindowId]
                            if (stat) {
                                const left = assertions.HTMLElement(stat.element.getElementsByClassName("window-bar-left")[0])
                                const right = assertions.HTMLElement(stat.element.getElementsByClassName("window-bar-right")[0])
                                if (left && right) this.#resizeingWindow = {
                                    name: clickWindowId,
                                    type: type,
                                    top: stat.top,
                                    left: stat.left,
                                    topSize: stat.topSize,
                                    leftSize: stat.leftSize,
                                    clientTop: e.clientY - stat.top,
                                    clientLeft: e.clientX - stat.left,
                                    clientX: e.clientX,
                                    clientY: e.clientY,
                                    windowBarLeftLength: left.clientWidth,
                                    windowBarRightLength: right.clientWidth
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * マウスの移動イベントの受付です。
     * @param {MouseEvent} e 
     */
    async #mousemove(e) {
        this.#clickTime = 0
        if (this.#moveingWindow) {
            const stat = this.#windows[this.#moveingWindow.name]
            if (stat) {
                if (stat.full.is) {
                    this.#moveingWindow.top = e.clientY + stat.top + 10
                    if (this.#body.clientWidth / 2 > e.clientX) {
                        this.#moveingWindow.left = e.clientX + stat.left + 11
                    } else if (this.#body.clientWidth / 2 < e.clientX) {
                        this.#moveingWindow.left = (stat.full.leftSize / 2) + 11
                    }
                    console.log(this.#moveingWindow.left)
                    stat.full.top = e.clientY - this.#moveingWindow.top
                    this.fullscreenSetting(this.#moveingWindow.name, true)
                }
                stat.top = e.clientY - this.#moveingWindow.top // 場所を保存
                stat.left = e.clientX - this.#moveingWindow.left // ry
                this.viewReflash(this.#moveingWindow.name)
            }
        } else if (this.#resizeingWindow) {
            const type = this.#resizeingWindow.type
            const ids = this.#windowSizeID
            const stat = this.#windows[this.#resizeingWindow.name]
            if (stat) {
                const rewin = this.#resizeingWindow
                const windowBarLength = 50
                const windowHeightLowLenght = (rewin.windowBarLeftLength + rewin.windowBarRightLength) + 24
                if (
                    type === ids.top
                    || type === ids.topLeft
                    || type === ids.leftTop
                    || type === ids.topRight
                    || type === ids.rightTop
                ) {
                    stat.top = e.clientY - rewin.clientTop
                    stat.topSize = rewin.topSize - (e.clientY - rewin.clientY)
                    if (stat.topSize < windowBarLength) {
                        stat.top = (e.clientY - rewin.clientTop) + (rewin.topSize - (e.clientY - rewin.clientY)) - windowBarLength
                        stat.topSize = windowBarLength
                    }
                }
                if (
                    type === ids.left
                    || type === ids.topLeft
                    || type === ids.leftTop
                    || type === ids.bottomLeft
                    || type === ids.leftBottom
                ) {
                    stat.left = e.clientX - rewin.clientLeft
                    stat.leftSize = rewin.leftSize - (e.clientX - rewin.clientX)
                    if (stat.leftSize < windowHeightLowLenght) {
                        stat.left = (e.clientX - rewin.clientLeft) + (rewin.leftSize - (e.clientX - rewin.clientX)) - windowHeightLowLenght
                        stat.leftSize = windowHeightLowLenght
                    }
                }
                if (
                    type === ids.right
                    || type === ids.bottomRight
                    || type === ids.rightBottom
                    || type === ids.topRight
                    || type === ids.rightTop
                ) {
                    stat.leftSize = this.#resizeingWindow.leftSize + (e.clientX - this.#resizeingWindow.clientX)
                    if (stat.leftSize < windowHeightLowLenght) {
                        stat.leftSize = windowHeightLowLenght
                    }
                }
                if (
                    type === ids.bottom
                    || type === ids.bottomRight
                    || type === ids.rightBottom
                    || type === ids.bottomLeft
                    || type === ids.leftBottom
                ) {
                    stat.topSize = this.#resizeingWindow.topSize + (e.clientY - this.#resizeingWindow.clientY)
                    if (stat.topSize < windowBarLength) {
                        stat.topSize = windowBarLength
                    }
                }
                this.viewReflash(this.#resizeingWindow.name)
            }
        }
    }
    /**
     * マウスのクリック終了イベントの受付です。
     * @param {MouseEvent} e 
     */
    async #mouseup(e) {
        this.#moveingWindow = null // ウィンドウドラッグを終了
        this.#resizeingWindow = null // ウィンドウリサイズを終了
        // フルスクリーンボタンのイベント
        const target = assertions.HTMLElement(e.target)
        if (
            target?.classList.contains("window-max")
            && target.parentElement?.parentElement?.parentElement?.classList.contains("window-body")
        ) {
            const id = target.parentElement.parentElement.parentElement.id
            await this.fullscreenSetting(id)
        } else if (
            target?.classList.contains("window-close")
            && target.parentElement?.parentElement?.parentElement?.classList.contains("window-body")
        ) {
            const id = target.parentElement.parentElement.parentElement.id
            await this.windowClose(id)
        }
        this.#miniwindowBtn = null // 最小化ボタンをリセット
        this.#closeBtn = null // 閉じるボタンをリセット
        this.#fullscreenBtn = null // フルスクリーンボタンをリセット
    }
    /**
     * 
     * @param {string} id 
     * @param {boolean} [buttonnull] ボタンの状況にかかわらず状態を切り替え
     */
    async fullscreenSetting(id, buttonnull) {
        const stat = this.#windows[id]
        if ((id === this.#fullscreenBtn || buttonnull) && stat) if (stat.full.is) {
            stat.full.is = false
            stat.top = stat.full.top
            stat.left = stat.full.left
            stat.topSize = stat.full.topSize
            stat.leftSize = stat.full.leftSize
            const style1 = assertions.HTMLElement(stat.element.getElementsByClassName("window-body")[0])?.style
            const style2 = assertions.HTMLElement(stat.element.getElementsByClassName("window-resize-center")[0])?.style
            if (style1 && style2) {
                style1.borderRadius = ""
                style1.width = ""
                style1.height = ""
                style2.width = ""
                style2.height = ""
            }
            this.viewReflash(id)
            await wait(255)
            if (!stat.full.is) {
                const resizeTop = assertions.HTMLElement(stat.element.getElementsByClassName("window-resize-top")[0])
                const resizeLeft = assertions.HTMLElement(stat.element.getElementsByClassName("window-resize-left")[0])
                const resizeRight = assertions.HTMLElement((() => {
                    const rB = stat.element.getElementsByClassName("window-resize-right")
                    for (let i = 0; i !== rB.length; i++) {
                        const parentElement = rB[i].parentElement
                        if (
                            parentElement?.parentElement?.classList.contains("window-master")
                            && assertions.HTMLElement(parentElement.parentElement.getElementsByClassName("window-body")[0])?.id === id
                        ) return rB[i]
                    }
                })())
                const resizeBottom = assertions.HTMLElement((() => {
                    const rB = stat.element.getElementsByClassName("window-resize-bottom")
                    for (let i = 0; i !== rB.length; i++) {
                        const parentElement = rB[i].parentElement
                        if (
                            parentElement
                            && parentElement.classList.contains("window-master")
                            && assertions.HTMLElement(parentElement.getElementsByClassName("window-body")[0])?.id === id
                        ) return rB[i]
                    }
                })())
                if (resizeTop) resizeTop.style.display = ""
                if (resizeLeft) resizeLeft.style.display = ""
                if (resizeRight) resizeRight.style.display = ""
                if (resizeBottom) resizeBottom.style.display = ""
                stat.element.style.transition = ""
            }
        } else {
            stat.full.is = true
            stat.full.top = stat.top
            stat.full.left = stat.left
            stat.full.topSize = stat.topSize
            stat.full.leftSize = stat.leftSize
            stat.element.style.transition = "all 250ms cubic-bezier(0.67, 0, 0.25, 1) 0s"
            stat.top = 0
            stat.left = 0
            stat.topSize = this.#body.offsetHeight
            stat.leftSize = this.#body.offsetWidth
            const style1 = assertions.HTMLElement(stat.element.getElementsByClassName("window-body")[0])?.style
            const style2 = assertions.HTMLElement(stat.element.getElementsByClassName("window-resize-center")[0])?.style
            if (style1 && style2) {
                style1.borderRadius = "0"
                style1.width = "100%"
                style1.height = "100%"
                style2.width = "100%"
                style2.height = "100%"
            }
            const resizeTop = assertions.HTMLElement(stat.element.getElementsByClassName("window-resize-top")[0])
            const resizeLeft = assertions.HTMLElement(stat.element.getElementsByClassName("window-resize-left")[0])
            const resizeRight = assertions.HTMLElement((() => {
                const rB = stat.element.getElementsByClassName("window-resize-right")
                for (let i = 0; i !== rB.length; i++) {
                    const parentElement = rB[i].parentElement
                    if (
                        parentElement?.parentElement?.classList.contains("window-master")
                        && assertions.HTMLElement(parentElement.parentElement.getElementsByClassName("window-body")[0])?.id === id
                    ) return rB[i]
                }
            })())
            const resizeBottom = assertions.HTMLElement((() => {
                const rB = stat.element.getElementsByClassName("window-resize-bottom")
                for (let i = 0; i !== rB.length; i++) {
                    const parentElement = rB[i].parentElement
                    if (
                        parentElement
                        && parentElement.classList.contains("window-master")
                        && assertions.HTMLElement(parentElement.getElementsByClassName("window-body")[0])?.id === id
                    ) return rB[i]
                }
            })())
            if (resizeTop) resizeTop.style.display = "none"
            if (resizeLeft) resizeLeft.style.display = "none"
            if (resizeRight) resizeRight.style.display = "none"
            if (resizeBottom) resizeBottom.style.display = "none"
            this.viewReflash(id)
        }
    }
    /**
     * ウィンドウを作成します。  
     * Elementを入力する際、予め内容を完成させてから入力すると滑らかな動作、不具合が軽減することがあります。
     * @param {string} name ウィンドウを管理するための名前です。間違えると閉じられなくなります。
     * @param {HTMLElement} element 各自プログラムが管理することの出来るElementを入力します。その周りにウィンドウバーなどを装飾します。
     * @param {object} [option] オプションを指定する
     * @param {object} [option.layout] レイアウトを指定。上から順に適用され、上書きされる。sizeを指定しないといけないオプションもある
     * @param {boolean} [option.layout.center] 中央配置にするか。size必須
     * @param {boolean} [option.layout.widthFull] 横幅を最大まで広げるかどうか
     * @param {boolean} [option.layout.heigthFull] 立幅を最大まで広げるかどうか
     * @param {object} [option.size] ウィンドウサイズを決定
     * @param {number} [option.size.top] 立幅を決める
     * @param {number} [option.size.left] 横幅を決める
     * @param {string} [option.iconURL] ウィンドウにつけるアイコンを指定する
     * @param {string} [option.title] ウィンドウタイトルを決定
     */
    async createWindow(name, element, option) {
        // ウィンドウのメイン
        const master = document.createElement("div")
        master.classList.add("window-master")
        const body = document.createElement("div")
        body.classList.add("window-body")
        body.id = "window" + name

        // ウィンドウバー
        const bar = document.createElement("div")
        bar.classList.add("window-bar")

        // バーの左側
        const barLeft = document.createElement("div")
        barLeft.classList.add("window-bar-left")
        const icon = document.createElement("div")
        icon.classList.add("window-icon")
        const title = document.createElement("div")
        title.classList.add("window-title")

        // バーの右側
        const barRight = document.createElement("div")
        barRight.classList.add("window-bar-right")
        const mini = document.createElement("div")
        mini.classList.add("window-mini")
        mini.innerHTML = "_"
        const max = document.createElement("div")
        max.classList.add("window-max")
        max.innerHTML = "□"
        const close = document.createElement("div")
        close.classList.add("window-close")
        close.innerHTML = "×"

        element.classList.add("window-main")

        // リサイズ用要素
        const windowResizeTop = document.createElement("div")
        windowResizeTop.classList.add("window-resize-top")
        const topLeft = document.createElement("div")
        const top = document.createElement("div")
        const topRight = document.createElement("div")
        topLeft.classList.add(this.#windowSizeID.topLeft)
        top.classList.add(this.#windowSizeID.top)
        topRight.classList.add(this.#windowSizeID.topRight)

        const windowResizeCenter = document.createElement("div")
        windowResizeCenter.classList.add("window-resize-center")

        const windowResizeLeft = document.createElement("div")
        windowResizeLeft.classList.add("window-resize-left")
        const leftTop = document.createElement("div")
        const left = document.createElement("div")
        const leftBottom = document.createElement("div")
        leftTop.classList.add(this.#windowSizeID.leftTop)
        left.classList.add(this.#windowSizeID.left)
        leftBottom.classList.add(this.#windowSizeID.leftBottom)

        const windowResizeRight = document.createElement("div")
        windowResizeRight.classList.add("window-resize-right")
        const rightTop = document.createElement("div")
        const right = document.createElement("div")
        const rightBottom = document.createElement("div")
        rightTop.classList.add(this.#windowSizeID.rightTop)
        right.classList.add(this.#windowSizeID.right)
        rightBottom.classList.add(this.#windowSizeID.rightBottom)

        const windowResizeBottom = document.createElement("div")
        windowResizeBottom.classList.add("window-resize-bottom")
        const bottomLeft = document.createElement("div")
        const bottom = document.createElement("div")
        const bottomRight = document.createElement("div")
        bottomLeft.classList.add(this.#windowSizeID.bottomLeft)
        bottom.classList.add(this.#windowSizeID.bottom)
        bottomRight.classList.add(this.#windowSizeID.bottomRight)

        // ここから統合
        windowResizeTop.appendChild(topLeft)
        windowResizeTop.appendChild(top)
        windowResizeTop.appendChild(topRight)
        windowResizeLeft.appendChild(leftTop)
        windowResizeLeft.appendChild(left)
        windowResizeLeft.appendChild(leftBottom)
        windowResizeRight.appendChild(rightTop)
        windowResizeRight.appendChild(right)
        windowResizeRight.appendChild(rightBottom)
        windowResizeBottom.appendChild(bottomLeft)
        windowResizeBottom.appendChild(bottom)
        windowResizeBottom.appendChild(bottomRight)

        master.appendChild(windowResizeTop)
        master.appendChild(windowResizeCenter)
        master.appendChild(windowResizeBottom)
        windowResizeCenter.appendChild(windowResizeLeft)
        windowResizeCenter.appendChild(body)
        windowResizeCenter.appendChild(windowResizeRight)
        body.appendChild(bar)
        body.appendChild(element)
        bar.appendChild(barLeft)
        bar.appendChild(barRight)
        if (option && option.iconURL) barLeft.appendChild(icon)
        barLeft.appendChild(title)
        barRight.appendChild(mini)
        barRight.appendChild(max)
        barRight.appendChild(close)
        const front = this.#windowDepthManage.frontID()
        // 保存
        this.#windows["window" + name] = {
            element: master,
            top: this.#windowInitPosition.top,
            left: this.#windowInitPosition.left,
            topSize: 400,
            leftSize: 350,
            full: {
                is: false,
                top: 0,
                left: 0,
                topSize: 0,
                leftSize: 0
            },
            depth: front ? front.num + 1 : 50
        }
        this.#windowInitPosition.top += 50
        this.#windowInitPosition.left += 50
        if (option) {
            if (option.size) {
                const window = this.#windows["window" + name]
                if (window) {
                    if (option.size.top) window.topSize = option.size.top
                    if (option.size.left) window.leftSize = option.size.left
                    await this.viewReflash("window" + name)
                }
            }
            if (option.title) title.innerText = option.title
            if (option.layout) {
                if (option.layout.center) {

                }
            }
        }

        // 表示
        this.#body.appendChild(master)
        await wait(20)
        body.classList.add("window-viewed")
    }
    /**
     * 
     * @param {string} id 
     */
    async windowClose(id) {
        const stat = this.#windows[id]
        if (stat) {
            const body = assertions.HTMLElement(stat.element.getElementsByClassName("window-body")[0])
            if (body) body.classList.remove("window-viewed")
            await wait(255)
            this.#body.removeChild(stat.element)
            delete this.#windows[id]
        }
    }
}
