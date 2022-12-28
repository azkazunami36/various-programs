/**
 * VideoIDから音声を取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
const ytdl = require("ytdl-core")
const mbyteString = require("./mbyteString").mbyteString
const timeString = require("./timeString").timeString
module.exports.ytAudioGet = async videoId => {
    if (!fs.existsSync("cache/YTDl/" + videoId + ".mp3")) {
        await new Promise(resolve => {
            let starttime
            if (!fs.existsSync("cache/YouTubeDownloadingAudio")) fs.mkdirSync("cache/YouTubeDownloadingAudio")
            const audioDownload = ytdl(videoId, { filter: "audioonly", quality: "highest" })
            audioDownload.once("response", () => {
                starttime = Date.now()
                console.log("音声取得開始: " + videoId)
            })
            audioDownload.on("progress", (chunkLength, downloaded, total) => {
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
            audioDownload.on("error", async err => { console.log("Audio Get Error " + videoId, err) })
            audioDownload.pipe(fs.createWriteStream("cache/YouTubeDownloadingAudio/" + videoId + ".mp3"))
            audioDownload.on("end", async () => {
                if (!fs.existsSync("cache/YTDL")) fs.mkdirSync("cache/YTDL")
                const Stream = fs.createReadStream("cache/YouTubeDownloadingAudio/" + videoId + ".mp3")
                Stream.pipe(fs.createWriteStream("cache/YTDL/" + videoId + ".mp3"))
                Stream.on("end", () => {
                    console.log("音声取得完了: " + videoId)
                    resolve()
                })
            })
        })
    }
}