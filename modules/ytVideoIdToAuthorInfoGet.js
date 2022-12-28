/**
 * VideoIDのリストから不足したユーザー情報を取得する
 * @param {any} ytdlRawInfoData 
 * @param {any} ytchRawInfoData
 */
module.exports.ytVideoIdToAuthorInfoGet = async (ytdlRawInfoData, ytchRawInfoData) => {
    const videoIds = Object.keys(ytdlRawInfoData)
    for (let i = 0; i != videoIds.length; i++) {
        const authorId = ytdlRawInfoData[videoIds[i]].author.id
        ytchRawInfoData[authorId] = await require("./ytAuthorInfoGet").ytAuthorInfoGet(authorId, ytchRawInfoData)
    }
    return ytchRawInfoData
}