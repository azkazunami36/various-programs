/**
 * YouTubeのインデックスを一括で再作成します。
 * @param ytdlRawInfoData
 * @param ytIndex
 * @param callback
 */
const wait = require("util").promisify(setTimeout)
module.exports.ytIndexReBuild = async (ytdlRawInfoData, ytIndex, callback) => {
    const videoIds = Object.keys(ytdlRawInfoData)
    for (let i = 0; i != videoIds.length; i++) {
        ytIndex = await require("./ytIndexCreate").ytIndexCreate(videoIds[i], ytIndex, ytdlRawInfoData[videoIds[i]])
        await wait(16.67)
    }
    callback(ytIndex)
}
