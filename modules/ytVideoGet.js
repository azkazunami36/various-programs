/**
 * VideoIDから動画を取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
const ytdl = require("ytdl-core")
module.exports.ytVideoGet = async videoId => {
    const savePass = require("../dataPass.json").default
    if (!fs.existsSync(savePass + "cache/YTDl/" + videoId + ".mp4"))
        await new Promise(resolve => {
            let starttime
            if (!fs.existsSync(savePass + "cache/YouTubeDownloadingVideo")) fs.mkdirSync(savePass + "cache/YouTubeDownloadingVideo")
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
            videoDownload.pipe(fs.createWriteStream(savePass + "cache/YouTubeDownloadingVideo/" + videoId + ".mp4"))
            videoDownload.on("end", async () => {
                if (!fs.existsSync(savePass + "cache/YTDL")) fs.mkdirSync(savePass + "cache/YTDL")
                const Stream = fs.createReadStream(savePass + "cache/YouTubeDownloadingVideo/" + videoId + ".mp4")
                Stream.pipe(fs.createWriteStream(savePass + "cache/YTDL/" + videoId + ".mp4"))
                Stream.on("end", () => {
                    console.log("動画取得完了: " + videoId)
                    resolve()
                })
            })
        })
}
