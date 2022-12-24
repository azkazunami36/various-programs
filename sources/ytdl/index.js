//Webサイトの読み込みが終わると実行
addEventListener("load", async () => {
    const videoList = document.getElementById("videoList")
    addEventListener("resize", e => videoNumberReload())
    const videoNumberReload = () => {
        const videonum = (document.body.clientWidth / 300).toFixed()
        console.log(videonum)
        document.documentElement.style.setProperty("--video-layout",String(videonum));
    }
    videoNumberReload()
    videoList.onscroll = async e => {
        const clientHeight = videoList.clientHeight;
        const scrollHeight = videoList.scrollHeight;
        console.log(clientHeight, scrollHeight, videoList.scrollTop)
        if (scrollHeight - (clientHeight + videoList.scrollTop) < 380) videoLoad()
    }
    let videoLoaded = 0
    let videos
    const videoLoad = async () => {
        let loading = 0
        if (videoLoaded == 0) loading = 21
        else loading = 10
        const target = videoLoaded + loading
        if (!videos) {
            await new Promise(resolve => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/ytvideo-list");
                xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8");
                xhr.send();
                xhr.onreadystatechange = async () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        videos = JSON.parse(xhr.responseText)
                        console.log("取得", videos)
                        resolve()
                    }
                }
            })
        }
        const videoIds = Object.keys(videos)
        for (videoLoaded; videoLoaded != target; videoLoaded++) {
            console.log(videoLoaded + ": ", videos[videoIds[videoLoaded]])

            const videoId = videoIds[videoLoaded]
            const title = videos[videoIds[videoLoaded]].title
            const author = videos[videoIds[videoLoaded]].author.name
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
        }
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