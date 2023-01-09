/**
 * 音声や動画が取得されているかを全て確認します。
 * ただ、インデックスからの処理。
 * @param ytIndex 
 */
const fs = require("fs")
const wait = require("util").promisify(setTimeout)
module.exports.ytVASourceCheck = async ytIndex => {
    const savePass = require("../dataPass.json").default
    const videoIds = Object.keys(ytIndex.videoIds)
    for (let i = 0; i != videoIds.length; i++) {
        const videoId = videoIds[i]
        if (!fs.existsSync(savePass + "cache/YTDl/" + videoId + ".mp4"))
            await require("./ytVideoGet").ytVideoGet(videoId)
        if (!fs.existsSync(savePass + "cache/YTDl/" + videoId + ".mp3"))
            await require("./ytAudioGet").ytAudioGet(videoId)
        if (!fs.existsSync(savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg"))
            await require("./ytThumbnailGet").ytThumbnailGet(videoId)
        if (!fs.existsSync(savePass + "cache/ytAuthorIcon" + ytIndex.videoIds[videoId].authorId + ".jpg"))
            await require("./ytAuthorIconGet").ytAuthorIconGet(ytIndex.videoIds[videoId].authorId)
            await wait(10)
    }

    console.log("ソースの有無のチェックが完了しました。")
}
