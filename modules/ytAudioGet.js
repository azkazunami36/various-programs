/**
 * VideoIDから音声を取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
const ytdl = require("ytdl-core")
module.exports.ytAudioGet = async videoId => {
    if (!fs.existsSync("C:/cache/YTDl/" + videoId + ".mp3"))
        await new Promise(resolve => {
            let starttime
            if (!fs.existsSync("C:/cache/YouTubeDownloadingAudio")) fs.mkdirSync("C:/cache/YouTubeDownloadingAudio")
            const audioDownload = ytdl(videoId, { filter: "audioonly", quality: "highest" })
            audioDownload.once("response", () => {
                starttime = Date.now()
                console.log("音声取得開始: " + videoId)
            })
            audioDownload.on("progress", (chunkLength, downloaded, total) => {
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
            audioDownload.on("error", async err => { console.log("音声取得中にエラー: " + videoId, err) })
            audioDownload.pipe(fs.createWriteStream("C:/cache/YouTubeDownloadingAudio/" + videoId + ".mp3"))
            audioDownload.on("end", async () => {
                if (!fs.existsSync("C:/cache/YTDL")) fs.mkdirSync("cache/YTDL")
                const Stream = fs.createReadStream("C:/cache/YouTubeDownloadingAudio/" + videoId + ".mp3")
                Stream.pipe(fs.createWriteStream("C:/cache/YTDL/" + videoId + ".mp3"))
                Stream.on("end", () => {
                    console.log("音声取得完了: " + videoId)
                    resolve()
                })
            })
        })
}

