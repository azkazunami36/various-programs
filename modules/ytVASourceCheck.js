/**
 * 音声や動画が取得されているかを全て確認します。
 * ただ、インデックスからの処理。
 * @param {any} ytIndex 
 */
const fs = require("fs")
const wait = require("util").promisify(setTimeout)
module.exports.ytVASourceCheck = async ytIndex => {
    const videoIds = Object.keys(ytIndex.videoIds)
    for (let i = 0; i != videoIds.length; i++) {
        const videoId = videoIds[i]
        if (!fs.existsSync("cache/YTDl/" + videoId + ".mp4"))
            await require("./ytVideoGet").ytVideoGet(videoId)
        if (!fs.existsSync("cache/YTDl/" + videoId + ".mp3"))
            await require("./ytAudioGet").ytAudioGet(videoId)
        if (!fs.existsSync("cache/YouTubeThumbnail/" + videoId + ".jpg"))
            await require("./ytThumbnailGet").ytThumbnailGet(videoId)
            if (!fs.existsSync("./"))
        await wait(10)
    }
    console.log("ソースの有無のチェックが完了しました。")
}