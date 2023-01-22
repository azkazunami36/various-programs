/**
 * VideoIDからインデックスを作成します
 * @param {string} videoId VideoID
 * @param ytIndex 変更を加えるためにインデックスに使用する変数を入力
 * @param videoDetails 動画に関連した情報を取得するためにrawデータからvideoid指定し内容を入力
 * @returns ytIndexを返します。
 */
module.exports.ytIndexCreate = async (videoId, ytIndex, videoDetails) => {
    if (!ytIndex) return console.log("ytIndexがうまく受け取れません。: " + ytIndex)
    if (!ytIndex.videoIds) ytIndex.videoIds = {}
    if (!ytIndex.authorId) ytIndex.authorId = {}
    if (!videoId) {
        console.log("VideoIDが利用できません。")
        return ytIndex
    }
    if (!videoDetails) {
        console.log("このVideoDetailsデータは利用できません。: " + videoDetails)
        return ytIndex
    }
    let videoIdIndex = 0
    let authorIdIndex = 0
    if (!ytIndex.videoIds[videoId]) videoIdIndex++
    if (!ytIndex.authorId[videoDetails.author.id]) authorIdIndex++
    if (videoIdIndex || authorIdIndex)
        console.log(videoId + "のインデックスを作成。ステータス: VideoID:" + videoIdIndex + " AuthorID:" + authorIdIndex)
    ytIndex.videoIds[videoId] = {
        title: videoDetails.title,
        author: {
            name: videoDetails.author.name,
            id: videoDetails.author.id
        }
    }
    ytIndex.authorId[videoDetails.author.id] = {}
    return ytIndex
}
