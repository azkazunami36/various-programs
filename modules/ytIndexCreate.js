/**
 * VideoIDからインデックスを作成します
 * @param videoId VideoID
 * @param ytIndex 変更を加えるためにインデックスに使用する変数を入力
 * @returns ytIndexを返します。
 */
const fs = require("fs")
module.exports.ytIndexCreate = async (videoId, ytIndex) => {
    if (!ytIndex) return console.log("ytIndexがうまく受け取れません。: " + ytIndex)
    const videoDetails = JSON.parse(fs.readFileSync("data.json")).ytdlRawInfoData[videoId]
    if (!ytIndex.videoIds) ytIndex.videoIds = {}
    if (!ytIndex.authorId) ytIndex.authorId = {}
    let videoIdIndex = 0
    let authorIdIndex = 0
    if (!ytIndex.videoIds[videoId]) videoIdIndex++
    if (!ytIndex.authorId[videoId]) authorIdIndex++
    console.log(videoId + "のインデックスを作成。ステータス: VideoID:" + videoIdIndex + " AuthorID:" + authorIdIndex)
    ytIndex.videoIds[videoId] = ""
    ytIndex.authorId[videoDetails.author.id] = {}
    return ytIndex
}