const audio = new Audio()
addEventListener("load", async e => {
    const
        video = document.getElementById("video"),
        seekbarDrag = document.getElementById("seekbar-wrap"),
        seekbarLoad = document.getElementById("seekbar-load"),
        seekpoint = document.getElementById("seek-point"),
        seekbarIn = document.getElementById("seekbar-in")
    document.body.appendChild(audio)
    addEventListener("focus", e => e.preventDefault())
    addEventListener("focusin", e => e.preventDefault())
    addEventListener("focusout", e => e.preventDefault())
    audio.addEventListener("timeupdate", e => {
        let bufferNo
        console.log(seekbarDrag.clientWidth)
        seekbarIn.style.transform = "scaleX(" + (audio.currentTime / audio.duration) + ")";
        seekpoint.style.left = (audio.currentTime / audio.duration) * seekbarDrag.clientWidth - (seekpoint.clientWidth / 2)
        for (let i = (audio.buffered.length); bufferNo == undefined && audio.buffered.length != 0 && i != 0; i--) {
            if (audio.buffered.start(i - 1) < audio.currentTime) {
                bufferNo = audio.buffered.end(i - 1);
            }
        }
        seekbarLoad.style.transform = "scaleX(" + (bufferNo / audio.duration) + ")";
    })
    audio.addEventListener("play", e => {
        audio.currentTime = video.currentTime
        video.play()
    })
    audio.addEventListener("pause", e => {
        video.pause()
    })
    seekbarDrag.addEventListener("click", e => {
        e.preventDefault()
        console.log(seekbarDrag.getBoundingClientRect().left + window.pageXOffset, seekbarDrag.getBoundingClientRect().left, window.pageXOffset)
        const percent = (e.pageX - (seekbarDrag.getBoundingClientRect().left + window.pageXOffset)) / seekbarDrag.clientWidth
        video.currentTime = audio.duration * percent
        audio.currentTime = audio.duration * percent
    })
    seekpoint.addEventListener("mousemove", e => {
        e.preventDefault()
        if (document.getElementsByClassName("drag")[0]) {
            const percent = (e.pageX - (seekbarDrag.getBoundingClientRect().left + window.pageXOffset)) / seekbarDrag.clientWidth
            video.currentTime = audio.duration * percent
            audio.currentTime = audio.duration * percent
        }
    })
    seekpoint.addEventListener("mousedown", e => seekbarDrag.classList.add("drag"))
    seekpoint.addEventListener("mouseup", e => seekbarDrag.classList.remove("drag"))
    const params = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) })
    const videoId = params.v
    video.src = "../../ytvideo/" + videoId
    audio.src = "../../ytaudio/" + videoId
})