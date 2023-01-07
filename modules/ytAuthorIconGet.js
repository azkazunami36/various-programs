const resize = {
    ratio: "1",
    size: "64"
}
const fs = require("fs")
const imageSize = require("image-size")
const sharp = require("sharp")
const axios = require("axios")
/**
 * ChannelIDからサムネイルを取得します。
 * @param {string} authorId 
 * @param {resize} resize
 */
module.exports.ytAuthorIconGet = async (authorId, resize) => {
    if (!fs.existsSync("C:/cache/YouTubeAuthorIcon/" + authorId + ".jpg")) { //画像が無かったら
        //各大きさのサムネイルリストを取得
        const thumbnails = JSON.parse(fs.readFileSync("data.json")).ytchRawInfoData[authorId].authorThumbnails
        await new Promise(async resolve => {
            //axiosでデータリクエスト。サムネリストの一番最後が高画質なため、それを取得する
            axios.get(thumbnails[thumbnails.length - 1].url, { responseType: "arraybuffer" })
                .then(res => {
                    fs.writeFileSync("C:/cache/YouTubeAuthorIcon/" + authorId + ".jpg", new Buffer.from(res.data), "binary") //保存
                    console.log(authorId, "の高品質アイコン取得")
                    resolve()
                })
                .catch(err => {
                    console.log(authorId, "の高品質アイコン取得時にエラー: ", err, thumbnails[thumbnails.length - 1].url)
                    resolve()
                })
        })
    }
    if (resize && !fs.existsSync("C:/cache/YouTubeAuthorIconRatioResize/" + authorId + "-r" + resize.ratio + "-" + resize.size + ".jpg")) {
        if (!fs.existsSync("C:/cache/YouTubeAuthorIcon/" + authorId + ".jpg")) return
        await new Promise(async resolve => {
            //大きさなどを取得
            const { width, height, type } = await imageSize("C:/cache/YouTubeAuthorIcon/" + authorId + ".jpg")
            let tmp1 = width, tmp2 = height //計算のために
            while (tmp2 != 0) {
                let tmp3 = tmp2
                tmp2 = tmp1 % tmp2
                tmp1 = tmp3
            }
            let aspx = width / tmp1, aspy = height / tmp1, y = 0
            const ratio = Number(resize.ratio)
            const size = Number(resize.size) * ratio
            const target = (size > height) ? height : size
            while (aspy * y < target) y++ //受け取った指定画質にリサイズするために
            //キャッシュから画像を取得する
            const Stream = fs.createWriteStream("C:/cache/YouTubeAuthorIconRatioResize/" + authorId + "-r" + resize.ratio + "-" + resize.size + ".jpg")
            sharp("C:/cache/YouTubeAuthorIcon/" + authorId + ".jpg").resize(aspx * y, aspy * y).pipe(Stream).on("error", e => {
                console.log(authorId, "の最適化アイコン作成時にエラー: ", e)
                resolve() //エラーが発生しようともmain.jsでは存在しないことに出来るため、そのまま終了
            })
            Stream.on("finish", () => {
                console.log(authorId, "の最適化アイコン作成")
                resolve()
            })
        })
    }
}
