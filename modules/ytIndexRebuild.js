/**
 * YouTubeのインデックスを一括で再作成します。
 * @param ytdlRawInfoData
 * @param ytIndex
 * @param callback
 */
const wait = require("util").promisify(setTimeout)
module.exports.ytIndexReBuild = async (ytdlRawInfoData, ytIndex, callback) => {
    const videoIds = Object.keys(ytdlRawInfoData)
    let i = 0
    for (let i = 0; i != videoIds.length; i++) {
        ytIndex = await require("./ytIndexCreate").ytIndexCreate(videoIds[i], ytIndex)
        await wait(10)
    }
    callback(ytIndex)
}