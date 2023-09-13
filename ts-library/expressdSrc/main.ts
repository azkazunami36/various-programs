import { windowSystem } from "./js/windowSystem.js"
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
    })
    const fileSendWindow = document.createElement("div")
    fileSendWindow.style.padding = "5px"
    fileSendWindow.style.width = "fit-content"
    fileSendWindow.style.background = "white"
    fileSendWindow.style.borderRadius = "10px"
    fileSendWindow.innerText = "ファイル送信"
    fileSendWindow.addEventListener("click", async () => {
        const sendWindow = document.createElement("div")
        sendWindow.style.display = "flex"
        sendWindow.style.alignItems = "center"
        sendWindow.style.justifyContent = "center"
        sendWindow.style.flexDirection = "column"
        sendWindow.style.background = "rgb(200, 230, 255)"
        shareData.windowSystem?.createWindow(String(Date.now()), sendWindow, {
            size: {
                top: 400,
                left: 600
            },
            title: "ファイル送信",
            minSize: {
                top: 150,
                left: 200
            }
        })
        const fileSelect = document.createElement("input")
        fileSelect.type = "file"
        const imgPreview = document.createElement("img")
        imgPreview.style.width = "100%"
        imgPreview.style.height = "50%"
        imgPreview.style.objectFit = "contain"
        const sendButton = document.createElement("button")
        sendButton.innerText = "送信"
        fileSelect.addEventListener("change", async () => {
            if (fileSelect.files && fileSelect.files[0]) {
                const data = await fileSelect.files[0].arrayBuffer()
                console.log(fileSelect.files[0].type)
                const imgBlob = new Blob([data], { type: fileSelect.files[0].type })
                imgPreview.src = URL.createObjectURL(imgBlob)
            }
        })
        sendButton.addEventListener("click", async  () => {
            if (fileSelect.files && fileSelect.files[0]) {
                const data = await fileSelect.files[0].arrayBuffer()
                console.log(fileSelect.files[0].type)
                const imgBlob = new Blob([data], { type: fileSelect.files[0].type })
                console.log(await API.dataIO.sendFile(imgBlob))
            }
        })
        sendWindow.appendChild(imgPreview)
        sendWindow.appendChild(fileSelect)
        sendWindow.appendChild(sendButton)
    })
    mainWindow.appendChild(testPost)
    mainWindow.appendChild(createButton)
    mainWindow.appendChild(fileSendWindow)
})
