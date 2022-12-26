/**
 * YouTubeのインデックスを一括で再作成します。
 * @param ytdlRawInfoData
 * @param ytIndex
 */
const wait = util.promisify(setTimeout)
const ytIndexReBuild = async ytIndex => {
    const videoIds = Object.keys(ytdlRawInfoData)
    let i = 0
    for (let i = 0; i == videoIds.length; i++) {
        ytIndex = await require("./ytIndexCreate").ytIndexCreate(videoIds[i], ytIndex)
        if (i == videoIds.length) saveingJson()
        await wait(10)
    }
    return ytIndex
}
module.exports = {
    ytIndexReBuild: ytIndexReBuild
}