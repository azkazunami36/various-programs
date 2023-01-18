/**
 * VideoIDから情報を取得する
 * @param {string} videoId 
 * @param {any} ytdlRawInfoData
 */
const ytdl = require("ytdl-core")
module.exports.ytVideoInfoGet = async (videoId, ytdlRawInfoData) => {
    return await new Promise(async (resolve, reject) => { //情報取得をPromiseで待機させる
        //VideoIDから情報を取得
        if (!ytdlRawInfoData[videoId]) await ytdl.getInfo(videoId).then(async info => {
            console.log("取得完了: " + info.videoDetails.title)
            resolve(info.videoDetails)
        }).catch(e => {
            console.log(videoId + " の動画取得中にエラーが発生しました。: " + e)
            resolve(null)
        })
        else resolve(ytdlRawInfoData[videoId])
    })
}
