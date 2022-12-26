/**
 * VideoIDからインデックスを作成します
 * @param videoId VideoID
 * @param ytIndex 変更を加えるためにインデックスに使用する変数を入力
 * @returns ytIndexを返します。
 */
const ytIndexCreate = async (videoId, ytIndex) => {
    if (!ytIndex.videoIds) ytIndex.videoIds = {} //初期化
    if (!dtbs.videoIds[videoId]) console.log("YouTubeInfoIndex Created: " + videoId)
    else console.log("YouTubeInfoIndex Rebuilded: " + videoId)
    ytIndex.videoIds[videoId] = ""
    return ytIndex
}
module.exports = {
    ytIndexCreate: ytIndexCreate
}