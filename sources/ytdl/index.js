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
    const videoRowReload = () => {
        if (videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < (document.body.clientWidth / 300).toFixed() * 100) videoLoad()
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
        if (videoLoaded > videos.length) return //読み込める動画がもう無かったらリターン
        videoloading = true //読み込み中
        let loading = 0 //どれほど読み込むか
        //ブラウザサイズからどれほど動画を並べられるか判断
        const row = (document.body.clientWidth / 300).toFixed()
        if (videoLoaded == 0) loading = row * 3 //初めての読み込みなら動画のよこ列×3を読み込む
        else loading = row * 2 //出なければよこ列x2を読み込む
        const target = videoLoaded + loading //どこまで読み込むか指定
        //videosが無かったらサーバーからデータを取得する
        if (!videos) videos = JSON.parse(await httpDataRequest("ytvideo-list"))
        //指定した部分まで繰り返し取得する
        for (videoLoaded; videoLoaded != target; videoLoaded++) {
            if (videoLoaded > videos.length) return //読み込める動画が無かったら(ry

            const videoId = videos[videoLoaded] //VideoID
            const title = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                videoId: videoId,
                request: "title"
            })))
            const author = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                videoId: videoId,
                request: "author"
            }))).name
            const videoLink = document.createElement("div")
            const videoWindow = document.createElement("div")
            const thumbnailImage = document.createElement("div")
            const thumbnailimg = document.createElement("img")
            const titleAria = document.createElement("div")
            const videoTitle = document.createElement("p")
            const videoAuthor = document.createElement("p")
            const clickme = document.createElement("a")
            videoLink.classList.add("VideoLink")
            videoWindow.classList.add("VideoWindow")
            thumbnailImage.classList.add("ThumbnailImage")
            thumbnailimg.classList.add("Thumbnailimg")
            titleAria.classList.add("TitleAria")
            videoTitle.classList.add("VideoTitle")
            videoAuthor.classList.add("VideoAuthor")
            clickme.classList.add("clickme")
            thumbnailimg.src = "../../ytimage/" + videoId + "?query=low"
            clickme.href = "./watch?v=" + videoId
            videoTitle.innerHTML = title
            videoAuthor.innerHTML = author
            VideoListCenter.appendChild(videoLink)
            videoLink.appendChild(videoWindow)
            videoWindow.appendChild(thumbnailImage)
            videoWindow.appendChild(titleAria)
            videoWindow.appendChild(clickme)
            thumbnailImage.appendChild(thumbnailimg)
            titleAria.appendChild(videoTitle)
            titleAria.appendChild(videoAuthor)
            wait(20)
        }
        //もし処理中の隙に一番下までスクロールされていたらすぐに次の読み込みをする
        if (videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < (document.body.clientWidth / 300).toFixed() * 100) videoLoad(true)
        else videoloading = false //出なければ読み込み終了
    }
    addEventListener("resize", e => videoNumberReload()) //ブラウザサイズが変わると
    let videorow = 4
    /**
     * 動画の列を決める関数
     */
    const videoNumberReload = () => {
        const videonum = (document.body.clientWidth / 300).toFixed()
        if (videonum == videorow) return //数値を買える必要が無かったらリターン
        videorow = videonum
        //スタイルに反映
        document.documentElement.style.setProperty("--video-layout", String(videonum))
        //サイズ変更時に一番下まで移動してしまったら読み込む
        videoRowReload()
    }
    videoNumberReload() //動画の列を初期化する
    videoList.addEventListener("scroll", videoRowReload) //スクロールすると動画を読み込むかを検証する
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
    //クリックされたら
    ytURLSend.addEventListener("click", e => {
        //テキストボックスの取得
        const ytURLBox = document.getElementById("URLBox")
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
        //テキストボックスの取得
        const msDataBox = document.getElementById("msDataBox")
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
    const xhr = new XMLHttpRequest()

    xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/youtube-info")
    xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
    xhr.send(JSON.stringify(videolist))
    xhr.onreadystatechange = async () => {
        //通信が完了し、成功をマークしていたら
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            let i = 0
            /**
             * VLC: Video List Createの略です...w
             */
            const VLCLoop = setInterval(async () => {
                console.log((i + 1) + "回目のループ。")
                if (i == data.length) {
                    infoTitle.innerHTML = data.length + "本の動画が取得完了しました！"
                    clearInterval(VLCLoop)
                };
                const videoId = data[i]
                const title = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                    videoId: videoId,
                    request: "title"
                })))
                const description = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
                    videoId: videoId,
                    request: "description"
                }))).replace(/\n/g, "<br>")
                console.log(description)
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
                i++;
            }, 20);
        };
    };
};