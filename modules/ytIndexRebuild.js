const wait = require("util").promisify(setTimeout)
/**
 * YouTubeのインデックスを一括で再作成します。
 * @param ytdlRawInfoData
 * @param ytIndex
 */
module.exports.ytIndexReBuild = async (ytdlRawInfoData, ytIndex) => {
    const videoIds = Object.keys(ytdlRawInfoData)
    for (let i = 0; i != videoIds.length; i++) {
        ytIndex = await require("./ytIndexCreate").ytIndexCreate(videoIds[i], ytIndex, ytdlRawInfoData[videoIds[i]])
    }
    console.log("再作成完了")
    return ytIndex
}
