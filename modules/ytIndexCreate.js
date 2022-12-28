/**
 * VideoIDからインデックスを作成します
 * @param videoId VideoID
 * @param ytIndex 変更を加えるためにインデックスに使用する変数を入力
 * @returns ytIndexを返します。
 */
module.exports.ytIndexCreate = async (videoId, ytIndex) => {
    if (!ytIndex) return console.log("ytIndexがうまく受け取れません。: " + ytIndex)
    const videoDetails = JSON.parse(fs.readFileSync("data.json")).ytdlRawInfoData[videoId]
    if (!ytIndex.videoIds) ytIndex.videoIds = {}
    if (!ytIndex.Author) ytIndex.Author = {}
    let videoIdIndex = 0
    let authorIdIndex
    if (!ytIndex.videoIds[videoId]) videoIdIndex++
    if (!ytIndex.authorId[videoId]) authorIdIndex++
    else console.log("YouTubeInfoIndex Rebuilded: " + videoId)
    ytIndex.videoIds[videoId] = ""
    ytIndex.authorId[videoDetails.author.id] = {}
    return ytIndex
}