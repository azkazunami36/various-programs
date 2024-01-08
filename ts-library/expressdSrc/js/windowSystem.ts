import { wait, ShareData } from "./handyTool.js"
import { SumMouseEvent } from "./mouseCursor.js"
import { temp, windowSizeID } from "./windowSystemCodeHelper/typeDef.js"

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
    /** ウィンドウの深度 */
    depth: number
    /** オプション */
    option?: {
        /** 最前面にするかどうか */
        front?: boolean
        /** 最背面にするかどうか */
        background?: boolean
        /** 最小ウィンドウサイズを決定 */
        minSize?: {
            /** 立幅を決める */
            top?: number
            /** 横幅を決める */
            left?: number
        }
    }
}

interface createWindowOption {
    /** ウィンドウにつけるアイコンを指定する */
    iconURL?: string
    /** ウィンドウタイトルを決定 */
    title?: string
    /** レイアウトを指定。上から順に適用され、上書きされる。sizeを指定しないといけないオプションもある */
    layout?: {
        /** 上下左右を中央配置にするか。sizeパラメータがないと反応しない */
        center?: boolean
        /** 横幅を最大まで広げるかどうか */
        widthFull?: boolean
        /** 立幅を最大まで広げるかどうか */
        heigthFull?: boolean
        /** 最前面にするかどうか */
        front?: boolean
        /** 最背面にするかどうか */
        background?: boolean
        /** 最も下に配置するかどうか */
        under?: boolean
    }
    /** ウィンドウサイズを決定 */
    size?: {
        /** 立幅を決める */
        top?: number
        /** 横幅を決める */
        left?: number
    },
    /** 最小ウィンドウサイズを決定 */
    minSize?: {
        /** 立幅を決める */
        top?: number
        /** 横幅を決める */
        left?: number
    }
    /** ウィンドウバーの設定 */
    windowBarSetting?: {
        /** 最大化ボタンを表示するか。デフォルトはtrue */
        maximumButton?: boolean
        /** 最小化ボタンを表示するか。デフォルトはtrue */
        minimumButton?: boolean
    }
    /** サイズ変更が可能かどうか。デフォルトはtrue */
    sizeChange?: boolean
    /** ウィンドウバーなどの装飾を無効にするかどうか。デフォルトはfalse */
    windowDesignDisabled?: boolean
}

/**
 * # Window System
 * Windowsでいうウィンドウマネージャーの役割をするクラスです。
 * ウィンドウのサイズや位置、重ね合わせなどの処理を管理します。マウス入力などの処理が内蔵されているため、ほぼ自動で管理されます。
 */
export class windowSystem {
    /** document.bodyにあたるものです。 */
    #body: HTMLElement
    /** * ウィンドウと見なした、クラスで作成したElementを保管しています。 */
    #windows: { [name: string]: windows | undefined } = {}
    #windowSizeID = windowSizeID
    /** 様々な情報の一時的な保管場所です。 */
    #temp: temp = {
        windowInitPosition: {
            top: 0,
            left: 0
        },
        clickTime: 0
    }
    /** ウィンドウの重ね合わせを管理します。 機能と独特のデータが多いため、クラス化しました。 */
    #windowDepthManage = new class {
        /** 親クラスへのリンク */
        #windowSystem: windowSystem
        constructor(windowSystem: windowSystem) { this.#windowSystem = windowSystem }
        /** depthList関数で取得したデータを一時保存する。理由は多分負荷軽減のためのキャッシュ */
        #depthListTemp: string[] | undefined
        #ObjectKeys(strings: string[]) {
            const arr: number[] = []
            for (let i = 0; i !== strings.length; i++) if (strings[i] !== undefined) arr.push(i)
            return arr
        }
        depthList() {
            /** 奥行順にidを並べ替えています。 */
            const depthList: string[] = []
            const ids = Object.keys(this.#windowSystem.#windows)
            for (let i = 0; i !== ids.length; i++) { // ウィンドウの数だけ
                const window = this.#windowSystem.#windows[ids[i]]
                if (window && !depthList[window.depth]) depthList[window.depth] = ids[i] // 同じ階層にウィンドウIDが存在しない場合IDを追加
                else { // 存在したら
                    const front = this.#frontID(depthList)
                    if (front) depthList[front.num + 1] = ids[i] // 最も手前より１つ後ろに配置
                }
            }
            return depthList
        }
        /**
         * ウィンドウが最も手前にあるものをIDとして返します。
         * @returns 最も手前だったウィンドウのIDと番号を出力します。
         */
        frontID() {
            if (!this.#depthListTemp) this.windowDepthChange()
            if (this.#depthListTemp) return this.#frontID(this.#depthListTemp)
        }
        /** depthListからidを元に現状の奥行を取得します。 */
        getDepth(id: string) {
            if (!this.#depthListTemp) this.windowDepthChange()
            if (this.#depthListTemp) return this.#getDepth(this.#depthListTemp, id)
        }
        /**
         * ウィンドウが最も手前にあるものをIDとして返します。
         * @returns 最も手前だったウィンドウのIDと番号を出力します。
         */
        #frontID(depthList: string[]) {
            let num = 0 // 最も手前のウィンドウの値を保存していく
            const depths = Object.keys(depthList)
            // numより手前の値なら上書き
            for (let i = 0; i !== depths.length; i++) if (num < Number(depths[i])) num = Number(depths[i])
            return { num, id: depthList[num] }
        }
        /** depthListからidを元に現状の奥行を取得します。 */
        #getDepth(depthList: string[], id: string) {
            const depthLen = this.#ObjectKeys(depthList)
            for (let i = 0; i !== depthLen.length; i++) if (depthList[depthLen[i]] === id) return Number(depthLen[i])
        }
        /** depthList内の数字と数字の間に間隔がある場合、詰めます */
        #packmove(depthList: string[]) {
            const newDepthList: string[] = []
            for (let i = 0; i !== this.#ObjectKeys(depthList).length; i++) if (depthList[i] && depthList[i] !== undefined) newDepthList[newDepthList.length] = depthList[i]
            return newDepthList
        }
        /** 最も手前に移動します */
        #apply(id: string) {
            const depthList = this.depthList()
            const nowWindowDepth = this.#getDepth(depthList, id)
            const front = this.#frontID(depthList)
            if (nowWindowDepth && front) {
                depthList[front.num + 1] = depthList[nowWindowDepth]
                delete depthList[nowWindowDepth]
            }
        }
        /**
         * ウィンドウの重ね合わせを管理します。
         * @param id 手前にしたいウィンドウを選択します。
         * @param noReflash 画面を再描画するかどうか
         */
        windowDepthChange(id?: string, noReflash?: boolean) {
            const depthList = this.depthList()
            this.#depthListTemp = depthList
            if (id) this.#apply(id)
            const ids = Object.keys(this.#windowSystem.#windows)
            for (let i = 0; i !== ids.length; i++) {
                if (this.#windowSystem.#windows[ids[i]]?.option?.front) this.#apply(ids[i])
                if (this.#windowSystem.#windows[ids[i]]?.option?.background) {
                    const depths = this.#ObjectKeys(depthList)
                    for (let i = depths[depths.length - 1]; i !== -1; i--) depthList[i + 1] = depthList[i]
                    const nowWindowDepth = this.#getDepth(depthList, ids[i])
                    if (nowWindowDepth) {
                        depthList[0] = depthList[nowWindowDepth]
                        delete depthList[nowWindowDepth]
                    }
                }
            }
            const done = this.#packmove(depthList)
            // 適用
            const depthLen = this.#ObjectKeys(done)
            for (let i = 0; i !== depthLen.length; i++) {
                const window = this.#windowSystem.#windows[done[depthLen[i]]]
                if (window) window.depth = Number(depthLen[i])
            }
            if (!noReflash) this.#windowSystem.viewReflash() // 反映
        }
    }(this)
    /** マウスイベントです。 */
    #mouseEvent = new class {
        windowSystem: windowSystem
        constructor(t: windowSystem) { this.windowSystem = t }
        /** クリック */
        async mousedown(e: SumMouseEvent) {
            const winSys = this.windowSystem
            let doubleClick = (() => {
                const nowTime = Date.now()
                if (nowTime - winSys.#temp.clickTime < 200) {
                    winSys.#temp.clickTime = 0
                    return true
                } else winSys.#temp.clickTime = nowTime
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
                    const clickWindowId = winSys.#clickWindowId(tar)
                    const clickWindowIdOnly = winSys.#clickWindowId(tar, true)
                    if (target.classList.contains("window-bar") && target.parentElement) {
                        const stat = winSys.#windows[target.parentElement.id]
                        if (stat) {
                            winSys.#temp.moveingWindow = {
                                name: target.parentElement.id,
                                top: e.clientY - stat.top,
                                left: e.clientX - stat.left
                            }
                        }
                        if (doubleClick) {
                            if (clickWindowIdOnly) {
                                winSys.#temp.moveingWindow = undefined
                                winSys.fullscreenSetting(clickWindowIdOnly, true)
                            }
                        }
                    }
                    if (clickWindowId) {
                        winSys.#windowDepthManage.windowDepthChange(clickWindowId)
                        if (target.classList.contains("window-max")) winSys.#temp.fullscreenBtn = clickWindowId // ウィンドウ最大化処理
                        if (target.classList.contains("window-min")) winSys.#temp.miniwindowBtn = clickWindowId // ウィンドウ最大化処理
                        if (target.classList.contains("window-close")) winSys.#temp.closeBtn = clickWindowId // ウィンドウ最大化処理
                        // ウィンドウサイズ変更処理
                        const windowSizegenre = Object.keys(winSys.#windowSizeID)
                        const type = (() => {
                            for (let i = 0; i !== windowSizegenre.length; i++)
                                if (target.classList.contains(winSys.#windowSizeID[windowSizegenre[i]]))
                                    return winSys.#windowSizeID[windowSizegenre[i]]
                            return null
                        })()
                        if (type) {
                            const clickWindowId = winSys.#clickWindowId(tar, true)
                            if (clickWindowId) {
                                const stat = winSys.#windows[clickWindowId]
                                if (stat) {
                                    const left = stat.element.getElementsByClassName("window-bar-left")[0]
                                    const right = stat.element.getElementsByClassName("window-bar-right")[0]
                                    if (left && right) winSys.#temp.resizeingWindow = {
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
        /** マウスの移動 */
        async mousemove(e: SumMouseEvent) {
            const winSys = this.windowSystem
            winSys.#temp.clickTime = 0
            if (winSys.#temp.moveingWindow) {
                const stat = winSys.#windows[winSys.#temp.moveingWindow.name]
                if (stat) {
                    if (stat.full.is) {
                        winSys.#temp.moveingWindow.top = e.clientY + stat.top + 10
                        if (winSys.#body.clientWidth / 2 > e.clientX) {
                            winSys.#temp.moveingWindow.left = e.clientX + stat.left + 11
                        } else if (winSys.#body.clientWidth / 2 < e.clientX) {
                            winSys.#temp.moveingWindow.left = (stat.full.leftSize / 2) + 11
                        }
                        stat.full.top = e.clientY - winSys.#temp.moveingWindow.top
                        winSys.fullscreenSetting(winSys.#temp.moveingWindow.name, true)
                    }
                    stat.top = e.clientY - winSys.#temp.moveingWindow.top // 場所を保存
                    stat.left = e.clientX - winSys.#temp.moveingWindow.left // ry
                    winSys.viewReflash(winSys.#temp.moveingWindow.name)
                }
            } else if (winSys.#temp.resizeingWindow) {
                const type = winSys.#temp.resizeingWindow.type
                const ids = winSys.#windowSizeID
                const stat = winSys.#windows[winSys.#temp.resizeingWindow.name]
                if (stat) {
                    const rewin = winSys.#temp.resizeingWindow
                    const windowBarLength = 50 + (stat.option?.minSize?.top ? stat.option.minSize.top : 0)
                    const windowHeightLowLenght = (rewin.windowBarLeftLength + rewin.windowBarRightLength) + 24 + (stat.option?.minSize?.left ? stat.option.minSize.left : 0)
                    if ( // つかまれているリサイズ用要素のIDと一致すると
                        type === ids.top
                        || type === ids.topLeft
                        || type === ids.leftTop
                        || type === ids.topRight
                        || type === ids.rightTop
                    ) {
                        stat.top = e.clientY - rewin.clientTop
                        stat.topSize = rewin.topSize - (e.clientY - rewin.clientY) // マウスに合わせてサイズ変更
                        if (stat.topSize < windowBarLength) { // 最小サイズより小さくしようとした場合は回避する
                            stat.top = (e.clientY - rewin.clientTop) + (rewin.topSize - (e.clientY - rewin.clientY)) - windowBarLength
                            stat.topSize = windowBarLength
                        }
                    }
                    if ( // つかまれているリサイズ用要素のIDと一致すると
                        type === ids.left
                        || type === ids.topLeft
                        || type === ids.leftTop
                        || type === ids.bottomLeft
                        || type === ids.leftBottom
                    ) {
                        stat.left = e.clientX - rewin.clientLeft
                        stat.leftSize = rewin.leftSize - (e.clientX - rewin.clientX) // マウスに合わせてサイズ変更
                        if (stat.leftSize < windowHeightLowLenght) { // 最小サイズより小さくしようとした場合は回避する
                            stat.left = (e.clientX - rewin.clientLeft) + (rewin.leftSize - (e.clientX - rewin.clientX)) - windowHeightLowLenght
                            stat.leftSize = windowHeightLowLenght
                        }
                    }
                    if ( // つかまれているリサイズ用要素のIDと一致すると
                        type === ids.right
                        || type === ids.bottomRight
                        || type === ids.rightBottom
                        || type === ids.topRight
                        || type === ids.rightTop
                    ) {
                        stat.leftSize = winSys.#temp.resizeingWindow.leftSize + (e.clientX - winSys.#temp.resizeingWindow.clientX) // マウスに合わせてサイズ変更
                        if (stat.leftSize < windowHeightLowLenght) { // 最小サイズより小さくしようとした場合は回避する
                            stat.leftSize = windowHeightLowLenght
                        }
                    }
                    if ( // つかまれているリサイズ用要素のIDと一致すると
                        type === ids.bottom
                        || type === ids.bottomRight
                        || type === ids.rightBottom
                        || type === ids.bottomLeft
                        || type === ids.leftBottom
                    ) {
                        stat.topSize = winSys.#temp.resizeingWindow.topSize + (e.clientY - winSys.#temp.resizeingWindow.clientY) // マウスに合わせてサイズ変更
                        if (stat.topSize < windowBarLength) { // 最小サイズより小さくしようとした場合は回避する
                            stat.topSize = windowBarLength
                        }
                    }
                    winSys.viewReflash(winSys.#temp.resizeingWindow.name)
                }
            }
        }
        /** クリック終了 */
        async mouseup(e: SumMouseEvent) {
            const winSys = this.windowSystem
            winSys.#temp.moveingWindow = undefined // ウィンドウドラッグを終了
            winSys.#temp.resizeingWindow = undefined // ウィンドウリサイズを終了
            // フルスクリーンボタンのイベント
            const target = e.target as HTMLElement
            if (
                target?.classList.contains("window-max")
                && target.parentElement?.parentElement?.parentElement?.classList.contains("window-body")
            ) {
                const id = target.parentElement.parentElement.parentElement.id
                await winSys.fullscreenSetting(id)
            } else if (
                target?.classList.contains("window-close")
                && target.parentElement?.parentElement?.parentElement?.classList.contains("window-body")
            ) {
                const id = target.parentElement.parentElement.parentElement.id
                await winSys.windowClose(id)
            }
            winSys.#temp.miniwindowBtn = undefined // 最小化ボタンをリセット
            winSys.#temp.closeBtn = undefined // 閉じるボタンをリセット
            winSys.#temp.fullscreenBtn = undefined // フルスクリーンボタンをリセット
        }
    }(this)
    /**
     * その要素の親要素がこのWindow Systemで管理されているウィンドウであるかどうかを確認します。
     * そうでない場合は無視します。
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
    constructor(body: HTMLElement, shareData: ShareData) {
        // マウスイベントです
        if (shareData.mouseCursor) {
            shareData.mouseCursor.mousedown(e => this.#mouseEvent.mousedown(e))
            shareData.mouseCursor.mousemove(e => this.#mouseEvent.mousemove(e))
            shareData.mouseCursor.mouseup(e => this.#mouseEvent.mouseup(e))
        }
        this.#body = body
    }
    async #reflash(id: string) {
                    const stat = this.#windows[id]
            if (stat) {
                const style = stat.element.style
                style.top = String(stat.top) + "px"
                style.left = String(stat.left) + "px"
                style.width = String(stat.leftSize) + "px"
                style.height = String(stat.topSize) + "px"
                style.zIndex = String(stat.depth)
            }
        }
        /**
     * ウィンドウの位置や状態を全て確認し、更新します。
     * @param id 識別名を指定すると、特定のウィンドウの状態だけ更新します。
     */
    async viewReflash(id?: string) {
        if (id) this.#reflash(id)
        else {
            const ids = Object.keys(this.#windows)
            for (let i = 0; i !== ids.length; i++) {
                const id = ids[i]
                this.#reflash(id)
            }
        }
    }
    async fullscreenSetting(id: string, /** 最大化ボタンがホバーされてる状況かにかかわらず状態を切り替え */buttonnull?: boolean) {
        const stat = this.#windows[id]
        if ((id === this.#temp.fullscreenBtn || buttonnull) && stat) if (stat.full.is) {
            stat.full.is = false
            stat.top = stat.full.top
            stat.left = stat.full.left
            stat.topSize = stat.full.topSize
            stat.leftSize = stat.full.leftSize
            const style1 = (stat.element.getElementsByClassName("window-body")[0] as HTMLElement)?.style
            const style2 = (stat.element.getElementsByClassName("window-resize-center")[0] as HTMLElement)?.style
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
                const resizeTop = stat.element.getElementsByClassName("window-resize-top")[0] as HTMLElement
                const resizeLeft = stat.element.getElementsByClassName("window-resize-left")[0] as HTMLElement
                const resizeRight = (() => {
                    const rB = stat.element.getElementsByClassName("window-resize-right")
                    for (let i = 0; i !== rB.length; i++) {
                        const parentElement = rB[i].parentElement
                        if (
                            parentElement?.parentElement?.classList.contains("window-master")
                            && parentElement.parentElement.getElementsByClassName("window-body")[0]?.id === id
                        ) return rB[i]
                    }
                })() as HTMLElement
                const resizeBottom = (() => {
                    const rB = stat.element.getElementsByClassName("window-resize-bottom")
                    for (let i = 0; i !== rB.length; i++) {
                        const parentElement = rB[i].parentElement
                        if (
                            parentElement
                            && parentElement.classList.contains("window-master")
                            && parentElement.getElementsByClassName("window-body")[0]?.id === id
                        ) return rB[i]
                    }
                })() as HTMLElement
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
            const style1 = (stat.element.getElementsByClassName("window-body")[0] as HTMLElement)?.style
            const style2 = (stat.element.getElementsByClassName("window-resize-center")[0] as HTMLElement)?.style
            if (style1 && style2) {
                style1.borderRadius = "0"
                style1.width = "100%"
                style1.height = "100%"
                style2.width = "100%"
                style2.height = "100%"
            }
            const resizeTop = stat.element.getElementsByClassName("window-resize-top")[0] as HTMLElement
            const resizeLeft = stat.element.getElementsByClassName("window-resize-left")[0] as HTMLElement
            const resizeRight = (() => {
                const rB = stat.element.getElementsByClassName("window-resize-right")
                for (let i = 0; i !== rB.length; i++) {
                    const parentElement = rB[i].parentElement
                    if (
                        parentElement?.parentElement?.classList.contains("window-master")
                        && parentElement.parentElement.getElementsByClassName("window-body")[0]?.id === id
                    ) return rB[i]
                }
            })() as HTMLElement
            const resizeBottom = (() => {
                const rB = stat.element.getElementsByClassName("window-resize-bottom")
                for (let i = 0; i !== rB.length; i++) {
                    const parentElement = rB[i].parentElement
                    if (
                        parentElement
                        && parentElement.classList.contains("window-master")
                        && parentElement.getElementsByClassName("window-body")[0]?.id === id
                    ) return rB[i]
                }
            })() as HTMLElement
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
     */
    async createWindow(
        /** ウィンドウを管理するための名前です。間違えると閉じられなくなります。*/
        name: string,
        /** 各自プログラムが管理することの出来るElementを入力します。その周りにウィンドウバーなどを装飾します。 */
        element: HTMLElement,
        /** オプションを指定する */
        option: createWindowOption) {
        // ウィンドウのメイン
        const master = document.createElement("div")
        master.classList.add("window-master")
        const body = document.createElement("div")
        body.classList.add("window-body")
        body.classList.add("window-body-design")
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
            top: this.#temp.windowInitPosition.top,
            left: this.#temp.windowInitPosition.left,
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
        this.#temp.windowInitPosition.top += 50
        this.#temp.windowInitPosition.left += 50
        const window = this.#windows["window" + name]
        if (window) {
            if (option?.size) {
                if (option.size.top) window.topSize = option.size.top
                if (option.size.left) window.leftSize = option.size.left
            }
            if (option?.title) title.innerText = option.title
            if (option?.layout?.widthFull) {
                window.left = 0
                window.leftSize = this.#body.clientWidth
            }
            if (option?.layout?.heigthFull) {
                window.top = 0
                window.topSize = this.#body.clientHeight
            }
            if (option?.layout?.center && option?.size?.top && option?.size?.left) {
                window.leftSize = this.#body.clientWidth / 2 - (window.leftSize / 2)
                window.topSize = this.#body.clientHeight / 2 - (window.topSize / 2)
            }
            if (option.layout?.under && option?.size?.top) window.top = this.#body.clientHeight - window.topSize
            if (option.sizeChange === false) {
                windowResizeTop.style.display = "none"
                windowResizeBottom.style.display = "none"
                windowResizeLeft.style.display = "none"
                windowResizeRight.style.display = "none"
                body.style.width = "100%"
                windowResizeCenter.style.height = "100%"
            }
            if (!window.option) window.option = {}
            if (option.layout?.front) window.option.front = option.layout.front
            if (option.layout?.background) window.option.background = option.layout.background
            if (!window.option.minSize) window.option.minSize = {}
            if (option.minSize?.top) window.option.minSize.top = option.minSize.top
            if (option.minSize?.left) window.option.minSize.left = option.minSize.left
            if (option.windowDesignDisabled) {
                bar.style.display = "none"
                element.style.height = "100%"
                body.classList.remove("window-body-design")
            }
        }
        this.#windowDepthManage.windowDepthChange("window" + name, true)
        await this.viewReflash("window" + name)
        // 表示
        this.#body.appendChild(master)
        await wait(20)
        body.classList.add("window-viewed")
    }
    /** ウィンドウを閉じます。この際に一部のデータを解放し負荷が減少します。 */
    async windowClose(id: string) {
        const stat = this.#windows[id]
        if (stat) {
            const body = stat.element.getElementsByClassName("window-body")[0]
            if (body) body.classList.remove("window-viewed")
            await wait(255)
            this.#body.removeChild(stat.element)
            delete this.#windows[id]
        }
    }
}

namespace Builder {
    export namespace createWindowOption {
        export class layoutOption {
            #cwob: createWindowOptionBuilder
            constructor(t: createWindowOptionBuilder) { this.#cwob = t }
            /** 上下左右を中央配置にするか。sizeパラメータがないと反応しない */
            setCenter(a: boolean) { this.#cwob.layout.center = a; return this }
            /** 横幅を最大まで広げるかどうか */
            setWidthFull(a: boolean) { this.#cwob.layout.widthFull = a; return this }
            /** 立幅を最大まで広げるかどうか */
            setHeigthFull(a: boolean) { this.#cwob.layout.heigthFull = a; return this }
            /** 最前面にするかどうか */
            setFront(a: boolean) { this.#cwob.layout.front = a; return this }
            /** 最背面にするかどうか */
            setBackground(a: boolean) { this.#cwob.layout.background = a; return this }
            /** 最も下に配置するかどうか */
            setUnder(a: boolean) { this.#cwob.layout.under = a; return this }
        }

        export class sizeOption {
            #cwob: createWindowOptionBuilder
            constructor(t: createWindowOptionBuilder) { this.#cwob = t }
            /** 立幅を決める */
            setTop(a: number) { this.#cwob.size.top = a; return this }
            /** 横幅を決める */
            setLeft(a: number) { this.#cwob.size.left = a; return this }
        }

        export class minSizeOption {
            #cwob: createWindowOptionBuilder
            constructor(t: createWindowOptionBuilder) { this.#cwob = t }
            /** 立幅を決める */
            setTop(a: number) { this.#cwob.minSize.top = a; return this }
            /** 横幅を決める */
            setLeft(a: number) { this.#cwob.minSize.left = a; return this }
        }

        export class windowBarSettingOption {
            #cwob: createWindowOptionBuilder
            constructor(t: createWindowOptionBuilder) { this.#cwob = t }
            /** 最大化ボタンを表示するか。デフォルトはtrue */
            setMaximumButton(a: boolean) { this.#cwob.windowBarSetting.maximumButton = a; return this }
            /** 最小化ボタンを表示するか。デフォルトはtrue */
            setMinimumButton(a: boolean) { this.#cwob.windowBarSetting.minimumButton = a; return this }
        }
    }
}
export class createWindowOptionBuilder {
    get iconURL() { return this.#iconURL }
    #iconURL?: string
    /** ウィンドウにつけるアイコンを指定する */
    setIconURL(a: string) { this.#iconURL = a; return this }

    get title() { return this.#title }
    #title?: string
    /** ウィンドウタイトルを決定 */
    setTitle(a: string) { this.#title = a; return this }

    get layout() { return this.#layout }
    #layout: {
        center?: boolean
        widthFull?: boolean
        heigthFull?: boolean
        front?: boolean
        background?: boolean
        under?: boolean
    } = {}
    /** レイアウトを指定。上から順に適用され、上書きされる。sizeを指定しないといけないオプションもある */
    setLayoutOption(callback: ((option: Builder.createWindowOption.layoutOption) => void)) { callback(new Builder.createWindowOption.layoutOption(this)); return this }

    get size() { return this.#size }
    #size: {
        top?: number
        left?: number
    } = {}
    /** レイアウトを指定。上から順に適用され、上書きされる。sizeを指定しないといけないオプションもある */
    setSizeOption(callback: ((option: Builder.createWindowOption.sizeOption) => void)) { callback(new Builder.createWindowOption.sizeOption(this)); return this }

    get minSize() { return this.#minSize }
    #minSize: {
        top?: number
        left?: number
    } = {}
    /** レイアウトを指定。上から順に適用され、上書きされる。sizeを指定しないといけないオプションもある */
    setMinSizeOption(callback: ((option: Builder.createWindowOption.minSizeOption) => void)) { callback(new Builder.createWindowOption.minSizeOption(this)); return this }

    get windowBarSetting() { return this.#windowBarSetting }
    #windowBarSetting: {
        maximumButton?: boolean
        minimumButton?: boolean
    } = {}
    /** レイアウトを指定。上から順に適用され、上書きされる。sizeを指定しないといけないオプションもある */
    setWindowBarSettingOption(callback: ((option: Builder.createWindowOption.windowBarSettingOption) => void)) { callback(new Builder.createWindowOption.windowBarSettingOption(this)); return this }

    get sizeChange() { return this.#sizeChange }
    #sizeChange?: boolean
    /** ウィンドウにつけるアイコンを指定する */
    setSizeChange(a: boolean) { this.#sizeChange = a; return this }

    get windowDesignDisabled() { return this.#windowDesignDisabled }
    #windowDesignDisabled?: boolean
    /** ウィンドウバーなどの装飾を無効にする */
    setWindowDesignDisabled(a: boolean) { this.#windowDesignDisabled = a; return this }
}
