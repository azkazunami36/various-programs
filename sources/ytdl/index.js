//Webサイトの読み込みが終わると実行
addEventListener("load", async () => {
    //ボタンの取得
    const ytURLSend = document.getElementById("URLSend");
    //暗転するための要素を取得
    const ytBlackBackground = document.getElementById("BlackBackground");
    //ポップアップウィンドウを取得
    const infoPopup = document.getElementById("infoPopup");
    //クリックされたら
    ytURLSend.addEventListener("click", e => {
        //テキストボックスの取得
        const ytURLBox = document.getElementById("URLBox");
        //クラス「暗転用」を追加
        ytBlackBackground.classList.add("Blacked");
        //クラス「ポップアップ有効化用」を追加
        infoPopup.classList.add("infoPopuped");
        //関数に送信
        ytdlInfoGet([ytURLBox.value]);
    });
    //ポップアップを閉じるボタンの取得
    const infoPopupCloseBtn = document.getElementById("infoPopupCloseBtn");
    //クリックされたら
    infoPopupCloseBtn.addEventListener("click", e => {
        //クラス「暗転用」を削除
        ytBlackBackground.classList.remove("Blacked");
        //クラス「ポップアップ有効化用」を削除
        infoPopup.classList.remove("infoPopuped");
    });
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
                    infoTitle.innerHTML = "取得が完了しました！";
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