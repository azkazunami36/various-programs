const save = document.getElementById("save")
const input = document.getElementById("input");
const status = document.getElementById("status");
const title = document.getElementById("title");
const authorName = document.getElementById("author");
const thumbnail = document.getElementById("thumbnail");
const authorIcon = document.getElementById("authorIcon");
const link = document.getElementById("link");
let url = ""
save.addEventListener("click", async e => {
    const httpDataRequest = async (request, send) => {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:81/" + request);
            xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8");
            xhr.send(send);
            xhr.onreadystatechange = async () => {
                if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText);
            }
        })
    };
    if (input.value) {
        status.innerHTML = "取得中...";
        const data = JSON.parse(await httpDataRequest("youtube-info", JSON.stringify([input.value])));
        if (data.length === 1 && data[0] == "") {
            infoTitle.innerHTML = "取得が出来ませんでした...";
            return;
        };
        status.innerHTML = "取得完了";
        const videoId = data[0];
        const ratio = (window.devicePixelRatio || 1).toFixed(2);
        thumbnail.src = "http://localhost:81/ytimage/" + videoId + "?size=" + 320 + "&ratio=" + ratio;
        url = "http://localhost:81/sources/ytdl/watch?v=" + videoId;
        title.innerHTML = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
            videoId: videoId,
            request: "title"
        })));
        const author = JSON.parse(await httpDataRequest("ytdlRawInfoData", JSON.stringify({
            videoId: videoId,
            request: "author"
        })));
        authorName.innerHTML = author.name;
        authorIcon.src = "http://localhost:81/ytauthorimage/" + author.id + "?size=48&ratio=" + ratio;
    }
})
link.addEventListener("click", () => {
    if (url) {
        window.open(url, "_blank")
    }
})
