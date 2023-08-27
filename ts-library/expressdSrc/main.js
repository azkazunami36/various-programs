//@ts-check

import { windowSystem } from "./js/windowSystem.js"
import { httpDataRequest, APISend } from "./js/handyTool.js"

addEventListener("load", async () => {
    /**
     * メインプログラム同様、shareDataです。
     * @type {{
     * windowSystem?: windowSystem
     * }}
     */
    const shareData = {}
    shareData.windowSystem = new windowSystem(document.body)
    const mainWindow = document.createElement("div")
    shareData.windowSystem.createWindow("mainWindow", mainWindow, {
        size: {
            top: 600,
            left: 900
        },
        title: "メインウィンドウ"
    })
    const createButton = document.createElement("div")
    createButton.style.padding = "5px"
    createButton.style.width = "fit-content"
    createButton.style.background = "white"
    createButton.style.borderRadius = "10px"
    createButton.innerText = "新しいウィンドウ"
    createButton.addEventListener("click", () => {
        shareData.windowSystem?.createWindow(String(Date.now()), document.createElement("div"), {
            size: {
                top: 600,
                left: 900
            },
            title: "サブウィンドウ"
        })
    })
    const postUrl = "dataIO"
    const testPost = document.createElement("div")
    testPost.style.padding = "5px"
    testPost.style.width = "fit-content"
    testPost.style.background = "white"
    testPost.style.borderRadius = "10px"
    testPost.innerText = "テストPOSTを送信: " + postUrl
    testPost.addEventListener("click", async () => {
        await APISend("dataIO", JSON.stringify({}))
    })
    mainWindow.appendChild(testPost)
    mainWindow.appendChild(createButton)
})
