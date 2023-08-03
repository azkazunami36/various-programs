//@ts-check

import { windowSystem } from "./js/windowSystem.js"

addEventListener("load",async () => {
    /**
     * メインプログラム同様、shareDataです。
     * @type {{
     * windowSystem?: windowSystem
     * }}
     */
    const shareData = {}
    shareData.windowSystem = new windowSystem(document.body)
    const ee = document.createElement("div")
    shareData.windowSystem.createWindow("ofuzakewindow", ee, {
        size: {
            top: 600,
            left: 900
        },
        title: "おふざけウィンドウ"
    })
    const ese = new windowSystem(ee)
    for (let i = 0; i !== 5; i++) {
        const window = document.createElement("div")
        await ese.createWindow("konnnitiha" + i, window, {
            size: {
                top: 300,
                left: 400
            },
            title: "こんにちは。" + i
        })
    } 
})
