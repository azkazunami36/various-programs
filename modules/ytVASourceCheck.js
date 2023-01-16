const fs = require("fs")
const wait = require("util").promisify(setTimeout)
/**
 * 音声や動画が取得されているかを全て確認します。
 * ただ、インデックスからの処理。
 * @param ytIndex 
 */
module.exports.ytVASourceCheck = async ytIndex => {
    const savePass = require("../dataPass.json").default
    const videoIds = Object.keys(ytIndex.videoIds)
    for (let i = 0; i != videoIds.length; i++) {
        const videoId = videoIds[i]
        console.log("ソース有無確認 " + videoId + " : 残り " + String(videoIds.length - (i + 1)) + " 個")
        if (!await require("./ytPassGet").sourceExist(videoId, "video"))
            await require("./ytPassGet").youtubedl(videoId, "video")
        if (!await require("./ytPassGet").sourceExist(videoId, "audio"))
            await require("./ytPassGet").youtubedl(videoId, "audio")
        await require("./ytPassGet").ytPassGet(videoId, "mp4")
        if (!fs.existsSync(savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg"))
            await require("./ytThumbnailGet").ytThumbnailGet(videoId)
        if (!fs.existsSync(savePass + "cache/ytAuthorIcon" + ytIndex.videoIds[videoId].authorId + ".jpg"))
            await require("./ytAuthorIconGet").ytAuthorIconGet(ytIndex.videoIds[videoId].authorId)
        await wait(16.67)
    }

    console.log("ソースの有無のチェックが完了しました。")
}
