/**
 * httpリクエストできる関数
 * @param {string} request 
 * @param {any} send 
 * @returns 
 */
async function httpDataRequest(request, send) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request)
        xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
        xhr.send(send); //データを送信
        xhr.onreadystatechange = async () => { if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText) } //レスポンスを返す
    })
}
const statusData = {
    videoLoaded: 0, //表示済みの動画をカウント
    /**
     * @type {string[]}
     */
    videoIds: [], //取得したVideoID
    /**
     * @type {[{title: string, author: {id: string, name: string}}]}
     */
    ytIndex: {}, //インデックスデータを格納
    videoloading: false, //読み込み中かどうか
    videoRow: 0, //横に並べる動画の数
    popupVideoRow: 0,
    ratio: 1, //ブラウザの倍率
    thumbnailWidth: 320 //最大のサムネイルの表示大きさ。320でYouTube
}
/**
 * 待機
 * @param {number} time 
 */
async function wait(time) { await new Promise(resolve => setTimeout(resolve, time)) }
/**
 * 最もわかりやすく言うと、一番下ならtrueを返すという意味です。  
 * １: cHeight(画面の高さ)+動画の並ぶ数x100した数  
 * ２: 一番下から数えた数  
 * この２が１より小さいとなった場合、trueが返されます。
 */
async function ifScrollBottom() {
    const videoList = document.getElementById("videoList")
    const sHeight = videoList.scrollHeight //要素の高さ
    const cHeight = videoList.clientHeight //クライアントに映ってる要素の高さ
    const sTop = videoList.scrollTop //スクロールされている場所
    const cBottom = cHeight + sTop //下を基準にするため
    const sBottom = sHeight - cBottom //下から数えたスクロールされている場所
    return statusData["videoRow"] * 200 + cHeight > sBottom
}
/**
 * 倍率状態を更新します。
 */
async function updateRatio() { statusData["ratio"] = (window.devicePixelRatio || 1).toFixed(2) }
/**
 * 動画の並ぶ数を更新します。
 */
async function updateRow() {
    const videonum = (document.getElementById("VideoListCenter").clientWidth / statusData["thumbnailWidth"]).toFixed()
    if (videonum != statusData["videoRow"]) {
        const videoLinkStyle = await getRuleBySelector(".VideoLink")
        statusData["videoRow"] = videonum
        //スタイルに反映
        videoLinkStyle.style.width = "calc(100% / " + String(videonum) + ")"
    }
    const popupvideonum = (document.getElementById("infoVideos").clientWidth / 250).toFixed()
    if (popupvideonum != statusData["popupVideoRow"]) {
        const popupvideoLinkStyle = await getRuleBySelector(".popupVideoLink")
        statusData["popupVideoRow"] = popupvideonum
        //スタイルに反映
        popupvideoLinkStyle.style.width = "calc(100% / " + String(videonum) + ")"
    }
    if (await ifScrollBottom()) videoLoad() //サイズ変更時に一番下まで移動してしまったら読み込む
}
async function updateState() {
    updateRatio()
    updateRow()
}
/**
 * 動画を取得しリストに追加する関数
 * @param {boolean} g 読み込み中でも実行するか
 */
async function videoLoad(g) {
    //読み込み中で無視がfalseならリターン
    if (statusData["videoloading"] && !g) return
    statusData["videoloading"] = true //読み込み中
    //ブラウザサイズからどれほど動画を並べられるか判断
    updateRow()
    if (!statusData["videoIds"][0]) { //videoIdsが無かったらサーバーからデータを取得する
        statusData["ytIndex"] = JSON.parse(await httpDataRequest("ytindex-list"))
        statusData["videoIds"] = Object.keys(statusData["ytIndex"])
        for (let i = 0; statusData["videoIds"].length != i; i++) {
            const rm = Math.floor(Math.random() * i)
            let tmp = statusData["videoIds"][i]
            statusData["videoIds"][i] = statusData["videoIds"][rm]
            statusData["videoIds"][rm] = tmp
            console.log(statusData["videoIds"][i])
        }
    }
    //表示済み数がVideoIDsと同じならリターン
    if (statusData["videoLoaded"] == statusData["videoIds"].length - 1) return
    for (let i = 0; i != statusData["videoRow"]; i++) {
        if (statusData["videoLoaded"] == statusData["videoIds"].length - 1) return //読み込める動画が無くなるとリターン
        statusData["videoLoaded"]++
        const videoId = statusData["videoIds"][statusData["videoLoaded"]] //VideoID
        updateRatio()
        const video = new createVT(document.getElementById("VideoListCenter"))
        video.setElement()
        video.ratio = statusData["ratio"]
        video.thumbnailWidth = statusData["thumbnailWidth"]
        video.videoId = videoId
        video.title = statusData["ytIndex"][videoId].title
        video.author = statusData["ytIndex"][videoId].author
        video.update()
    }
    //もし処理中の隙に一番下までスクロールされていたらすぐに次の読み込みをする
    if (await ifScrollBottom()) videoLoad(true)
    else statusData["videoloading"] = false //出なければ読み込み終了
}
class createVT {
    _data = {
        title: "",
        videoId: "",
        thumbnailWidth: 320,
        ratio: 1,
        author: {
            id: "",
            name: ""
        },
        displaySet: {
            title: {
                fontSize: "",
                color: ""
            },
            author: {
                fontSize: "",
                color: "",
                iconSize: ""
            }
        },
        /**
         * @type {HTMLElement}
         */
        Element: "",
        set: false
    }
    element = {}
    /**
     * @param {HTMLElement} Element 
     */
    constructor(Element) {
        this._data.Element = Element
        this.element.videoLink = document.createElement("div")
        this.element.videoLink.classList.add("VideoLink")

        const videoWindow = document.createElement("div")
        videoWindow.classList.add("VideoWindow")
        this.element.videoLink.appendChild(videoWindow)

        const thumbnailImage = document.createElement("div")
        thumbnailImage.classList.add("ThumbnailImage")
        videoWindow.appendChild(thumbnailImage)

        this.element.thumbnailimg = document.createElement("img")
        this.element.thumbnailimg.classList.add("Thumbnailimg")
        thumbnailImage.appendChild(this.element.thumbnailimg)

        const titleAria = document.createElement("div")
        titleAria.classList.add("TitleAria")
        videoWindow.appendChild(titleAria)

        const iconAria = document.createElement("div")
        iconAria.classList.add("IconAria")
        titleAria.appendChild(iconAria)

        const infoAria = document.createElement("div")
        infoAria.classList.add("InfoAria")
        titleAria.appendChild(infoAria)

        this.element.authorIcon = document.createElement("img")
        this.element.authorIcon.classList.add("AuthorIcon")
        iconAria.appendChild(this.element.authorIcon)

        this.element.videoTitle = document.createElement("p")
        this.element.videoTitle.classList.add("VideoTitle")
        infoAria.appendChild(this.element.videoTitle)

        this.element.videoAuthor = document.createElement("p")
        this.element.videoAuthor.classList.add("VideoAuthor")
        infoAria.appendChild(this.element.videoAuthor)

        this.element.clickme = document.createElement("a")
        this.element.clickme.classList.add("clickme")
        videoWindow.appendChild(this.element.clickme)

        videoWindow.addEventListener("contextmenu", async e => {
            contextmenu(e, {
                title: this._data.videoId,
                contextmenu: [
                    [
                        {
                            name: "YouTubeで見る",
                            id: "youtubeView",
                            data: {
                                videoId: this._data.videoId
                            }
                        },
                        {
                            name: "新しいタブで開く",
                            id: "newWindowVideoView",
                            data: {
                                videoId: this._data.videoId
                            }
                        }
                    ],
                    [
                        {
                            name: "VideoIDをコピー",
                            id: "clipboardVideoID",
                            data: {
                                videoId: this._data.videoId
                            }
                        },
                        {
                            name: "ダウンロード",
                            id: "download",
                            data: {
                                videoId: this._data.videoId
                            }
                        },
                        {
                            name: "\"" + this._data.videoId + "\"を削除",
                            id: "deleteVideo",
                            data: {
                                videoId: this._data.videoId
                            }
                        },
                        {
                            name: "情報を編集",
                            id: "download",
                            data: {
                                videoId: this._data.videoId
                            }
                        }
                    ],
                    [
                        {
                            name: "\"" + this._data.videoId + "\"からクリップを作成",
                            id: "download",
                            data: {
                                videoId: this._data.videoId
                            }
                        }
                    ]
                ]
            })
        })
    }
    setElement() {
        if (!this._data.set) this._data.Element.appendChild(this.element.videoLink)
        this._data.set = true
    }
    deleteElement() {
        if (this._data.set) this._data.Element.removeChild(this.element.videoLink)
        this._data.set = false
    }
    /**
     * @param {number} r
     */
    set ratio(r) {
        this._data.ratio = r
    }
    /**
     * @param {string} t
     */
    set title(t) {
        this._data.title = t
    }
    /**
     * @param {{name: string, id: string}} a
     */
    set author(a) {
        this._data.author = a
    }
    /**
     * @param {string} v
     */
    set videoId(v) {
        this._data.videoId = v
    }
    /**
     * @param {number} t
     */
    set thumbnailWidth(t) {
        this._data.thumbnailWidth = t
    }
    /**
     * @param {{title: {color: string, fontSize: string}, author: {color: string, fontSize: string, iconSize: string}}} d
     */
    set displaySet(d) {
        this._data.displaySet = d
        if (this._data.displaySet) { //上書きでスタイルを変更する場合に使用します。
            if (this._data.displaySet.title) {
                const title = this._data.displaySet.title
                if (title.color)
                    this.element.videoTitle.style.color = title.color
                if (title.fontSize)
                    this.element.videoTitle.style.fontSize = title.fontSize
            }
            if (this._data.displaySet.author) {
                const author = this._data.displaySet.author
                if (author.color)
                    this.element.videoAuthor.style.color = author.color
                if (author.fontSize)
                    this.element.videoAuthor.style.fontSize = author.fontSize
                if (author.iconSize)
                    this.element.authorIcon.width = author.iconSize
            }
        }
    }
    update() {
        this.element.videoLink.id = "video-" + this._data.videoId
        this.element.videoTitle.innerHTML = this._data.title
        this.element.videoAuthor.innerHTML = this._data.author.name
        this.element.authorIcon.src = "/ytauthorimage/" + this._data.author.id + "?size=32&ratio=" + this._data.ratio
        this.element.clickme.href = "./watch?v=" + this._data.videoId
        this.element.thumbnailimg.src = "/ytimage/" + this._data.videoId + "?size=" + this._data.thumbnailWidth + "&ratio=" + this._data.ratio
    }
}
//ネットから見つけたやぁつぅ
async function getRuleBySelector(sele) {
    const styleSheets = document.styleSheets; //全てのcssを取得する

    for (let i = 0; i < styleSheets.length; i++) { //cssの数だけ
        const cssRules = styleSheets[i].cssRules //ルールを取得
        for (let i = 0; i < cssRules.length; i++) { //ルールの数だけ
            if (sele == cssRules[i].selectorText) { //ルール名と一致するか
                return cssRules[i] //見つけたら返す
            }
        }
    }
    return null //見つからなかったらnull
}
/**
 * バックグラウンドを黒くしたり消したりする関数
 * @param {boolean} status 
 */
async function BlackBackground(status) {
    //暗転するための要素を取得
    const ytBlackBackground = document.getElementById("BlackBackground")
    const blacked = document.getElementsByClassName("Blacked")
    if (status && !blacked) ytBlackBackground.classList.add("Blacked") //クラス「暗転用」を追加
    else if (!status && blacked) ytBlackBackground.classList.remove("Blacked") //クラス「暗転用」を削除
}
/**
 * 自分のコンテキストメニューを表示します。
 * @param {{pageX: number, pageY: number}} e 
 * @param {{title: string, contextmenu: [[{name: string, id: string, data: any}]]}} context 
 */
async function contextmenu(e, context) {
    e.preventDefault() //メニューを表示しないように
    const remove = e => { //非表示にするときの関数
        if (e && contextmenu.classList.contains("contextmenuViewed")) e.preventDefault()
        contextmenu.classList.remove("contextmenuViewed")
    }
    if (!document.getElementById("contextmenu")) {
        const contextmenu = document.createElement("div") //外枠(黒ライン)
        contextmenu.id = "contextmenu"
        contextmenu.classList.add("contextmenu")
        const contextBody = document.createElement("div") //内枠(白ライン)
        contextmenu.appendChild(contextBody)
        contextBody.id = "contextBody"
        addEventListener("click", remove) //クリックした際に非表示に
        let status = 0
        contextmenu.addEventListener("mouseleave", e => { //コンテキストメニューにマウスがないと
            if (status != 0) addEventListener("click", remove) //クリックした際に非表示に
            status = 0
        })
        contextmenu.addEventListener("mouseover", e => { //コンテキストメニューにマウスがあると
            if (status != 1) removeEventListener("click", remove) //クリックしても非表示にならないように
            status = 1
        })
        document.body.appendChild(contextmenu) //コンテキストメニューをbodyに追加
    }
    const contextmenu = document.getElementById("contextmenu")
    const contextBody = document.getElementById("contextBody")
    if (contextmenu.classList.contains("contextmenuViewed")) { //表示中だと
        remove()
        await new Promise(resolve => { //アニメーションが終わるまで待機
            const animationend = () => {
                contextmenu.removeEventListener("animationend", animationend)
                resolve()
            }
            contextmenu.addEventListener("animationend", animationend)
        })
    }
    contextBody.innerHTML = ""
    for (let i = 0; i != context.contextmenu.length; i++) {
        if (i != 0) {
            const partition = document.createElement("div")
            contextBody.appendChild(partition)
            partition.classList.add("contextmenuPT")
            const PTColor = document.createElement("div")
            partition.appendChild(PTColor)
            PTColor.classList.add("contextmenuPTB")
        }
        for (let n = 0; n != context.contextmenu[i].length; n++) {
            const menuData = context.contextmenu[i][n]
            const menu = document.createElement("div")
            contextBody.appendChild(menu)
            menu.classList.add("menuItem")
            menu.innerHTML = menuData.name
            menu.addEventListener("click", e => {
                switch (menuData.id) {
                    case "download": downloadPopup(menuData.data.videoId); break
                    case "youtubeView": window.open("https://www.youtube.com/watch?v=" + menuData.data.videoId); break
                    case "newWindowVideoView":
                        window.open(
                            "http://" + location.hostname + ":" + location.port +
                            "/sources/ytdl/watch?v=" + menuData.data.videoId
                        )
                        break
                    case "clipboardVideoID": navigator.clipboard.writeText(menuData.data.videoId); break
                    case "deleteVideo": deleteVideoPopup(menuData.data.videoId); break
                }
                remove()
            })
        }
    }
    contextmenu.classList.add("contextmenuViewed")
    /**
     * 
     * @param {{pageX: number, pageY: number}} e 
     * @param {{x: boolean, y: boolean}} reverse 
     */
    const set = (e, reverse) => {
        let pageX = e.pageX + 1
        let pageY = e.pageY - 2
        let reverseX = false
        let reverseY = false
        if ((pageX + contextmenu.clientWidth + 7) > document.body.clientWidth)
            if (reverse.x) reverseX = true
            else pageX = document.body.clientWidth - contextmenu.clientWidth - 7
        if ((pageY + contextmenu.clientHeight + 6) > document.body.clientHeight)
            if (reverse.y) reverseY = true
            else pageY = document.body.clientHeight - contextmenu.clientHeight - 6
        if (pageX - 5 < 0) pageX = 5
        if (pageY - 5 < 0) pageY = 5
        if (pageX + 5 > document.body.clientWidth)
            pageX = document.body.clientWidth - 5
        if (pageY + 13 > document.body.clientHeight)
            pageY = document.body.clientHeight - 13
        contextmenu.style.top = pageY - ((reverseY) ? (contextmenu.clientHeight - 7) : 0)
        contextmenu.style.left = pageX - ((reverseX) ? (contextmenu.clientWidth + 3) : 0)
    }
    set(e, { x: true, y: true })
    if (false) addEventListener("mousemove", e => set(e, { x: false, y: false }))
}
async function deleteVideoPopup(videoId) {
    if (!document.getElementById("deleteVideoPopup")) {
        const popup = document.createElement("div")
        document.body.appendChild(popup)
        popup.id = "deleteVideoPopup"
        Object.assign(popup.style, {
            position: "absolute",
            background: "rgba(0, 0, 0, 0.2)",
            top: "0",
            left: "0",
            zIndex: "30",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
        })
        const bodyPopup = document.createElement("div")
        popup.appendChild(bodyPopup)
        Object.assign(bodyPopup.style, {
            maxWidth: "350px",
            maxHeight: "150px",
            background: "white",
            borderRadius: "10px",
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
        })
        const titleBar = document.createElement("div")
        bodyPopup.appendChild(titleBar)
        Object.assign(titleBar.style, {
            width: "100%",
            height: "50%",
            display: "flex"
        })
        const title = document.createElement("div")
        titleBar.appendChild(title)
        Object.assign(title.style, {
            width: "calc(100% - 40px)",
            fontSize: "20px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        })
        title.innerHTML = "削除してもよろしいですか？"
        const closeButoon = document.createElement("div")
        titleBar.appendChild(closeButoon)
        Object.assign(closeButoon.style, {
            width: "40px",
            height: "100%",
            fontSize: "9px",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
            background: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        })
        closeButoon.innerHTML = "閉じる"
        closeButoon.addEventListener("click", e => popup.style.display = "none")
        const info = document.createElement("div")
        bodyPopup.appendChild(info)
        Object.assign(info.style, {
            width: "80%",
            height: "80%",
            display: "flex",
            justifyContent: "space-around"
        })
        info.id = "removePopupInfo"
    }
    const deleteVideoPopup = document.getElementById("deleteVideoPopup")
    const info = document.getElementById("removePopupInfo")
    info.innerHTML = ""

    const Info = {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        flexDirection: "column"
    }
    const button = {
        minWidth: "55px",
        maxWidth: "115px",
        maxHeight: "35px",
        background: "rgb(100, 200, 255)",
        borderRadius: "5px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%"
    }
    const yes = document.createElement("div")
    info.appendChild(yes)
    Object.assign(yes.style, Info)
    const yesButoon = document.createElement("a")
    yes.appendChild(yesButoon)
    Object.assign(yesButoon.style, button)
    yesButoon.innerHTML = "はい"
    yesButoon.addEventListener("click", e => {
        httpDataRequest("ytvideo-delete", videoId)
        document.getElementById("video-" + videoId).remove()
        deleteVideoPopup.style.display = "none"
    })
    const no = document.createElement("div")
    info.appendChild(no)
    Object.assign(no.style, Info)
    const noButoon = document.createElement("a")
    no.appendChild(noButoon)
    Object.assign(noButoon.style, button)
    noButoon.innerHTML = "いいえ"
    noButoon.addEventListener("click", e => deleteVideoPopup.style.display = "none")
    deleteVideoPopup.style.display = "flex"
}
async function downloadPopup(videoId) {
    if (!document.getElementById("downloadPopup")) {
        const popup = document.createElement("div")
        document.body.appendChild(popup)
        popup.id = "downloadPopup"
        Object.assign(popup.style, {
            position: "absolute",
            background: "rgba(0, 0, 0, 0.2)",
            top: "0",
            left: "0",
            zIndex: "30",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
        })
        const bodyPopup = document.createElement("div")
        popup.appendChild(bodyPopup)
        Object.assign(bodyPopup.style, {
            maxWidth: "500px",
            maxHeight: "350px",
            background: "white",
            borderRadius: "10px",
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
        })
        const titleBar = document.createElement("div")
        bodyPopup.appendChild(titleBar)
        Object.assign(titleBar.style, {
            width: "100%",
            height: "15%",
            display: "flex"
        })
        const title = document.createElement("div")
        titleBar.appendChild(title)
        Object.assign(title.style, {
            width: "calc(100% - 40px)",
            fontSize: "30px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        })
        title.innerHTML = "種類を選択してください。"
        const closeButoon = document.createElement("div")
        titleBar.appendChild(closeButoon)
        Object.assign(closeButoon.style, {
            width: "40px",
            height: "100%",
            fontSize: "9px",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
            background: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        })
        closeButoon.innerHTML = "閉じる"
        closeButoon.addEventListener("click", e => popup.style.display = "none")
        const info = document.createElement("div")
        bodyPopup.appendChild(info)
        Object.assign(info.style, {
            width: "80%",
            height: "80%",
            display: "flex",
            justifyContent: "space-around"
        })
        info.id = "popupInfo"
    }
    const downloadPopup = document.getElementById("downloadPopup")
    downloadPopup.style.display = "flex"
    const info = document.getElementById("popupInfo")
    info.innerHTML = ""
    const type = ["mp4", "WebM", "Raw"]
    for (let i = 0; type.length != i; i++) {
        const Info = document.createElement("div")
        info.appendChild(Info)
        Object.assign(Info.style, {
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            flexDirection: "column"
        })
        const text = document.createElement("div")
        Info.appendChild(text)
        Object.assign(text.style, {
            fontSize: "30px",
            fontWeight: "600"
        })
        text.innerHTML = type[i]
        const DLButoon = document.createElement("a")
        Info.appendChild(DLButoon)
        DLButoon.id = type[i] + "Link"
        Object.assign(DLButoon.style, {
            maxWidth: "115px",
            maxHeight: "35px",
            background: "rgb(100, 200, 255)",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
        })
        DLButoon.href = "/ytDownload/" + videoId + "?type=" + i
        DLButoon.innerHTML = "ダウンロード"
    }
}
/**
 * 動画を取得する関数
 * @param {[]} videolist 
 */
async function ytdlInfoGet(videolist) {
    const infoVideos = document.getElementById("infoVideos")
    const infoTitle = document.getElementById("infoTitle")
    infoTitle.innerHTML = "サーバーの返答を待っています..."
    infoVideos.innerHTML = ""
    console.log(videolist)
    let videonum = 0
    for (let i = 0; i != videolist.length; i++) {
        const video = new createVT(infoVideos)
        video.setElement()
        new Promise(async resolve => {
            const videoId = await httpDataRequest("youtube-videoId", videolist[i])
            if (!videoId) {
                video.deleteElement()
                return infoTitle.innerHTML = videonum + "本の動画を取得しました！"
            }
            videonum++
            const videoDetails = JSON.parse(await httpDataRequest("ytdlRawInfoData", videoId))
            infoTitle.innerHTML = videonum + "本の動画を取得しました！"
            video.title = videoDetails.title
            video.author = videoDetails.author
            video.ratio = statusData["ratio"]
            video.thumbnailWidth = 250
            video.videoId = videoId
            video.displaySet = {
                title: {
                    color: "black",
                    fontSize: "10px"
                },
                author: {
                    color: "black",
                    fontSize: "4px",
                    iconSize: "24px"
                }
            }
            video.update()
            resolve()
        })
    }
};
addEventListener("load", async () => {
    const videoList = document.getElementById("videoList") //スクロールなどで使用する
    addEventListener("resize", updateRow)
    updateState()
    updateRow() //動画の列を初期化する
    videoLoad() //初回の動画読み込みをする
    let low = 0
    let scrollHeight = 0
    let clientHeight = 0
    videoList.addEventListener("scroll", async e => {
        /** 
         * 一番下についている場合、1pxだけ上に戻す(多分1px)
         */
        if (scrollHeight - (clientHeight + videoList.scrollTop) < 1) {
            videoList.scrollTop--
            low = 20
        }
        if (low < 15) return low++ //lowが大きくなるまで自他のコードを実行しない
        scrollHeight = videoList.scrollHeight
        clientHeight = videoList.clientHeight
        low = 0
        if (await ifScrollBottom()) videoLoad() //スクロールすると動画を読み込むかを検証する
    })
    const ytURLSend = document.getElementById("URLSend") //ボタンの取得
    const infoPopup = document.getElementById("infoPopup") //ポップアップウィンドウを取得
    const ytURLBox = document.getElementById("URLBox") //テキストボックスの取得
    const msDataBox = document.getElementById("msDataBox") //テキストボックスの取得
    ytURLSend.addEventListener("click", async e => { //クリックされたら
        infoPopup.classList.add("Popuped") //クラス「ポップアップ有効化用」を追加
        BlackBackground(true)
        ytdlInfoGet([ytURLBox.value]) //関数に送信
    })
    const offlineSearch = document.getElementById("offlineSearch")
    offlineSearch.addEventListener("click", async e => {
        let videoIds = [] //検索に一致するとここに追加
        let searchStrings = ytURLBox.value.split(" ")
        /**
         * @type {{[num: string]: {[videoId: string]: boolean}}}
         */
        let matching = {
            0: {}
        }
        for (let i = 0; i != statusData["videoIds"].length; i++) { //VideoIDの数だけ
            const videoId = statusData["videoIds"][i]
            for (let m = 0; m != searchStrings.length; m++) { //検索ボックスにスペース区切りした分だけ
                //一致するかどうか
                const ifString = async (e, data) => {
                    if (!e) return
                    let num = 0 //優先度
                    if (data == searchStrings[m]) num += 1 //完全一致した場合は優先度を上げる
                    await new Promise(resolve => {
                        const mtObj = Object.keys(matching) //マッチの優先度を記したデータ
                        for (let i = 0; i != mtObj.length; i++) { //優先度の数だけ
                            if (matching[mtObj[i]][videoId]) { //VideoIDがある場合
                                matching[mtObj[i]][videoId] = false //元のVideoIDを無効化
                                num += Number(mtObj[i]) + 1 //優先度をあげる
                                resolve()
                            }
                        }
                        num += (searchStrings.length - m) * 2 //ない場合は優先度を設定し追加
                        resolve()
                    })
                    if (num != 0 && !num) {
                        console.log("検索時に優先度を設定した結果、予期せぬエラーが発生しました。", num)
                        num = 0
                    }
                    if (!matching[num]) matching[num] = {}
                    matching[num][videoId] = true //追加
                    console.log(videoId, num)
                }
                /**
                 * @type {string}
                 */
                const data = statusData["ytIndex"][videoId]
                await ifString(data.title.match(searchStrings[m]), data.title)
                await ifString(data.author.name.match(searchStrings[m]), data.author.name)
            }
        }
        const mtObj = Object.keys(matching) //マッチの優先度を記したデータ
        console.log(matching, mtObj)
        for (let i = mtObj[mtObj.length - 1]; i > 0; i--) { //一致した数の量だけ
            if (Number(mtObj[i])) { //存在するかどうか
                const videoIdObj = Object.keys(matching[mtObj[i]])
                for (let m = 0; m < videoIdObj.length; m++) //その中に含まれたVideoIDの数だけ
                    if (matching[mtObj[i]][videoIdObj[m]]) videoIds.push(videoIdObj[m])
            }
        }
        infoPopup.classList.add("Popuped") //クラス「ポップアップ有効化用」を追加
        BlackBackground(true)
        ytdlInfoGet(videoIds) //関数に送信
    })
    const infoPopupCloseBtn = document.getElementById("infoPopupCloseBtn") //ポップアップを閉じるボタンの取得
    infoPopupCloseBtn.addEventListener("click", async e => { //クリックされたら
        infoPopup.classList.remove("Popuped") //クラス「ポップアップ有効化用」を削除
        BlackBackground(false)
    })
    const ytmultichoice = document.getElementById("multichoice") //ボタンの取得
    const multichoicePopup = document.getElementById("msPopup") //ポップアップウィンドウを取得
    ytmultichoice.addEventListener("click", async e => { //クリックされたら
        multichoicePopup.classList.add("Popuped") //クラス「ポップアップ有効化用」を追加
        BlackBackground(true)
    })
    const multichoiceCloseBtn = document.getElementById("msPopupCloseBtn") //ポップアップを閉じるボタンの取得
    multichoiceCloseBtn.addEventListener("click", async e => { //クリックされたら
        multichoicePopup.classList.remove("Popuped") //クラス「ポップアップ有効化用」を削除
        BlackBackground(false)
    })
    const MultiURLSend = document.getElementById("MultiURLSend") //ボタンの取得
    MultiURLSend.addEventListener("click", async e => {
        const text = msDataBox.value
        try {
            ytdlInfoGet(JSON.parse(text))
        } catch (e) {
            console.log(e)
            ytdlInfoGet(text.split("\n"))
        };
        multichoicePopup.classList.remove("Popuped")
        infoPopup.classList.add("Popuped") //クラス「ポップアップ有効化用」を追加
    })
});
