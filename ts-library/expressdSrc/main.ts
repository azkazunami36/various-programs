import { createWindowOptionBuilder, windowSystem } from "./js/windowSystem.js"
import { httpDataRequest, API, ShareData } from "./js/handyTool.js"
import { mouseCursor } from "./js/mouseCursor.js"
import { settingApp } from "./js/settingApp.js"

addEventListener("load", async () => {
    /**
     * メインプログラム同様、shareDataです。
     */
    const shareData: ShareData = {}
    shareData.mouseCursor = new mouseCursor(document.body)
    shareData.windowSystem = new windowSystem(document.body, shareData)
    const mainWindow = document.createElement("div")
    new settingApp(mainWindow)
    shareData.windowSystem.createWindow("mainWindow", mainWindow, new createWindowOptionBuilder()
        .setTitle("メインウィンドウ")
        .setSizeOption(option => option
            .setTop(600)
            .setLeft(900)
        )
        .setMinSizeOption(option => option
            .setTop(450)
            .setLeft(350)
        )
    )
    const taskBar = document.createElement("div")
    shareData.windowSystem.createWindow("taskBar", taskBar, new createWindowOptionBuilder()
        .setWindowDesignDisabled(true)
        .setSizeChange(false)
        .setLayoutOption(o => o
            .setWidthFull(true)
            .setFront(true)
            .setUnder(true)
        )
        .setSizeOption(option => option
            .setTop(50)
        )
    )
    const background = document.createElement("div")
    const image = document.createElement("img")
    image.src = "svgIcon/backgroundImage/imageOne.svg"
    image.style.width = "100%"
    image.style.height = "100%"
    image.style.objectFit = "cover"
    background.appendChild(image)
    shareData.windowSystem.createWindow("backGround", background, new createWindowOptionBuilder()
        .setWindowDesignDisabled(true)
        .setSizeChange(false)
        .setLayoutOption(o => o
            .setWidthFull(true)
            .setHeigthFull(true)
            .setBackground(true)
        )
        .setSizeOption(option => option
            .setTop(50)
        )
    )
    
    const fileSendWindow = document.createElement("div")

    Object.assign(fileSendWindow.style, {
        padding: "5px",
        width: "fit-content",
        background: "white",
        borderRadius: "10px"
    })
    fileSendWindow.innerText = "ファイル送信"
    fileSendWindow.addEventListener("click", async () => {
        const sendWindow = document.createElement("div")
        Object.assign(sendWindow.style, {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            background: "rgb(200, 230, 255)"
        })
        shareData.windowSystem?.createWindow(String(Date.now()), sendWindow, new createWindowOptionBuilder()
            .setTitle("ファイル送信")
            .setSizeOption(option => option
                .setTop(400)
                .setLeft(600)
            )
            .setMinSizeOption(option => option
                .setTop(150)
                .setLeft(200)
            ))
        const fileSelect = document.createElement("input")
        fileSelect.type = "file"
        const preview = document.createElement("div")
        Object.assign(preview.style, {
            width: "100%",
            height: "50%",
            overflow: "hidden"
        })
        const sendButton = document.createElement("button")
        sendButton.innerText = "送信"
        fileSelect.addEventListener("change", async () => {
            if (fileSelect.files && fileSelect.files[0]) {
                const data = await fileSelect.files[0].arrayBuffer()
                console.log(fileSelect.files[0].type)
                switch (fileSelect.files[0].type) {
                    case "image/png":
                    case "image/jpeg": {
                        console.log("image")
                        const imgPreview = document.createElement("img")
                        Object.assign(imgPreview.style, {
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                        })
                        const blob = new Blob([data], { type: fileSelect.files[0].type })
                        imgPreview.src = URL.createObjectURL(blob)
                        preview.innerHTML = ""
                        preview.appendChild(imgPreview)
                        break
                    }
                    case "video/mp4":
                    case "video/mpeg": {
                        console.log("video")
                        const imgPreview = document.createElement("video")
                        imgPreview.controls = true
                        Object.assign(imgPreview.style, {
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                        })
                        const blob = new Blob([data], { type: fileSelect.files[0].type })
                        imgPreview.src = URL.createObjectURL(blob)
                        preview.innerHTML = ""
                        preview.appendChild(imgPreview)
                        break
                    }
                }
            }
        })
        sendButton.addEventListener("click", async () => {
            if (fileSelect.files && fileSelect.files[0]) {
                const data = await fileSelect.files[0].arrayBuffer()
                console.log(fileSelect.files[0].type)
                const imgBlob = new Blob([data], { type: fileSelect.files[0].type })
                console.log(await API.dataIO.sendFile(imgBlob))
            }
        })
        sendWindow.appendChild(preview)
        sendWindow.appendChild(fileSelect)
        sendWindow.appendChild(sendButton)
    })

})

namespace fileManager {
    class fileManager {
        async startup() {

        }
    }
}
