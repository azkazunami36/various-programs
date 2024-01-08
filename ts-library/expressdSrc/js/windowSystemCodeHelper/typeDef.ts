export const windowSizeID: { [x: string]: string } = {
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

export interface temp {
    /** 最大化ボタンを最初から押しているかどうかの判定をします。 */
    fullscreenBtn?: string
    /** 最小化ボタンを最初から押しているかどうかの判定をします。 */
    miniwindowBtn?: string
    /** 閉じるボタンを最初から押しているかどうかの判定をします。 */
    closeBtn?: string
    /** サイズ変更中のウィンドウのid(識別名)や変更中の箇所、その位置等を記録します。 */
    resizeingWindow?: {
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
    }
    /** 移動中のウィンドウのid(識別名)やウィンドウバーからマウスの間のズレを記録します。 */
    moveingWindow?: {
        /** IDを記録します。 */
        name: string
        /** マウスの間のズレ(縦) */
        top: number
        /** マウスの間のズレ(横) */
        left: number
    }
    /** ウィンドウの初期位置を記録します。ウィンドウが複数起動した際、ばらばらに配置されるようになります。 */
    windowInitPosition: {
        top: number,
        left: number
    }
    /**
     * クリックした時間が記録されます。クリックするたびに更新されます。
     * これは主にダブルクリックの判定に使用されます。
     */
    clickTime: number
}
