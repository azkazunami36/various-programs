const resize = {
    ratio: "1",
    size: "360"
}
const fs = require("fs")
const imageSize = require("image-size")
const sharp = require("sharp")
const axios = require("axios")
const ytVideoGetErrorMessage = require("./ytVideoGetErrorMessage").ytVideoGetErrorMessage
/**
 * VideoIDからサムネイルを取得します。
 * @param {string} videoId
 * @param {resize} resize
 */
module.exports.ytThumbnailGet = async (videoId, resize) => {
    const savePass = require("../dataPass.json").default
    if (!fs.existsSync(savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg")) { //画像が無かったら
        //各大きさのサムネイルリストを取得
        const thumbnails = JSON.parse(fs.readFileSync("data.json")).ytdlRawInfoData[videoId].thumbnails
        await new Promise(async resolve => {
            //axiosでデータリクエスト。サムネリストの一番最後が高画質なため、それを取得する
            axios.get(thumbnails[thumbnails.length - 1].url, { responseType: "arraybuffer" })
                .then(res => {
                    fs.writeFileSync(savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg", new Buffer.from(res.data), "binary") //保存
                    console.log(videoId, "の高品質サムネイル取得")
                    resolve()
                })
                .catch(err => {
                    const jpmsg = ytVideoGetErrorMessage(String(err))
                    console.log(videoId, "の高品質サムネイル取得時にエラー: ", jpmsg ? jpmsg : err, thumbnails[thumbnails.length - 1].url)
                    resolve()
                })
        })
    }
    if (resize && !fs.existsSync(savePass + "cache/YouTubeThumbnailRatioResize/" + videoId + "-r" + resize.ratio + "-" + resize.size + ".jpg")) {
        if (!fs.existsSync(savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg")) return
        await new Promise(async resolve => {
            //大きさなどを取得
            const { width, height, type } = await imageSize(savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg")
            let tmp1 = width, tmp2 = height //計算のために
            while (tmp2 != 0) {
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
            while (aspy * y < target) y++ //受け取った指定画質にリサイズするために
            //キャッシュから画像を取得する
            const Stream = fs.createWriteStream(savePass + "cache/YouTubeThumbnailRatioResize/" + videoId + "-r" + resize.ratio + "-" + resize.size + ".jpg")
            sharp(savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg").resize(aspx * y, aspy * y).pipe(Stream).on("error", e => {
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
