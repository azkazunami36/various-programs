/**
 * VideoIDから動画を取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
const ytdl = require("ytdl-core")
const mbyteString = require("./mbyteString").mbyteString
const timeString = require("./timeString").timeString
module.exports.ytVideoGet = async videoId => {
    if (!fs.existsSync("cache/YTDl/" + videoId + ".mp4")) {
        await new Promise(resolve => {
            let starttime
            if (!fs.existsSync("cache/YouTubeDownloadingVideo")) fs.mkdirSync("cache/YouTubeDownloadingVideo")
            const videoDownload = ytdl(videoId, { filter: "videoonly", quality: "highest" })
            videoDownload.once("response", () => {
                starttime = Date.now()
                console.log("動画取得開始: " + videoId)
            })
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
            videoDownload.on("error", async err => { console.log("Video Get Error " + videoId, err) })
            videoDownload.pipe(fs.createWriteStream("cache/YouTubeDownloadingVideo/" + videoId + ".mp4"))
            videoDownload.on("end", async () => {
                if (!fs.existsSync("cache/YTDL")) fs.mkdirSync("cache/YTDL")
                const Stream = fs.createReadStream("cache/YouTubeDownloadingVideo/" + videoId + ".mp4")
                Stream.pipe(fs.createWriteStream("cache/YTDL/" + videoId + ".mp4"))
                Stream.on("end", () => {
                    console.log("動画取得完了: " + videoId)
                    resolve()
                })
            })
        })
    }
}