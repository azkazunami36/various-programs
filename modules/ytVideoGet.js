/**
 * VideoIDから動画を取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
cmodule.exports.ytVideoGet = videoId => {
    if (!fs.existsSync("cache/YTDl/" + videoId + ".mp4")) {
        let starttime
        if (!fs.existsSync("cache/YouTubeDownloadingVideo")) fs.mkdirSync("cache/YouTubeDownloadingVideo")
        const videoDownload = ytdl(videoId, { filter: "videoonly", quality: "highest" })
        videoDownload.once("response", () => starttime = Date.now())
        videoDownload.on("progress", (chunkLength, downloaded, total) => {
            const floatDownloaded = downloaded / total
            const downloadedSeconds = (Date.now() - starttime) / 1000
            //推定残り時間
            const timeLeft = downloadedSeconds / floatDownloaded - downloadedSeconds
            //パーセント
            const percent = (floatDownloaded * 100).toFixed()
            //ダウンロード済みサイズ
            const mbyte = mbyteString(downloaded)
            //最大ダウンロード量
            const totalMbyte = mbyteString(total)
            //推定残り時間
            const elapsedTime = timeString(downloadedSeconds)
        })
        videoDownload.on("error", async err => { console.log("Video Get Error " + videoId) })
        videoDownload.pipe(fs.createWriteStream("cache/YouTubeDownloadingVideo/" + videoId + ".mp4"))
        videoDownload.on("end", () => {
            if (!fs.existsSync("cache/YTDl")) fs.mkdirSync("cache/YTDl")
            fs.createReadStream("cache/YouTubeDownloadingVideo/" + videoId + ".mp4")
                .pipe(fs.createWriteStream("cache/YTDl/" + videoId + ".mp4"))
        })
    }
}