const httpDataRequest = async (request, send) => {
    return new Promise(resolve => {
        console.log(send)
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request);
        xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8");
        xhr.send(send);
        xhr.onreadystatechange = async () => { if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText) }
    })
}
const wait = async time => {
    await new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
addEventListener("load", async () => {
    const videoList = document.getElementById("videoList")
    addEventListener("resize", e => videoNumberReload())
    const videoNumberReload = () => {
        const videonum = (document.body.clientWidth / 300).toFixed()
        console.log(videonum)
        document.documentElement.style.setProperty("--video-layout", String(videonum));
    }
    videoNumberReload()
    videoList.addEventListener("scroll", e => {
        if (videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < (document.body.clientWidth / 300).toFixed() * 100) videoLoad()
    })
    let videoLoaded = 0
    let videos
    let videoloading = false
    const videoLoad = async g => {
        if (videoloading && !g) return
        videoloading = true
        let loading = 0
        const row = (document.body.clientWidth / 300).toFixed()
        console.log(row)
        if (videoLoaded == 0) loading = row * 3
        else loading = row * 2
        const target = videoLoaded + loading
        if (!videos) videos = JSON.parse(await httpDataRequest("ytvideo-list"))
        if (videoLoaded > videos.length) return
        for (videoLoaded; videoLoaded != target; videoLoaded++) {
            if (videoLoaded > videos.length) return
            console.log(videoLoaded + ": ", videos[videoLoaded])

            const videoId = videos[videoLoaded]
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
            thumbnailimg.src = "../../ytimage/" + videoId
            clickme.href = "./watch?v=" + videoId
            videoTitle.innerHTML = title
            videoAuthor.innerHTML = author
            videoLink.appendChild(videoWindow)
            videoWindow.appendChild(thumbnailImage)
            videoWindow.appendChild(titleAria)
            videoWindow.appendChild(clickme)
            thumbnailImage.appendChild(thumbnailimg)
            titleAria.appendChild(videoTitle)
            titleAria.appendChild(videoAuthor)
            videoList.appendChild(videoLink)
            wait(20)
        }
        if (videoList.scrollHeight - (videoList.clientHeight + videoList.scrollTop) < (document.body.clientWidth / 300).toFixed() * 100) videoLoad(true)
        else videoloading = false
    }
    videoLoad()
    let backgroundstatus = false
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
    const ytURLSend = document.getElementById("URLSend");
    //ポップアップウィンドウを取得
    const infoPopup = document.getElementById("infoPopup");
    //クリックされたら
    ytURLSend.addEventListener("click", e => {
        //テキストボックスの取得
        const ytURLBox = document.getElementById("URLBox");
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
        const msDataBox = document.getElementById("msDataBox");
        const text = msDataBox.value;
        try {
            ytdlInfoGet(JSON.parse(text));
        } catch (e) {
            ytdlInfoGet(text.split("\n"));
        };
        multichoicePopup.classList.remove("Popuped");
        //クラス「ポップアップ有効化用」を追加
        infoPopup.classList.add("Popuped");
    })
});
const ytdlInfoGet = async videolist => {
    const infoTitle = document.getElementById("infoTitle");
    infoTitle.innerHTML = "サーバーの返答を待っています...";
    const infoVideos = document.getElementById("infoVideos");
    infoVideos.innerHTML = "";
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/youtube-info");
    xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8");
    xhr.send(JSON.stringify(videolist));
    xhr.onreadystatechange = async () => {
        //通信が完了し、成功をマークしていたら
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);
            let i = 0;
            /**
             * VLC: Video List Createの略です...w
             */
            const VLCLoop = setInterval(() => {
                console.log((i + 1) + "回目のループ。");
                if (i == data.length) {
                    infoTitle.innerHTML = data.length + "本の動画が取得完了しました！";
                    clearInterval(VLCLoop);
                };
                if (!data[i].error) {
                    const title = data[i].title;
                    const description = data[i].description.replace(/\n/g, "<br>");
                    const infoVideo = document.createElement("div");
                    const infoVideoImagediv = document.createElement("div");
                    const infoVideoImageimg = document.createElement("img");
                    const infoVideoInfo = document.createElement("div");
                    const infoVideoTitle = document.createElement("div");
                    infoVideo.classList.add("infoVideo");
                    infoVideoImagediv.classList.add("infoVideoImage");
                    infoVideoImageimg.classList.add("infoVideoImage");
                    infoVideoImageimg.src = "../../ytimage/" + data[i].videoId;
                    infoVideoInfo.classList.add("infoVideoInfo");
                    infoVideoTitle.classList.add("infoVideoTitle");
                    infoVideoTitle.innerHTML = title;
                    infoVideoImagediv.appendChild(infoVideoImageimg);
                    infoVideoInfo.appendChild(infoVideoTitle);
                    infoVideo.appendChild(infoVideoImagediv);
                    infoVideo.appendChild(infoVideoInfo);
                    infoVideos.appendChild(infoVideo);
                } else {
                    const infoVideos = document.getElementById("infoVideos");
                    const infoVideo = document.createElement("div");
                    const infoVideoImagediv = document.createElement("div");
                    const infoVideoImageimg = document.createElement("img");
                    const infoVideoInfo = document.createElement("div");
                    const infoVideoTitle = document.createElement("div");
                    infoVideo.classList.add("infoVideo");
                    infoVideoImagediv.classList.add("infoVideoImage");
                    infoVideoImageimg.classList.add("infoVideoImage");
                    infoVideoInfo.classList.add("infoVideoInfo");
                    infoVideoTitle.classList.add("infoVideoTitle");
                    infoVideoTitle.innerHTML = "エラーにより、取得ができませんでした。";
                    infoVideoImagediv.appendChild(infoVideoImageimg);
                    infoVideoInfo.appendChild(infoVideoTitle);
                    infoVideo.appendChild(infoVideoImagediv);
                    infoVideo.appendChild(infoVideoInfo);
                    infoVideos.appendChild(infoVideo);
                };
                i++;
            }, 20);
        };
    };
};