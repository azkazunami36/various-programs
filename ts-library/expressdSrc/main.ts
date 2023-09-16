import { createWindowOptionBuilder, windowSystem } from "./js/windowSystem.js"
import { httpDataRequest, API } from "./js/handyTool.js"

addEventListener("load", async () => {
    /**
     * メインプログラム同様、shareDataです。
     */
    const shareData: {
        windowSystem?: windowSystem
    } = {}
    shareData.windowSystem = new windowSystem(document.body)
    const mainWindow = document.createElement("div")
    shareData.windowSystem.createWindow("mainWindow", mainWindow, new createWindowOptionBuilder()
        .setTitle("メインウィンドウ")
        .setSizeOption(option => option
            .setTop(600)
            .setLeft(900)
        )
    )
    const createButton = document.createElement("div")
    Object.assign(createButton.style, {
        padding: "5px",
        width: "fit-content",
        background: "white",
        borderRadius: "10px"
    })
    createButton.innerText = "新しいウィンドウ"
    createButton.addEventListener("click", () => {
        shareData.windowSystem?.createWindow(String(Date.now()), document.createElement("div"), new createWindowOptionBuilder()
            .setTitle("サブウィンドウ")
            .setSizeOption(option => option
                .setTop(600)
                .setLeft(900)
            )
        )
    })
    const postUrl = "dataIO"
    const testPost = document.createElement("div")
    Object.assign(testPost.style, {
        padding: "5px",
        width: "fit-content",
        background: "white",
        borderRadius: "10px"
    })
    testPost.innerText = "テストPOSTを送信: " + postUrl
    testPost.addEventListener("click", async () => {
    })
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
    mainWindow.appendChild(testPost)
    mainWindow.appendChild(createButton)
    mainWindow.appendChild(fileSendWindow)
})

namespace fileManager {
    class fileManager {
        async startup() {
            
        }
    }
}
