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
        xhr.onreadystatechange = async () => {
            //レスポンスを返す
            if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText)
        }
    })
}
/**
 * 待機
 * @param {number} time 
 */
const wait = async time => {
    await new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
addEventListener("load", async () => {
    const videoList = document.getElementById("videoList") //スクロールなどで使用する
    const VideoListCenter = document.getElementById("VideoListCenter") //動画を表示するために使用する
    const infoVideos = document.getElementById("infoVideos") //追加の動画を入手したとき表示するために使用する
    const thumbnailWidth = 320 //最大のサムネイルの表示大きさ。320でYouTube
    const videoRowReload = () => {
        const sHeight = videoList.scrollHeight //要素の高さ
        const cWidth = videoList.clientWidth //クライアントの横幅
        const cHeight = videoList.clientHeight //クライアントに映ってる要素の高さ
        const sTop = videoList.scrollTop //スクロールされている場所
        const cBottom = cHeight + sTop //下を基準にするため
        const sBottom = sHeight - cBottom //下から数えたスクロールされている場所
        const videorow = (VideoListCenter.clientWidth / thumbnailWidth).toFixed() //横にリストを並べる数を決める
        if (sBottom < videorow * 100 + cHeight) videoLoad()
    }
    let videoLoaded = 0 //ロード済みの動画をカウント
    let videos //サーバーから取得したVideoIDを保管
    let videoloading = false //読み込み中かどうか
    /**
     * 動画を取得しリストに追加する関数
     * @param {boolean} g 読み込み中でも実行するか
     * @returns 
     */
    const videoLoad = async g => {
        if (videoloading && !g) return //読み込み中で無視がfalseならリターン
        videoloading = true //読み込み中
        //ブラウザサイズからどれほど動画を並べられるか判断
        const row = (VideoListCenter.clientWidth / thumbnailWidth).toFixed()
        //videosが無かったらサーバーからデータを取得する
        if (!videos) {
            videos = JSON.parse(await httpDataRequest("ytvideo-list"))
            let logout = ""
            for (let i = 0; videos.length != i; i++) logout += videos[i] + "\n"
            console.log(logout)
        }
        if (videoLoaded > (videos.length - 1)) return //読み込める動画がもう無かったらリターン
        for (let i = 0; i != row; i++) {
            new Promise(async resolve => {
                if (videoLoaded > (videos.length - 1)) return //読み込める動画がもう無かったらリターン
                const videoLink = document.createElement("div")
                VideoListCenter.appendChild(videoLink)

                const videoId = videos[videoLoaded] //VideoID
                const ratio = (window.devicePixelRatio || 1).toFixed(2)
                const videoWindow = document.createElement("div")
                const thumbnailImage = document.createElement("div")
                const thumbnailimg = document.createElement("img")
                const titleAria = document.createElement("div")
                const iconAria = document.createElement("div")
                const infoAria = document.createElement("div")
                const authorIcon = document.createElement("img")
                const videoTitle = document.createElement("p")
                const videoAuthor = document.createElement("p")
                const clickme = document.createElement("a")
                videoLink.classList.add("VideoLink")
                videoWindow.classList.add("VideoWindow")
                thumbnailImage.classList.add("ThumbnailImage")
                thumbnailimg.classList.add("Thumbnailimg")
                titleAria.classList.add("TitleAria")
                iconAria.classList.add("IconAria")
                infoAria.classList.add("InfoAria")
                authorIcon.classList.add("AuthorIcon")
                videoTitle.classList.add("VideoTitle")
                videoAuthor.classList.add("VideoAuthor")
                clickme.classList.add("clickme")
                thumbnailimg.src = "/ytimage/" + videoId + "?size=" + thumbnailWidth + "&ratio=" + ratio
                clickme.href = "./watch?v=" + videoId
                videoLink.appendChild(videoWindow)
                videoWindow.appendChild(thumbnailImage)
                videoWindow.appendChild(titleAria)
                videoWindow.appendChild(clickme)
                thumbnailImage.appendChild(thumbnailimg)
                infoAria.appendChild(videoTitle)
                infoAria.appendChild(videoAuthor)
                iconAria.appendChild(authorIcon)
                titleAria.appendChild(iconAria)
                titleAria.appendChild(infoAria)
                videoWindow.addEventListener("contextmenu", async e => {
                    contextmenu(e, [
                        [
                            {
                                name: "ダウンロード",
                                id: "download",
                                data: {
                                    videoId: videoId
                                }
                            }
                        ]
                    ])
                })
                new Promise(async resolve => {
                    videoTitle.innerHTML = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                        videoId: videoId,
                        request: "title"
                    })))
                    resolve()
                })
                new Promise(async resolve => {
                    const author = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                        videoId: videoId,
                        request: "author"
                    })))
                    videoAuthor.innerHTML = author.name
                    authorIcon.src = "/ytauthorimage/" + author.id + "?size=32&ratio=" + ratio
                    resolve()
                })
                await wait(1)
                resolve()
            })
            videoLoaded++
        }
        //もし処理中の隙に一番下までスクロールされていたらすぐに次の読み込みをする
        if ((videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < (VideoListCenter.clientWidth / thumbnailWidth).toFixed() * 100 + document.body.clientHeight)) videoLoad(true)
        else videoloading = false //出なければ読み込み終了
    }
    let ratio = (window.devicePixelRatio || 1).toFixed(2)
    addEventListener("resize", e => {
        videoNumberReload()
        if (ratio != (window.devicePixelRatio || 1).toFixed(2) && false) {
            imgratio = (window.devicePixelRatio || 1).toFixed(2)
            const Thumbnailimgs = document.getElementsByClassName("Thumbnailimg")
            if (Thumbnailimgs[0]) for (let i = 0; i != Thumbnailimgs.length; i++) {
                /**
                 * @type {string}
                 */
                const src = Thumbnailimgs[i].src
                const videoId = src.split("ytimage/")[1].split("?")[0]
                Thumbnailimgs[i].src = "../../ytimage/" + videoId + "?size=360&ratio=" + imgratio
            }
            console.log(imgratio)
        }
    })
    //ブラウザサイズが変わると
    let videorow = 0
    let popupvideorow = 0
    /**
     * 動画の列を決める関数
     */
    const videoNumberReload = () => {
        const videonum = (VideoListCenter.clientWidth / thumbnailWidth).toFixed()
        const popupvideonum = (infoVideos.clientWidth / 250).toFixed()
        const videoLinkStyle = getRuleBySelector(".VideoLink")
        const popupvideoLinkStyle = getRuleBySelector(".popupVideoLink")
        if (videonum != videorow) {
            videorow = videonum
            //スタイルに反映
            videoLinkStyle.style.width = "calc(100% / " + String(videonum) + ")"
        }
        if (popupvideonum != popupvideorow) {
            popupvideorow = popupvideonum
            //スタイルに反映
            popupvideoLinkStyle.style.width = "calc(100% / " + String(videonum) + ")"
        }
        //サイズ変更時に一番下まで移動してしまったら読み込む
        videoRowReload()
    }
    //ネットから見つけたやぁつぅ
    const getRuleBySelector = sele => {
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
    videoNumberReload() //動画の列を初期化する
    videoList.addEventListener("scroll", e => {
        if (videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < 1) videoList.scrollTop--
        videoRowReload() //スクロールすると動画を読み込むかを検証する
    })
    videoLoad() //初回の動画読み込みをする
    let backgroundstatus = false //バックグラウンドが黒く染まっているかどうか
    /**
     * バックグラウンドを黒くしたり消したりする関数
     * @param {boolean} status 
     */
    const BlackBackground = status => {
        //暗転するための要素を取得
        const ytBlackBackground = document.getElementById("BlackBackground")
        if (status && backgroundstatus == false) {
            //クラス「暗転用」を追加
            ytBlackBackground.classList.add("Blacked")
            backgroundstatus = true
        } else if (!status && backgroundstatus == true) {
            //クラス「暗転用」を削除
            ytBlackBackground.classList.remove("Blacked")
            backgroundstatus = false
        };
    };
    //ボタンの取得
    const ytURLSend = document.getElementById("URLSend")
    //ポップアップウィンドウを取得
    const infoPopup = document.getElementById("infoPopup")
    //テキストボックスの取得
    const ytURLBox = document.getElementById("URLBox")
    //テキストボックスの取得
    const msDataBox = document.getElementById("msDataBox")
    //クリックされたら
    ytURLSend.addEventListener("click", e => {
        //クラス「ポップアップ有効化用」を追加
        infoPopup.classList.add("Popuped")
        BlackBackground(true)
        //関数に送信
        ytdlInfoGet([ytURLBox.value])
    });
    //ポップアップを閉じるボタンの取得
    const infoPopupCloseBtn = document.getElementById("infoPopupCloseBtn")
    //クリックされたら
    infoPopupCloseBtn.addEventListener("click", e => {
        //クラス「ポップアップ有効化用」を削除
        infoPopup.classList.remove("Popuped")
        BlackBackground(false)
    })
    //ボタンの取得
    const ytmultichoice = document.getElementById("multichoice")
    //ポップアップウィンドウを取得
    const multichoicePopup = document.getElementById("msPopup")
    //クリックされたら
    ytmultichoice.addEventListener("click", e => {
        //クラス「ポップアップ有効化用」を追加
        multichoicePopup.classList.add("Popuped")
        BlackBackground(true)
    });
    //ポップアップを閉じるボタンの取得
    const multichoiceCloseBtn = document.getElementById("msPopupCloseBtn")
    //クリックされたら
    multichoiceCloseBtn.addEventListener("click", e => {
        //クラス「ポップアップ有効化用」を削除
        multichoicePopup.classList.remove("Popuped");
        BlackBackground(false);
    });
    const MultiURLSend = document.getElementById("MultiURLSend")
    MultiURLSend.addEventListener("click", e => {
        const text = msDataBox.value
        try {
            ytdlInfoGet(JSON.parse(text))
        } catch (e) {
            console.log(e)
            ytdlInfoGet(text.split("\n"))
        };
        multichoicePopup.classList.remove("Popuped")
        //クラス「ポップアップ有効化用」を追加
        infoPopup.classList.add("Popuped")
    })
    /**
     * 自分のコンテキストメニューを表示します。
     * @param e 
     * @param {[[{name: string, id: string, data: any}]]} data 
     */
    const contextmenu = async (e, data) => {
        e.preventDefault()
        const remove = e => {
            contextmenu.classList.remove("contextmenuViewed")
            removeEventListener("click", remove)
            removeEventListener("contextmenu", remove)
        }
        removeEventListener("click", remove)
        removeEventListener("contextmenu", remove)
        if (!document.getElementById("contextmenu")) {
            const contextmenu = document.createElement("div")
            document.body.appendChild(contextmenu)
            contextmenu.id = "contextmenu"
            contextmenu.classList.add("contextmenu")
        }
        const contextmenu = document.getElementById("contextmenu")
        await wait(1)
        contextmenu.addEventListener("mouseleave", e => { console.log("n") })
        addEventListener("click", remove)
        addEventListener("contextmenu", remove)
        if (await new Promise(resolve => {
            for (let i = 0; contextmenu.classList.length != i; i++)
                if (contextmenu.classList[i] == "contextmenuViewed") resolve(true)
            resolve(false)
        })) {
            console.log("ほ")
            contextmenu.classList.remove("contextmenuViewed")
            await wait(250)
        }
        contextmenu.classList.add("contextmenuViewed")
        contextmenu.style.top = e.pageY
        contextmenu.style.left = e.pageX
        contextmenu.innerHTML = ""
        for (let i = 0; i != data.length; i++) {
            if (i != 0) {
                const partition = document.createElement("div")
                contextmenu.appendChild(partition)
                partition.classList.add("contextmenuPT")
                const PTColor = document.createElement("div")
                partition.appendChild(PTColor)
                PTColor.classList.add("contextmenuPTB")
            }
            for (let n = 0; n != data[i].length; n++) {
                const menuData = data[i][n]
                const menu = document.createElement("div")
                contextmenu.appendChild(menu)
                menu.classList.add("menuItem")
                menu.innerHTML = menuData.name
                switch (menuData.id) {
                    case "download": {
                        menu.addEventListener("click", e => {
                            const fill = {
                                width: "100%",
                                height: "100%"
                            }
                            const center = {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }
                            const boldText = {
                                fontSize: "30px",
                                fontWeight: "600"
                            }
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
                                    ...fill,
                                    ...center
                                })
                                const bodyPopup = document.createElement("div")
                                popup.appendChild(bodyPopup)
                                Object.assign(bodyPopup.style, {
                                    maxWidth: "500px",
                                    maxHeight: "350px",
                                    background: "white",
                                    borderRadius: "10px",
                                    flexDirection: "column",
                                    ...center,
                                    ...fill
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
                                    ...boldText,
                                    ...center
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
                                    ...center
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
                            } else {
                                downloadPopup.style.display = "flex"
                            }
                            const downloadPopup = document.getElementById("downloadPopup")
                            const info = document.getElementById("popupInfo")
                            info.innerHTML = ""
                            const videoId = menuData.data.videoId
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
                                    ...boldText
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
                                    ...fill,
                                    ...center
                                })
                                DLButoon.href = "/ytDownload/" + videoId + "?type=" + i
                                DLButoon.innerHTML = "ダウンロード"
                            }
                        })
                    }
                }
            }
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
                console.log(videoId)
                videonum++
                infoTitle.innerHTML = videonum + "本の動画を取得しました！"
                const popupVideoLink = document.createElement("div")
                infoVideos.appendChild(popupVideoLink)
                const ratio = (window.devicePixelRatio || 1).toFixed(2)
                const videoWindow = document.createElement("div")
                const thumbnailImage = document.createElement("div")
                const thumbnailimg = document.createElement("img")
                const titleAria = document.createElement("div")
                const iconAria = document.createElement("div")
                const infoAria = document.createElement("div")
                const authorIcon = document.createElement("img")
                const videoTitle = document.createElement("div")
                const videoAuthor = document.createElement("div")
                const clickme = document.createElement("a")
                popupVideoLink.classList.add("popupVideoLink")
                videoWindow.classList.add("VideoWindow")
                thumbnailImage.classList.add("ThumbnailImage")
                thumbnailimg.classList.add("Thumbnailimg")
                titleAria.classList.add("TitleAria")
                iconAria.classList.add("IconAria")
                infoAria.classList.add("InfoAria")
                authorIcon.classList.add("AuthorIcon")
                authorIcon.style.width = "24px"
                videoTitle.classList.add("VideoTitle")
                videoTitle.style.color = "black"
                videoTitle.style.fontSize = "10px"
                videoAuthor.classList.add("VideoAuthor")
                videoAuthor.style.color = "black"
                videoAuthor.style.fontSize = "4px"
                clickme.classList.add("clickme")
                thumbnailimg.src = "/ytimage/" + videoId + "?size=" + thumbnailWidth + "&ratio=" + ratio
                clickme.href = "./watch?v=" + videoId
                popupVideoLink.appendChild(videoWindow)
                videoWindow.appendChild(thumbnailImage)
                videoWindow.appendChild(titleAria)
                videoWindow.appendChild(clickme)
                thumbnailImage.appendChild(thumbnailimg)
                infoAria.appendChild(videoTitle)
                infoAria.appendChild(videoAuthor)
                iconAria.appendChild(authorIcon)
                titleAria.appendChild(iconAria)
                titleAria.appendChild(infoAria)
                videoWindow.addEventListener("contextmenu", async e => {
                    contextmenu(e, [
                        [
                            {
                                name: "ダウンロード",
                                id: "download",
                                data: {
                                    videoId: videoId
                                }
                            }
                        ]
                    ])
                })
                new Promise(async resolve => {
                    videoTitle.innerHTML = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                        videoId: videoId,
                        request: "title"
                    })))
                    resolve()
                })
                new Promise(async resolve => {
                    const author = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                        videoId: videoId,
                        request: "author"
                    })))
                    videoAuthor.innerHTML = author.name
                    authorIcon.src = "/ytauthorimage/" + author.id + "?size=32&ratio=" + ratio
                    resolve()
                })
                resolve()
            })
        }
    };
});
