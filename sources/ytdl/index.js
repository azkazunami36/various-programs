/**
 * httpリクエストできる関数
 * @param {string} request 
 * @param {any} send 
 * @returns 
 */
const httpDataRequest = async (request, send) => {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request)
        xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
        xhr.send(send); //データを送信
        xhr.onreadystatechange = async () => { if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText) } //レスポンスを返す
    })
}
/**
 * 待機
 * @param {number} time 
 */
const wait = async time => await new Promise(resolve => setTimeout(() => resolve(), time))

addEventListener("load", async () => {
    const status = {
        videoLoaded: 0, //表示済みの動画をカウント
        videoIds: [], //取得したVideoID
        ytIndex: {}, //インデックスデータを格納
        videoloading: false, //読み込み中かどうか
        videoRow: 0, //横に並べる動画の数
        popupVideoRow: 0,
        ratio: 1, //ブラウザの倍率
        thumbnailWidth: 320 //最大のサムネイルの表示大きさ。320でYouTube
    }
    const videoList = document.getElementById("videoList") //スクロールなどで使用する
    const VideoListCenter = document.getElementById("VideoListCenter") //動画を表示するために使用する
    const infoVideos = document.getElementById("infoVideos") //追加の動画を入手したとき表示するために使用する
    /**
     * 最もわかりやすく言うと、一番下ならtrueを返すという意味です。  
     * １: cHeight(画面の高さ)+動画の並ぶ数x100した数  
     * ２: 一番下から数えた数  
     * この２が１より小さいとなった場合、trueが返されます。
     */
    function ifScrollBottom() {
        const sHeight = videoList.scrollHeight //要素の高さ
        const cHeight = videoList.clientHeight //クライアントに映ってる要素の高さ
        const sTop = videoList.scrollTop //スクロールされている場所
        const cBottom = cHeight + sTop //下を基準にするため
        const sBottom = sHeight - cBottom //下から数えたスクロールされている場所
        return status["videoRow"] * 100 + cHeight > sBottom
    }
    /**
     * 倍率状態を更新します。
     */
    function updateRatio() { status["ratio"] = (window.devicePixelRatio || 1).toFixed(2) }
    /**
     * 動画の並ぶ数を更新します。
     */
    function updateRow() {
        const videonum = (VideoListCenter.clientWidth / status["thumbnailWidth"]).toFixed()
        if (videonum != status["videoRow"]) {
            const videoLinkStyle = getRuleBySelector(".VideoLink")
            status["videoRow"] = videonum
            //スタイルに反映
            videoLinkStyle.style.width = "calc(100% / " + String(videonum) + ")"
        }
        const popupvideonum = (infoVideos.clientWidth / 250).toFixed()
        if (popupvideonum != status["popupVideoRow"]) {
            const popupvideoLinkStyle = getRuleBySelector(".popupVideoLink")
            status["popupVideoRow"] = popupvideonum
            //スタイルに反映
            popupvideoLinkStyle.style.width = "calc(100% / " + String(videonum) + ")"
        }
        if (ifScrollBottom()) videoLoad() //サイズ変更時に一番下まで移動してしまったら読み込む
    }
    function updateState() {
        updateRatio()
        updateRow()
    }
    updateState()
    /**
     * 動画を取得しリストに追加する関数
     * @param {boolean} g 読み込み中でも実行するか
     */
    async function videoLoad(g) {
        //読み込み中で無視がfalseならリターン
        if (status["videoloading"] && !g) return
        status["videoloading"] = true //読み込み中
        //ブラウザサイズからどれほど動画を並べられるか判断
        updateRow()
        if (!status["videoIds"][0]) { //videoIdsが無かったらサーバーからデータを取得する
            status["ytIndex"] = JSON.parse(await httpDataRequest("ytindex-list"))
            status["videoIds"] = Object.keys(status["ytIndex"])
            for (let i = 0; status["videoIds"].length != i; i++) {
                const rm = Math.floor(Math.random() * i)
                let tmp = status["videoIds"][i]
                status["videoIds"][i] = status["videoIds"][rm]
                status["videoIds"][rm] = tmp
                console.log(status["videoIds"][i])
            }
        }
        //表示済み数がVideoIDsと同じならリターン
        if (status["videoLoaded"] == status["videoIds"].length) return
        for (let i = 0; i != status["videoRow"]; i++) {
            if (status["videoLoaded"] == status["videoIds"].length) return //読み込める動画が無くなるとリターン
            const videoId = status["videoIds"][status["videoLoaded"]] //VideoID
            updateRatio()
            status["videoLoaded"]++
            createVT(VideoListCenter, {
                ratio: status["ratio"],
                videoId: videoId,
                thumbnailWidth: status["thumbnailWidth"],
                data: status["ytIndex"][videoId]
            })
        }
        //もし処理中の隙に一番下までスクロールされていたらすぐに次の読み込みをする
        if (ifScrollBottom()) videoLoad(true)
        else status["videoloading"] = false //出なければ読み込み終了
    }
    /**
     * 関数に入力されるデータのガイドです。
     */
    const createVTdata = {
        ratio: 0,
        videoId: "",
        thumbnailWidth: 0,
        data: {
            title: "",
            author: {
                id: "",
                name: ""
            }
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
        }
    }
    /**
     * 動画へ飛ぶリンクを持った、画像付きのボタンを作成します。
     * @param {HTMLElement} Element
     * @param {createVTdata} data
     * @returns 
     */
    async function createVT(Element, data) {
        const { ratio, videoId, thumbnailWidth, displaySet } = data
        const { title, author } = data.data
        const videoLink = document.createElement("div")
        videoLink.classList.add("VideoLink")
        Element.appendChild(videoLink)

        const videoWindow = document.createElement("div")
        videoWindow.classList.add("VideoWindow")
        videoLink.appendChild(videoWindow)

        const thumbnailImage = document.createElement("div")
        thumbnailImage.classList.add("ThumbnailImage")
        videoWindow.appendChild(thumbnailImage)

        const thumbnailimg = document.createElement("img")
        thumbnailimg.classList.add("Thumbnailimg")
        thumbnailimg.src = "/ytimage/" + videoId + "?size=" + thumbnailWidth + "&ratio=" + ratio
        thumbnailImage.appendChild(thumbnailimg)

        const titleAria = document.createElement("div")
        titleAria.classList.add("TitleAria")
        videoWindow.appendChild(titleAria)

        const iconAria = document.createElement("div")
        iconAria.classList.add("IconAria")
        titleAria.appendChild(iconAria)

        const infoAria = document.createElement("div")
        infoAria.classList.add("InfoAria")
        titleAria.appendChild(infoAria)

        const authorIcon = document.createElement("img")
        authorIcon.classList.add("AuthorIcon")
        authorIcon.src = "/ytauthorimage/" + author.id + "?size=32&ratio=" + ratio
        iconAria.appendChild(authorIcon)

        const videoTitle = document.createElement("p")
        videoTitle.classList.add("VideoTitle")
        videoTitle.innerHTML = title
        infoAria.appendChild(videoTitle)

        const videoAuthor = document.createElement("p")
        videoAuthor.classList.add("VideoAuthor")
        videoAuthor.innerHTML = author.name
        infoAria.appendChild(videoAuthor)

        const clickme = document.createElement("a")
        clickme.classList.add("clickme")
        clickme.href = "./watch?v=" + videoId
        videoWindow.appendChild(clickme)

        if (displaySet) { //上書きでスタイルを変更する場合に使用します。
            if (displaySet.title) {
                const title = displaySet.title
                if (title.color)
                    videoTitle.style.color = title.color
                if (title.fontSize)
                    videoTitle.style.fontSize = title.fontSize
            }
            if (displaySet.author) {
                const author = displaySet.author
                if (author.color)
                    videoAuthor.style.color = author.color
                if (author.fontSize)
                    videoAuthor.style.fontSize = author.fontSize
                if (author.iconSize)
                    authorIcon.width = author.iconSize
            }
        }
        videoWindow.addEventListener("contextmenu", async e => {
            contextmenu(e, {
                title: videoId,
                contextmenu: [
                    [
                        {
                            name: "ダウンロード",
                            id: "download",
                            data: {
                                videoId: videoId
                            }
                        },
                        {
                            name: "\"" + videoId + "\"を削除",
                            id: "download",
                            data: {
                                videoId: videoId
                            }
                        },
                        {
                            name: "情報を編集",
                            id: "download",
                            data: {
                                videoId: videoId
                            }
                        }
                    ],
                    [
                        {
                            name: "\"" + videoId + "\"からクリップを作成",
                            id: "download",
                            data: {
                                videoId: videoId
                            }
                        }
                    ]
                ]
            })
        })
    }
    addEventListener("resize", updateRow)
    //ネットから見つけたやぁつぅ
    function getRuleBySelector(sele) {
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
    updateRow() //動画の列を初期化する
    videoList.addEventListener("scroll", e => {
        /** 
         * 一番下についている場合、1pxだけ上に戻す(多分1px)
         */
        if (videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < 1) videoList.scrollTop--
        if (ifScrollBottom()) videoLoad() //スクロールすると動画を読み込むかを検証する
    })
    videoLoad() //初回の動画読み込みをする
    /**
     * バックグラウンドを黒くしたり消したりする関数
     * @param {boolean} status 
     */
    function BlackBackground(status) {
        //暗転するための要素を取得
        const ytBlackBackground = document.getElementById("BlackBackground")
        const blacked = document.getElementsByClassName("Blacked")
        if (status && !blacked) ytBlackBackground.classList.add("Blacked") //クラス「暗転用」を追加
        else if (!status && blacked) ytBlackBackground.classList.remove("Blacked") //クラス「暗転用」を削除
    };
    const ytURLSend = document.getElementById("URLSend") //ボタンの取得
    const infoPopup = document.getElementById("infoPopup") //ポップアップウィンドウを取得
    const ytURLBox = document.getElementById("URLBox") //テキストボックスの取得
    const msDataBox = document.getElementById("msDataBox") //テキストボックスの取得
    ytURLSend.addEventListener("click", e => { //クリックされたら
        infoPopup.classList.add("Popuped") //クラス「ポップアップ有効化用」を追加
        BlackBackground(true)
        ytdlInfoGet([ytURLBox.value]) //関数に送信
    })
    const infoPopupCloseBtn = document.getElementById("infoPopupCloseBtn") //ポップアップを閉じるボタンの取得
    infoPopupCloseBtn.addEventListener("click", e => { //クリックされたら
        infoPopup.classList.remove("Popuped") //クラス「ポップアップ有効化用」を削除
        BlackBackground(false)
    })
    const ytmultichoice = document.getElementById("multichoice") //ボタンの取得
    const multichoicePopup = document.getElementById("msPopup") //ポップアップウィンドウを取得
    ytmultichoice.addEventListener("click", e => { //クリックされたら
        multichoicePopup.classList.add("Popuped") //クラス「ポップアップ有効化用」を追加
        BlackBackground(true)
    })
    const multichoiceCloseBtn = document.getElementById("msPopupCloseBtn") //ポップアップを閉じるボタンの取得
    multichoiceCloseBtn.addEventListener("click", e => { //クリックされたら
        multichoicePopup.classList.remove("Popuped") //クラス「ポップアップ有効化用」を削除
        BlackBackground(false)
    })
    const MultiURLSend = document.getElementById("MultiURLSend") //ボタンの取得
    MultiURLSend.addEventListener("click", e => {
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
    /**
     * 自分のコンテキストメニューを表示します。
     * @param {{pageX: number, pageY: number}} e 
     * @param {{title: string, contextmenu: [[{name: string, id: string, data: any}]]}} context 
     */
    const contextmenu = async (e, context) => {
        e.preventDefault() //メニューを表示しないように
        const remove = e => contextmenu.classList.remove("contextmenuViewed") //非表示にするときの関数
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
                    }
                    remove()
                })
            }
        }
        contextmenu.classList.add("contextmenuViewed")
        let pageX = e.pageX + 2
        let pageY = e.pageY - 5
        if ((contextmenu.clientWidth + pageX) > document.body.clientWidth)
            pageX = document.body.clientWidth - contextmenu.clientWidth
        if ((contextmenu.clientHeight + pageY) > document.body.clientHeight)
            pageY = document.body.clientHeight - contextmenu.clientHeight
        contextmenu.style.top = pageY
        contextmenu.style.left = pageX
    }
    const downloadPopup = videoId => {
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
    const ytdlInfoGet = async videolist => {
        const infoTitle = document.getElementById("infoTitle")
        infoTitle.innerHTML = "サーバーの返答を待っています..."
        infoVideos.innerHTML = ""
        console.log(videolist)
        let thumbnailWidth = 250 //ちいさなウィンドウの中で表示するため
        let videonum = 0
        for (let i = 0; i != videolist.length; i++) {
            new Promise(async resolve => {
                const videoId = await httpDataRequest("youtube-videoId", videolist[i])
                if (!videoId) {
                    return infoTitle.innerHTML = videonum + "本の動画を取得しました！"
                } else videonum++
                const videoDetails = JSON.parse(await httpDataRequest("ytdlRawInfoData", videoId))
                console.log(videoId, videoDetails)
                infoTitle.innerHTML = videonum + "本の動画を取得しました！"
                createVT(infoVideos, {
                    ratio: status["ratio"],
                    videoId,
                    thumbnailWidth: 250,
                    data: videoDetails,
                    displaySet: {
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
                })
                resolve()
            })
        }
    };
});
