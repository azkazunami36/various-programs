/**
 * ChannelIDから情報を取得する
 * @param {string} authorId 
 * @param ytdlRawInfoData
 */
const ytch = require("yt-channel-info")
module.exports.ytAuthorInfoGet = async (authorId, ytchRawInfoData) => await new Promise(async (resolve, reject) => { //情報取得をPromiseで待機させる
    //VideoIDから情報を取得
    if (!ytchRawInfoData[authorId]) await ytch.getChannelInfo({ channelId: authorId }).then(info => {
        console.log("取得完了" + info.author)
        resolve(info)
    })
        .catch((e) => console.log(e))
    else resolve(ytchRawInfoData[authorId])
})
