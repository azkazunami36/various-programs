const audio = new Audio()
addEventListener("load", async e => {
    const
        video = document.getElementById("video"), //動画
        seekbarDrag = document.getElementById("seekbar-wrap"), //シーク操作のために使用
        seekbarLoadVideo = document.getElementById("seekbar-loadVideo"), //バッファ表示に使用
        seekbarLoad = document.getElementById("seekbar-loadAudio"), //バッファ表示に使用
        seekpoint = document.getElementById("seek-point"), //小さな丸を表示するために使用
        seekbarIn = document.getElementById("seekbar-in"), //再生ケージ表示に使用
        playButton = document.getElementById("playButton"), //再生ボタン
        downloadButton = document.getElementById("downloadButton"), //ダウンロードボタン
        muteButton = document.getElementById("muteButton"), //ミュートボタン
        loopButton = document.getElementById("loopButton"), //ループボタン
        plusButton = document.getElementById("plusButton"), //プラススキップボタン
        minusButton = document.getElementById("minusButton") //マイナススキップボタン
    const videoRestart = () => { //動画と音声を同期させるために使用する
        if (!audio.paused) { //再生中なら
            const delay = (audio.currentTime - video.currentTime).toFixed(2)
            if (delay < -0.25 || delay > 0.25) {
                console.log("音ズレを検知しました。: ", delay)
                audio.pause() //停止
                video.currentTime = audio.currentTime //同期
                setTimeout(() => {
                    audio.play() //パフォーマンスのため、遅延して再生
                    setTimeout(() => {
                        console.log("遅延がまだ残っている可能性があるため、繰り返し関数を実行します。")
                        videoRestart() //もう一度念押しに遅延修正
                    }, 500);
                }, 500)
            } else console.log("音ズレはありません。: ", delay)
        } else video.currentTime = audio.currentTime //停止していたら同期のみ
    }
    //丸の位置を設定
    const seekpointmove = () => seekpoint.style.left = (audio.currentTime / audio.duration) * seekbarDrag.clientWidth - (seekpoint.clientWidth / 2)
    addEventListener("focus", videoRestart) //フォーカス。ページがアクティブになったら
    audio.addEventListener("timeupdate", e => { //時間が更新されたら
        seekbarIn.style.transform = "scaleX(" + (audio.currentTime / audio.duration) + ")"; //反映
        seekpointmove() //丸の位置(ry
        const loadseek = (t, m) => {
            let bufferNo //バッファの数をカウントするために使用
            //再生位置にある最も近いバッファを取得する
            for (let i = (t.buffered.length); bufferNo == undefined && t.buffered.length != 0 && i != 0; i--) {
                if (t.buffered.start(i - 1) < t.currentTime) {
                    bufferNo = t.buffered.end(i - 1);
                }
            }
            m.style.transform = "scaleX(" + (bufferNo / t.duration) + ")"; //反(ry
        }
        loadseek(audio, seekbarLoad)
        loadseek(video, seekbarLoadVideo)
    })
    video.addEventListener("timeupdate", e => { //時間が更新されたら
    })
    //再生停止ボタンがクリックされると
    playButton.addEventListener("click", () => {
        if (audio.paused) audio.play() //停止していたら再生
        else audio.pause() //再生していたら停止
    })
    addEventListener("resize", seekpointmove) //ウィンドウサイズ変更時に丸の位置を更新
    audio.addEventListener("play", e => { //再生されると
        video.play() //再生
        playButton.innerHTML = "一時停止" //文字を変更
    })
    audio.addEventListener("pause", e => { //停止すると
        video.pause() //停止
        playButton.innerHTML = "再生" //文字を変更
        audio.currentTime = video.currentTime //同期
    })
    audio.addEventListener("volumechange", e => {
        console.log("にゃ")
        if (audio.muted) muteButton.innerHTML = "ミュート解除"
        if (!audio.muted) muteButton.innerHTML = "ミュート"
    })
    audio.addEventListener("change", e => {
        console.log("ちゃんげ")
    })
    seekbarDrag.addEventListener("click", e => { //シークバーのクリックで
        e.preventDefault() //軽量化を狙う
        //シークバーの長さをクリック位置からパーセントを計算
        const percent = (e.pageX - (seekbarDrag.getBoundingClientRect().left + window.pageXOffset)) / seekbarDrag.clientWidth
        audio.currentTime = audio.duration * percent //反映
        videoRestart() //同期
    })
    addEventListener("mousemove", async e => { //マウス移動
        e.preventDefault() //軽量化を狙う
        if (document.getElementsByClassName("drag")[0]) { //ドラッグ中だったら
            //シークバーの長さと丸のドラッグ位置からパーセ(ry
            const percent = (e.pageX - (seekbarDrag.getBoundingClientRect().left + window.pageXOffset)) / seekbarDrag.clientWidth
            audio.currentTime = audio.duration * percent
            video.currentTime = audio.duration * percent
        }
    })
    seekpoint.addEventListener("mousedown", e => { //丸をクリックすると
        seekbarDrag.classList.add("drag") //ドラック判定
        if (video.played) video.pause() //動画のみ停止(パフォーマンス安定化)
    })
    addEventListener("mouseup", e => { //クリック解除
        if (document.getElementsByClassName("drag")[0]) { //ドラッグ中だったら
            seekbarDrag.classList.remove("drag") //ドラッグ解除
            audio.currentTime = video.currentTime //反映
            videoRestart() //同期
        }
    })
    plusButton.addEventListener("click", e => {
        audio.currentTime += 5 //反映
        video.currentTime = audio.currentTime //反映
        videoRestart() //同期
    })
    minusButton.addEventListener("click", e => {
        audio.currentTime -= 5 //反映
        video.currentTime -= audio.currentTime //反映
        videoRestart() //同期
    })
    addEventListener("keydown", e => {
        switch (e.key) {
            case " ": {
                e.preventDefault()
                if (audio.paused) audio.play() //停止していたら再生
                else audio.pause() //再生していたら停止
                break
            }
            case "ArrowLeft": {
                audio.currentTime -= 5 //反映
                video.currentTime -= audio.currentTime //反映
                videoRestart() //同期
                break
            }
            case "ArrowRight": {
                audio.currentTime += 5 //反映
                video.currentTime += audio.currentTime //反映
                videoRestart() //同期
                break
            }
            case "ArrowUp": {
                const volume = (audio.volume * 100) + 5
                audio.volume = (volume > 100 ? 100 : volume).toFixed() / 100
                break
            }
            case "ArrowDown": {
                const volume = (audio.volume * 100) - 5
                audio.volume = (volume < 0 ? 0 : volume).toFixed() / 100
                break
            }
        }
    })
    //クエリ取得
    const params = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) })
    const videoId = params.v //VideoID
    video.src = "/ytvideo/" + videoId //動画のファイルパス
    video.poster = "/ytimage/" + videoId //動画のサムネ
    audio.src = "/ytaudio/" + videoId //音声のファイルパス
    downloadButton.addEventListener("click", e => {
        const downloadPopup = document.getElementById("downloadPopup")
        if (!downloadPopup) {
            const popup = document.createElement("div")
            document.body.appendChild(popup)
            popup.id = "downloadPopup"
            popup.style.position = "absolute"
            popup.style.width = "100%"
            popup.style.height = "100%"
            popup.style.background = "rgba(0, 0, 0, 0.2)"
            popup.style.display = "flex"
            popup.style.alignItems = "center"
            popup.style.justifyContent = "center"
            const bodyPopup = document.createElement("div")
            popup.appendChild(bodyPopup)
            bodyPopup.style.maxWidth = "500px"
            bodyPopup.style.maxHeight = "350px"
            bodyPopup.style.width = "100%"
            bodyPopup.style.height = "100%"
            bodyPopup.style.background = "white"
            bodyPopup.style.borderRadius = "10px"
            bodyPopup.style.display = "flex"
            bodyPopup.style.alignItems = "center"
            bodyPopup.style.justifyContent = "center"
            bodyPopup.style.flexDirection = "column"
            const titleBar = document.createElement("div")
            bodyPopup.appendChild(titleBar)
            titleBar.style.width = "100%"
            titleBar.style.height = "15%"
            titleBar.style.display = "flex"
            const title = document.createElement("div")
            titleBar.appendChild(title)
            title.style.width = "calc(100% - 40px)"
            title.style.fontSize = "30px"
            title.style.fontWeight = "600"
            title.style.display = "flex"
            title.style.justifyContent = "center"
            title.style.alignItems = "center"
            title.innerHTML = "種類を選択してください。"
            const closeButoon = document.createElement("div")
            titleBar.appendChild(closeButoon)
            closeButoon.style.width = "40px"
            closeButoon.style.height = "100%"
            closeButoon.style.fontSize = "9px"
            closeButoon.style.color = "white"
            closeButoon.style.display = "flex"
            closeButoon.style.justifyContent = "center"
            closeButoon.style.alignItems = "center"
            closeButoon.style.background = "black"
            closeButoon.style.borderRadius = "5px"
            closeButoon.style.cursor = "pointer"
            closeButoon.innerHTML = "閉じる"
            closeButoon.addEventListener("click", e => popup.style.display = "none")
            const info = document.createElement("div")
            bodyPopup.appendChild(info)
            info.style.width = "80%"
            info.style.height = "80%"
            info.style.display = "flex"
            const leftInfo = document.createElement("div")
            info.appendChild(leftInfo)
            leftInfo.style.width = "50%"
            leftInfo.style.height = "100%"
            leftInfo.style.display = "flex"
            leftInfo.style.alignItems = "center"
            leftInfo.style.justifyContent = "space-evenly"
            leftInfo.style.flexDirection = "column"
            const mp4text = document.createElement("div")
            leftInfo.appendChild(mp4text)
            mp4text.style.fontSize = "30px"
            mp4text.style.fontWeight = "600"
            mp4text.innerHTML = "mp4"
            const mp4downloadButoon = document.createElement("a")
            leftInfo.appendChild(mp4downloadButoon)
            mp4downloadButoon.id = "mp4Link"
            mp4downloadButoon.style.maxWidth = "115px"
            mp4downloadButoon.style.maxHeight = "35px"
            mp4downloadButoon.style.width = "100%"
            mp4downloadButoon.style.height = "100%"
            mp4downloadButoon.style.background = "rgb(100, 200, 255)"
            mp4downloadButoon.style.borderRadius = "5px"
            mp4downloadButoon.style.display = "flex"
            mp4downloadButoon.style.alignItems = "center"
            mp4downloadButoon.style.justifyContent = "center"
            mp4downloadButoon.style.cursor = "pointer"
            mp4downloadButoon.href = "/ytDownload/" + videoId + "?type=0"
            mp4downloadButoon.innerHTML = "ダウンロード"
            const rightInfo = document.createElement("div")
            info.appendChild(rightInfo)
            rightInfo.style.width = "50%"
            rightInfo.style.height = "100%"
            rightInfo.style.display = "flex"
            rightInfo.style.alignItems = "center"
            rightInfo.style.justifyContent = " space-evenly"
            rightInfo.style.flexDirection = "column"
            const webmtext = document.createElement("div")
            rightInfo.appendChild(webmtext)
            webmtext.style.fontSize = "30px"
            webmtext.style.fontWeight = "600"
            webmtext.innerHTML = "WebM"
            const webmdownloadButoon = document.createElement("a")
            rightInfo.appendChild(webmdownloadButoon)
            webmdownloadButoon.style.maxWidth = "115px"
            webmdownloadButoon.style.maxHeight = "35px"
            webmdownloadButoon.style.width = "100%"
            webmdownloadButoon.style.height = "100%"
            webmdownloadButoon.style.background = "rgb(100, 200, 255)"
            webmdownloadButoon.style.borderRadius = "5px"
            webmdownloadButoon.style.display = "flex"
            webmdownloadButoon.style.alignItems = "center"
            webmdownloadButoon.style.justifyContent = "center"
            webmdownloadButoon.style.cursor = "pointer"
            webmdownloadButoon.href = "/ytDownload/" + videoId + "?type=1"
            webmdownloadButoon.innerHTML = "ダウンロード"
        } else {
            downloadPopup.style.display = "flex"
        }
    })
    muteButton.addEventListener("click", e => {
        if (audio.muted) audio.muted = false
        else audio.muted = true
    })
    loopButton.addEventListener("click", e => {
        if (audio.loop) {
            audio.loop = false
            video.loop = false
            loopButton.innerHTML = "ループ"
        } else {
            audio.loop = true
            video.loop = true
            loopButton.innerHTML = "ループ解除"
        }
    })
})
