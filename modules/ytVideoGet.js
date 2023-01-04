/**
 * VideoIDから動画を取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
const ytdl = require("ytdl-core")
module.exports.ytVideoGet = async videoId => {
    if (!fs.existsSync("C:/cache/YTDl/" + videoId + ".mp4"))
        await new Promise(resolve => {
            let starttime
            if (!fs.existsSync("C:/cache/YouTubeDownloadingVideo")) fs.mkdirSync("C:/cache/YouTubeDownloadingVideo")
            const videoDownload = ytdl(videoId, { filter: "videoonly", quality: "highest" })
            videoDownload.once("response", () => {
                starttime = Date.now()
                console.log("動画取得開始: " + videoId)
            })
            videoDownload.on("progress", (chunkLength, downloaded, total) => {
                const floatDownloaded = downloaded / total
                const downloadedSeconds = (Date.now() - starttime) / 1000
                const status = {
                    elapsedTime: downloadedSeconds,
                    esTimeRemaining: downloadedSeconds / floatDownloaded - downloadedSeconds,
                    percent: floatDownloaded,
                    downloadedSize: downloaded,
                    totalSize: total,
                    chunkLength: chunkLength
                }
            })
            videoDownload.on("error", async err => console.log("動画取得中にエラー: " + videoId, err))
            videoDownload.pipe(fs.createWriteStream("C:/cache/YouTubeDownloadingVideo/" + videoId + ".mp4"))
            videoDownload.on("end", async () => {
                if (!fs.existsSync("C:/cache/YTDL")) fs.mkdirSync("C:/cache/YTDL")
                const Stream = fs.createReadStream("C:/cache/YouTubeDownloadingVideo/" + videoId + ".mp4")
                Stream.pipe(fs.createWriteStream("C:/cache/YTDL/" + videoId + ".mp4"))
                Stream.on("end", () => {
                    console.log("動画取得完了: " + videoId)
                    resolve()
                })
            })
        })
}
