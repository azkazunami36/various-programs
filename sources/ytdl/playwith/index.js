addEventListener("load", e => {
    const
        video = document.getElementById("video"),
        seekbarDrag = document.getElementById("seekbar-wrap"),
        seekbarLoad = document.getElementById("seekbar-load"),
        seekpoint = document.getElementById("seek-point"),
        seekbarIn = document.getElementById("seekbar-in"),
        audio = new Audio()
    document.body.appendChild(audio)
    addEventListener("focus", e => e.preventDefault())
    addEventListener("focusin", e => e.preventDefault())
    addEventListener("focusout", e => e.preventDefault())
    video.addEventListener("timeupdate", e => {
        let bufferNo
        console.log(seekbarDrag.clientWidth)
        seekbarIn.style.transform = "scaleX(" + (video.currentTime / video.duration) + ")";
        seekpoint.style.left = (video.currentTime / video.duration) * seekbarDrag.clientWidth - (seekpoint.clientWidth / 2)
        for (let i = (video.buffered.length); bufferNo == undefined && video.buffered.length != 0 && i != 0; i--) {
            if (video.buffered.start(i - 1) < video.currentTime) {
                bufferNo = video.buffered.end(i - 1);
            }
        }
        seekbarLoad.style.transform = "scaleX(" + (bufferNo / video.duration) + ")";
    })
    video.addEventListener("play", e => {
        audio.currentTime = video.currentTime
        audio.play()
    })
    video.addEventListener("pause", e => {
        audio.pause()
    })
    seekbarDrag.addEventListener("click", e => {
        e.preventDefault()
        console.log(seekbarDrag.getBoundingClientRect().left + window.pageXOffset, seekbarDrag.getBoundingClientRect().left, window.pageXOffset)
        let percent = (e.pageX - (seekbarDrag.getBoundingClientRect().left + window.pageXOffset)) / seekbarDrag.clientWidth
        video.currentTime = video.duration * percent
        audio.currentTime = video.currentTime
    })
    seekpoint.addEventListener("mousemove", e => {
        e.preventDefault()
        if (document.getElementsByClassName("drag")[0]) {
            let percent = (e.pageX - (seekbarDrag.getBoundingClientRect().left + window.pageXOffset)) / seekbarDrag.clientWidth
            video.currentTime = video.duration * percent
            audio.currentTime = video.currentTime
        }
    })
    seekpoint.addEventListener("mousedown", e => seekbarDrag.classList.add("drag"))
    seekpoint.addEventListener("mouseup", e => seekbarDrag.classList.remove("drag"))
    const params = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) })
    const videoId = params.v
    video.src = "../../ytvideo/" + videoId
    audio.src = "../../ytaudio/" + videoId
})