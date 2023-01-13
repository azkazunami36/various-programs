const fs = require("fs")
const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const ytVideoGetErrorMessage = require("./ytVideoGetErrorMessage").ytVideoGetErrorMessage
/**
 * VideoIDから音声を取得します。
 * @param {string} videoId 
 */
module.exports.ytAudioGet = async videoId => {
    const savePass = require("../dataPass.json").default
    if (!fs.existsSync(savePass + "cache/YTDl/" + videoId + ".opus"))
        await new Promise(resolve => {
            let starttime
            if (!fs.existsSync(savePass + "cache/YouTubeDownloadingAudio")) fs.mkdirSync(savePass + "cache/YouTubeDownloadingAudio")
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
            audioDownload.on("error", async err => {
                const jpmsg = ytVideoGetErrorMessage(err.message)
                console.log("音声取得中にエラー: " + videoId, jpmsg ? jpmsg : err)
                resolve()
            })
            audioDownload.pipe(fs.createWriteStream(savePass + "cache/YouTubeDownloadingAudio/" + videoId + ".mp3"))
            audioDownload.on("end", async () => {
                const convert = ffmpeg(savePass + "cache/YouTubeDownloadingAudio/" + videoId + ".mp3")
                convert.addOptions([
                    "-vn",
                    "-c:a libopus",
                    "-ab 128k"
                ])
                convert.save(savePass + "cache/YouTubeDownloadingAudio/" + videoId + ".opus")
                convert.on("end", () => {
                    if (!fs.existsSync(savePass + "cache/YTDL")) fs.mkdirSync("cache/YTDL")
                    const Stream = fs.createReadStream(savePass + "cache/YouTubeDownloadingAudio/" + videoId + ".opus")
                    Stream.pipe(fs.createWriteStream(savePass + "cache/YTDL/" + videoId + ".opus"))
                    Stream.on("end", () => {
                        console.log("音声取得完了: " + videoId)
                        resolve()
                    })
                })
            })
        })
}

