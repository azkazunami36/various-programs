/**
 * VideoIDから音声を取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
module.exports.ytAudioGet = videoId => {
    if (!fs.existsSync("cache/YTDl/" + videoId + ".mp3")) {
        let starttime
        if (!fs.existsSync("cache/YouTubeDownloadingAudio")) fs.mkdirSync("cache/YouTubeDownloadingAudio")
        const audioDownload = ytdl(videoId, { filter: "audioonly", quality: "highest" })
        audioDownload.once("response", () => starttime = Date.now())
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
        audioDownload.on("error", async err => { console.log("Audio Get Error " + videoId) })
        audioDownload.pipe(fs.createWriteStream("cache/YouTubeDownloadingAudio/" + videoId + ".mp3"))
        audioDownload.on("end", () => {
            if (!fs.existsSync("cache/YTDl")) fs.mkdirSync("cache/YTDl")
            fs.createReadStream("cache/YouTubeDownloadingAudio/" + videoId + ".mp3")
                .pipe(fs.createWriteStream("cache/YTDl/" + videoId + ".mp3"))
        })
    }
}