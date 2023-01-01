const resize = {
    ratio: "1",
    size: "360"
}
const fs = require("fs")
const imageSize = require("image-size")
const sharp = require("sharp")
const axios = require("axios")
/**
 * VideoIDからサムネイルを取得します。
 * @param {string} videoId
 * @param {resize} resize
 */
module.exports.ytThumbnailGet = async (videoId, resize) => {
    //ytdlの各大きさのサムネイルリストを取得
    let thumbnails = JSON.parse(fs.readFileSync("data.json")).ytdlRawInfoData[videoId].thumbnails
    if (!fs.existsSync("C:/cache/YouTubeThumbnail/" + videoId + ".jpg")) { //画像が無かったら
        await new Promise(async resolve => {
            //axiosでデータリクエスト、サムネリストの一番最後が高画質なため、それを取得する
            axios.get(thumbnails[thumbnails.length - 1].url, { responseType: "arraybuffer" })
                .then(res => {
                    fs.writeFileSync("C:/cache/YouTubeThumbnail/" + videoId + ".jpg", new Buffer.from(res.data), "binary") //保存
                    console.log(videoId, "の高品質サムネイル取得")
                    resolve()
                })
                .catch(err => {
                    console.log(videoId, "の高品質サムネイル取得時にエラー: ", err)
                    resolve()
                })
        })
    }
    if (resize && !fs.existsSync("C:/cache/YouTubeThumbnailRatioResize/" + videoId + "-r" + resize.ratio + "-" + resize.size + ".jpg")) {
        if (!fs.existsSync("C:/cache/YouTubeThumbnail/" + videoId + ".jpg")) return
        await new Promise(async resolve => {
            //大きさなどを取得
            const { width, height, type } = await imageSize("C:/cache/YouTubeThumbnail/" + videoId + ".jpg")
            let tmp1 = width //計算のために
            let tmp2 = height
            for (tmp1; tmp2 != 0;) {
                let tmp3 = tmp2
                tmp2 = tmp1 % tmp2
                tmp1 = tmp3
            }
            let aspx = width / tmp1 //アスペクト比に使用できる
            let aspy = height / tmp1
            let y = 0
            const ratio = Number(resize.ratio)
            const size = Number(resize.size) * ratio
            const target = (size > height) ? height : size
            for (y; (aspy * y) < target; y++) { } //受け取った指定画質にリサイズするために
            //キャッシュから画像を取得する
            const Stream = fs.createWriteStream("C:/cache/YouTubeThumbnailRatioResize/" + videoId + "-r" + resize.ratio + "-" + resize.size + ".jpg")
            sharp("C:/cache/YouTubeThumbnail/" + videoId + ".jpg").resize(aspx * y, aspy * y).pipe(Stream).on("error", e => {
                console.log(videoId, "の最適化アイコン作成時にエラー: ", e)
                resolve() //エラーが発生しようともmain.jsでは存在しないことに出来るため、そのまま終了
            })
            Stream.on("finish", () => {
                console.log(videoId, "の最適化サムネイル作成")
                resolve()
            })
        })
    }
}
