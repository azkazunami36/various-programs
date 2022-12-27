/**
 * VideoIDからサムネイルを取得します。
 * @param {string} videoId 
 */
const fs = require("fs")
const imageSize = require("image-size")
const sharp = require("sharp")
const axios = require("axios")
module.exports.ytThumbnailGet = async videoId => {
    let thumbnails = JSON.parse(fs.readFileSync("data.json")).ytdlRawInfoData[videoId].thumbnails
    if (!fs.existsSync("cache/YouTubeThumbnail/" + videoId + ".jpg")) {
        await new Promise(async resolve => {
            if (!fs.existsSync("cache/YouTubeThumbnail")) fs.mkdirSync("cache/YouTubeThumbnail")
            const imagedata = await axios.get(thumbnails[thumbnails.length - 1].url, { responseType: "arraybuffer" })
            fs.writeFileSync("cache/YouTubeThumbnail/" + videoId + ".jpg", new Buffer.from(imagedata.data), "binary")
            console.log("高品質サムネイル取得")
            resolve()
        })
    }
    if (!fs.existsSync("cache/YouTubeThumbnailLowQuality/" + videoId + ".jpg")) {
        await new Promise(async resolve => {
            const imagedata = fs.readFileSync("cache/YouTubeThumbnail/" + videoId + ".jpg", "binary")
            const { width, height, type } = await imageSize("cache/YouTubeThumbnail/" + videoId + ".jpg")
            let tmp1 = width
            let tmp2 = height
            for (tmp1; tmp2 != 0;) {
                let tmp3 = tmp2
                tmp2 = tmp1 % tmp2
                tmp1 = tmp3
            }
            let aspx = width / tmp1
            let aspy = height / tmp1
            let x = 0
            for (x; (aspx * (x + 1)) < 640;) x += 1
            if (!fs.existsSync("cache/YouTubeThumbnailLowQuality")) fs.mkdirSync("cache/YouTubeThumbnailLowQuality")
            const writeStream = fs.createWriteStream("cache/YouTubeThumbnailLowQuality/" + videoId + ".jpg")
            sharp("cache/YouTubeThumbnail/" + videoId + ".jpg").resize(aspx * x, aspy * x).pipe(writeStream)
            writeStream.on("finish", () => {
                console.log("低品質サムネイル作成")
                resolve()
            })
        })
    }
}