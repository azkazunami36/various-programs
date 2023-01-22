const fs = require("fs")
const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const ytVideoGetErrorMessage = require("./ytVideoGetErrorMessage").ytVideoGetErrorMessage
const savePass = require("../dataPass.json").default
/**
 * 動画の拡張子付きのコーデック名です。  
 * この中に含まれているものは全て対応しています。
 */
const videocodec = [
    {
        full: "h264.mp4",
        codec: "h264",
        ffmpegOption: [
            "-c:v libx264"
        ],
        contentType: "video/mp4"
    },
    {
        full: "h265.hevc",
        codec: "h265",
        ffmpegOption: [
            "-c:v libx265"
        ],
        contentType: "video/hevc"
    },
    {
        full: "vp9.webm",
        codec: "vp9",
        ffmpegOption: [
            "-c:v libvpx-vp9"
        ],
        contentType: "video/webm"
    },
    {
        full: "av1.webm",
        codec: "av1",
        ffmpegOption: [
            "-c:v libaom-av1"
        ],
        contentType: "video/webm"
    }
]
/**
 * 音声の拡張子付きのコーデック名です。
 * 以下省略
 */
const audiocodec = [
    {
        full: "aac.aac",
        codec: "aac",
        ffmpegOption: [
            "-vn",
            "-c:a aac"
        ],
        contentType: "audio/aac"
    },
    {
        full: "opus.opus",
        codec: "opus",
        ffmpegOption: [
            "-vn",
            "-c:a libopus"
        ],
        contentType: "audio/opus"
    }
]
//ffmpegのプリセットを決めます。
const speed = [
    "ultrafast", //[0]
    "superfast", //[1]
    "veryfast", //[2]
    "faster", //[3]
    "fast", //[4]
    "medium", //[5]
    "slow", //[6]
    "slower", //[7]
    "veryslow", //[8]
    "placebo" //[9]
][5]
/**
 * YouTubeDLフォルダのローカルパスを取得します。
 * @param {string} videoId VideoIDを入力
 * @param {string} type 取得したい動画の種類を選択します。
 */
const ytPassGet = async (videoId, type) => {
    switch (type) {
        case "mp4": {
            const vcodec = "h264"
            const acodec = "aac"
            const pass = savePass + "cache/YouTubeDLConvert/" + videoId + "-" + vcodec + "_" + acodec + ".mp4"
            if (!fs.existsSync(pass)) await videoMarge(videoId, vcodec, acodec)
            if (!fs.existsSync(pass)) {
                console.log("エラー: 存在するはずのデータが存在しません。")
                return null
            }
            return pass
        }
        case "webm": {
            const vcodec = "vp9"
            const acodec = "opus"
            const pass = savePass + "cache/YouTubeDLConvert/" + videoId + "-" + vcodec + "_" + acodec + ".webm"
            if (!fs.existsSync(pass)) await videoMarge(videoId, vcodec, acodec)
            if (!fs.existsSync(pass)) {
                console.log("エラー: 存在するはずのデータが存在しません。")
                return null
            }
            return pass
        }
        case "h264": return sourceRequest(videoId, "h264")
        case "h265": return sourceRequest(videoId, "h265")
        case "vp9": return sourceRequest(videoId, "vp9")
        case "av1": return sourceRequest(videoId, "av1")
        case "aac": return sourceRequest(videoId, "aac")
        case "opus": return sourceRequest(videoId, "opus")

    }
    console.log("エラー: 予想外の要求です。")
    return null
}
/**
 * YouTubeDLを使用してデータを取得します。
 * @param {string} videoId 
 * @param {string} type 
 * @param callback 
 */
const youtubedl = async (videoId, type) => {
    await new Promise(async resolve => {
        const reqmsg = "要求: " + type + "/" + videoId
        let st
        const youtubedl = ytdl(videoId, { filter: type + "only", quality: "highest" })
        youtubedl.once("response", e => {
            if (!st) st = Date.now()
            console.log(reqmsg + " の取得をYouTubeDLで実行中")
        })
        youtubedl.on("progress", (chunkLength, downloaded, total) => {
            const floatDownloaded = downloaded / total
            const downloadedSeconds = (Date.now() - st) / 1000
            const status = {
                elapsedTime: downloadedSeconds,
                esTimeRemaining: downloadedSeconds / floatDownloaded - downloadedSeconds,
                percent: floatDownloaded,
                downloadedSize: downloaded,
                totalSize: total,
                chunkLength: chunkLength
            }
        })
        youtubedl.on("error", async err => {
            const jpmsg = ytVideoGetErrorMessage(err.message)
            console.log(reqmsg + "の取得をYouTubeDLで実行中にエラー: ", jpmsg ? jpmsg : err)
            resolve()
        })
        const time = Date.now()
        youtubedl.pipe(fs.createWriteStream(savePass + "cache/Temp/" + videoId + "-" + time))
        youtubedl.on("end", async e => {
            const ffprobe = ffmpeg()
            ffprobe.addInput(savePass + "cache/Temp/" + videoId + "-" + time)
            ffprobe.ffprobe(async (err, data) => {
                if (err) throw err
                if (data.streams.length == 0) throw "ストリームがありません。", data, (data.streams) ? data.streams : undefined
                const Stream = fs.createReadStream(savePass + "cache/Temp/" + videoId + "-" + time)
                console.log(data.streams[0].codec_name)
                const codec = (await codecMatchTest(data.streams[0].codec_name)).full
                Stream.pipe(fs.createWriteStream(savePass + "cache/YouTubeDL/" + videoId + "-" + codec))
                Stream.on("end", () => {
                    console.log(reqmsg + "の取得をYouTubeDLで実行し、無事に完了しました。")
                    resolve(data.streams[0].codec_name)
                })
            })
        })
    })
}
/**
 * 指定のコーデックのデータパスを返します。
 * @param {string} videoId 
 * @param {string} type 
 * @returns 
 */
const sourceRequest = async (videoId, type) => {
    const pass = savePass + "cache/YouTubeDL/" + videoId + "-" + (await codecMatchTest(type)).full
    if (!fs.existsSync(pass)) {
        console.log("要求されたソース " + videoId + "/" + type + " はローカルに存在しないため、変換をし取得します。")
        const pass = await sourceExist(videoId, (await sourceType(type)))
        if (pass) {
            await convert(videoId, type, pass)
            if (!fs.existsSync(pass)) {
                console.log("エラー: 存在するはずのデータが存在しません。")
                return null
            }
        } else {
            await youtubedl(videoId, (await sourceType(type)))
            const pass = await sourceExist(videoId, (await sourceType(type)))
            if (pass) {
                await convert(videoId, type, pass)
                if (!fs.existsSync(pass)) {
                    console.log("エラー: 存在するはずのデータが存在しません。")
                    return null
                }
            } else {
                console.log("YouTubeDLを使用しても、要求されたソース " + videoId + "/" + type + " は取得できていないようです。")
                return null
            }
        }
    }
    return pass
}
/**
 * データを元のパスから指定のコーデックに変換します。
 * @param {string} videoId 
 * @param {string} type 
 * @param {string} pass
 */
const convert = async (videoId, type, pass) => {
    const npass = savePass + "cache/YouTubeDL/" + videoId + "-" + (await codecMatchTest(type)).full
    await new Promise(async resolve => {
        const convert = ffmpeg()
        convert.addInput(pass)
        convert.addOptions([...(await codecMatchTest(type)).ffmpegOption, "-preset " + speed])
        const time = Date.now()
        convert.on("start", start => console.log("要求されたソース " + videoId + "/" + type + " の変換を開始します。"))
        convert.save(savePass + "cache/Temp/" + videoId + "-" + time + (await codecMatchTest(type)).full)
        convert.on("end", async () => {
            const Stream = fs.createReadStream(savePass + "cache/Temp/" + videoId + "-" + time + (await codecMatchTest(type)).full)
            Stream.pipe(fs.createWriteStream(npass))
            Stream.on("end", () => {
                console.log("要求されたソース " + videoId + "/" + type + " の変換が完了しました。")
                resolve(npass)
            })
        })
    })
}
/**
 * 指定の動画コーデックと音声コーデックを統合します。
 * @param {string} videoId 
 * @param {string} vcodec 
 * @param {string} acodec 
 */
const videoMarge = async (videoId, vcodec, acodec) => {
    const videopass = await sourceRequest(videoId, vcodec)
    const audiopass = await sourceRequest(videoId, acodec)
    if (videopass && audiopass) {
        await new Promise(async resolve => {
            console.log("ソース: " + videoId + " の" + vcodec + "と" + acodec + "の統合を開始します。")
            const pass = savePass + "cache/YouTubeDLConvert/" + videoId + "-" + vcodec + "_" + acodec + "." + (await codecMatchTest(vcodec)).full.split(".")[1]
            const convert = ffmpeg()
            convert.addInput(videopass)
            convert.addInput(audiopass)
            convert.addOptions(["-c:v copy", "-c:a copy", "-map 0:v:0", "-map 1:a:0"])
            const time = Date.now()
            convert.save(savePass + "cache/Temp/" + videoId + "-" + time + (await codecMatchTest(vcodec)).full)
            convert.on("end", async () => {
                const Stream = fs.createReadStream(savePass + "cache/Temp/" + videoId + "-" + time + (await codecMatchTest(vcodec)).full)
                Stream.pipe(fs.createWriteStream(pass))
                Stream.on("end", () => {
                    console.log("ソース: " + videoId + " の" + vcodec + "と" + acodec + "の統合が完了しました。")
                    resolve(pass)
                })
            })
        })
    }
}
/**
 * YouTubeDLフォルダ内からVideoIDの動画をどれかのコーデックから取得しパスを返します。
 * @param {string} videoId 
 * @param {string} type 
 * @returns 
 */
const sourceExist = async (videoId, type) => {
    if (type == "video") {
        for (let i = 0; i != videocodec.length; i++) {
            const pass = savePass + "cache/YouTubeDL/" + videoId + "-" + videocodec[i].full
            if (fs.existsSync(pass)) return pass
        }
    } else {
        for (let i = 0; i != audiocodec.length; i++) {
            const pass = savePass + "cache/YouTubeDL/" + videoId + "-" + audiocodec[i].full
            if (fs.existsSync(pass)) return pass
        }
    }
    console.log("ソース " + videoId + "/" + type + " はローカルに保存されていないようです。")
    return null
}
/**
 * コーデック名から動画か音声かを判別します。
 * @param {string} type 
 */
const sourceType = async type => {
    for (let i = 0; i != videocodec.length; i++)
        if (type == videocodec[i].codec) return "video"
    for (let i = 0; i != audiocodec.length; i++)
        if (type == audiocodec[i].codec) return "audio"
    console.log(
        "コーデック名: " +
        type +
        " から動画か音声かを判別できませんでした。nullを返しますが、必然的に音声と扱われる可能性があります。"
    )
    return null
}
/**
 * コーデック名がプログラムで利用できるかを確認します。
 * @param {string} codec 
 * @returns 
 */
const codecMatchTest = async codec => {
    const pcodec = [...videocodec, ...audiocodec]
    for (let i = 0; i != pcodec.length; i++)
        if (codec == pcodec[i].codec) return pcodec[i]
    console.log("コーデック名: " + codec + " を受け取りましたが、このプログラムでは判別ができませんでした。")
    return null
}
/**
 * データパスのファイル名と拡張子から、Content-Typeを取得します。  
 * [VideoID]-[Codec|VideoCodec]_[AudioCodec].[Extension]という規則のファイル名でないと、エラーになる可能性があります。
 * @param {string} pass 
 */
const passContentTypeGet = async pass => {
    let videoId = ""
    let codec = ""
    let extension = ""
    const passSplit = pass.split("/") //階層の数だけ配列ができる
    const filename = passSplit[passSplit.length - 1] //一番最後を指定することでファイル名を取得
    const svideoId = filename.split("-") //規則の中から「VideoID」を取得し、反対にはコーデック等がある
    for (let i = 0; i != svideoId.length - 1; i++) { //もしVideoIDに「-」が合った場合は統合される
        if (i != 0) videoId += "-"
        videoId += svideoId[i]
    }
    const scodec = svideoId[svideoId.length - 1] //最後の方を取得することで、必然的にコーデックの文字列にアクセスできる
    const sextension = scodec.split(".") //あらかじめ拡張子とコーデックを分けておく
    extension = sextension[1] //確定したので格納
    codec = sextension[0] //まず１度コーデック名を格納
    const mcodec = sextension[0].split("_") //「_」が使われている場合、コーデックが２つあるため配列が作成される
    if (mcodec.length != 1) codec = mcodec[0] //配列が２つある場合、１つ目のコーデック名を格納する
    console.log(videoId, codec, extension)
    return (await codecMatchTest(codec)).contentType //取得されたコーデック名からContent-Typeを取得する
}
const deleteSource = async videoId => {
    while (await sourceExist(videoId, "video"))
        fs.unlinkSync(await sourceExist(videoId, "video"))
    while (await sourceExist(videoId, "audio"))
        fs.unlinkSync(await sourceExist(videoId, "audio"))
}
module.exports = {
    ytPassGet,
    youtubedl,
    sourceRequest,
    codecMatchTest,
    sourceExist,
    convert,
    sourceType,
    videoMarge,
    videocodec,
    audiocodec,
    passContentTypeGet,
    deleteSource
}
