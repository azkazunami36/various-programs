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
    const thumbnailWidth = 275 //最大のサムネイルの表示大きさ
    const videoRowReload = () => {
        const sHeight = videoList.scrollHeight //要素の高さ
        const cWidth = videoList.clientWidth //クライアントの横幅
        const cHeight = videoList.clientHeight //クライアントに映ってる要素の高さ
        const sTop = videoList.scrollTop //スクロールされている場所
        const cBottom = cHeight + sTop //下を基準にするため
        const sBottom = sHeight - cBottom //下から数えたスクロールされている場所
        const videorow = (cWidth / thumbnailWidth).toFixed() //横にリストを並べる数を決める
        if ((sBottom < videorow * 100 + cHeight)) videoLoad()
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
        const row = (document.body.clientWidth / thumbnailWidth).toFixed()
        //videosが無かったらサーバーからデータを取得する
        if (!videos) videos = JSON.parse(await httpDataRequest("ytvideo-list"))
        if (videoLoaded > (videos.length - 1)) return //読み込める動画がもう無かったらリターン
        for (let i = 0; i != row; i++) {
            const videoLink = document.createElement("div")
            VideoListCenter.appendChild(videoLink)
            new Promise(resolve => {
                if (videoLoaded > (videos.length - 1)) return //読み込める動画がもう無かったらリターン

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
                new Promise(async resolve => {
                    videoTitle.innerHTML = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                        videoId: videoId,
                        request: "title"
                    })))
                    const author = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                        videoId: videoId,
                        request: "author"
                    })))
                    videoAuthor.innerHTML = author.name
                    authorIcon.src = "/ytauthorimage/" + author.id + "?size=32&ratio=" + ratio
                    resolve()
                })
            })
            videoLoaded++
        }
        //もし処理中の隙に一番下までスクロールされていたらすぐに次の読み込みをする
        if ((videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < (document.body.clientWidth / thumbnailWidth).toFixed() * 100 + document.body.clientHeight)) videoLoad(true)
        else videoloading = false //出なければ読み込み終了
    }
    let ratio = (window.devicePixelRatio || 1).toFixed(2)
    addEventListener("resize", e => {
        videoNumberReload()
        if (ratio != (window.devicePixelRatio || 1).toFixed(2)) {
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
    }) //ブラウザサイズが変わると
    let videorow = 0
    /**
     * 動画の列を決める関数
     */
    const videoNumberReload = () => {
        const videonum = (document.body.clientWidth / thumbnailWidth).toFixed()
        if (videonum == videorow) return //数値を買える必要が無かったらリターン
        videorow = videonum
        //スタイルに反映
        document.documentElement.style.setProperty("--video-layout", String(videonum))
        //サイズ変更時に一番下まで移動してしまったら読み込む
        videoRowReload()
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
            ytdlInfoGet(text.split("\n"))
        };
        multichoicePopup.classList.remove("Popuped")
        //クラス「ポップアップ有効化用」を追加
        infoPopup.classList.add("Popuped")
    })
});
/**
 * 動画を取得する関数
 * @param {[]} videolist 
 */
const ytdlInfoGet = async videolist => {
    const infoTitle = document.getElementById("infoTitle")
    infoTitle.innerHTML = "サーバーの返答を待っています..."
    const infoVideos = document.getElementById("infoVideos")
    infoVideos.innerHTML = ""
    console.log(videolist)
    const data = JSON.parse(await httpDataRequest("youtube-info", JSON.stringify(videolist)))
    console.log(data)
    for (let i = 0; i != data.length; i++) {
        if (i == data.length) infoTitle.innerHTML = data.length + "本の動画が取得完了しました！"
        const videoId = data[i]
        console.log(videoId)
        const title = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
            videoId: videoId,
            request: "title"
        })))
        const infoVideo = document.createElement("div")
        const infoVideoImagediv = document.createElement("div")
        const infoVideoImageimg = document.createElement("img")
        const infoVideoInfo = document.createElement("div")
        const infoVideoTitle = document.createElement("div")
        infoVideo.classList.add("infoVideo")
        infoVideoImagediv.classList.add("infoVideoImage")
        infoVideoImageimg.classList.add("infoVideoImage")
        infoVideoImageimg.src = "../../ytimage/" + videoId
        infoVideoInfo.classList.add("infoVideoInfo")
        infoVideoTitle.classList.add("infoVideoTitle")
        infoVideoTitle.innerHTML = title
        infoVideoImagediv.appendChild(infoVideoImageimg)
        infoVideoInfo.appendChild(infoVideoTitle)
        infoVideo.appendChild(infoVideoImagediv)
        infoVideo.appendChild(infoVideoInfo)
        infoVideos.appendChild(infoVideo)
        wait(20)
    }
};