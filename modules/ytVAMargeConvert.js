const ffmpeg = require("fluent-ffmpeg")
const fs = require("fs")
/**
 * 動画と音声をffmpegで合成します。
 * @param {string} videoId VideoIDを入力
 * @param {number} type 0でmp4。1でwebmを選択します。
 */
module.exports.ytVAMargeConvert = async (videoId, type) => {
    await new Promise(async resolve => {
        const savePass = require("../dataPass.json").default
        if (!fs.existsSync(savePass + "cache/YTDL/" + videoId + ".mp4"))
            await require("./ytVideoGet").ytVideoGet(videoId)
        if (!fs.existsSync(savePass + "cache/YTDL/" + videoId + ".opus"))
            await require("./ytAudioGet").ytAudioGet(videoId)
        if (!fs.existsSync(savePass + "cache/YTDL/" + videoId + ".mp4") || !fs.existsSync(savePass + "cache/YTDL/" + videoId + ".opus")) return
        if (!fs.existsSync(savePass + "cache/YTDLConverting")) fs.mkdirSync(savePass + "cache/YTDLConverting")
        let ext = ".mp4"
        const convert = ffmpeg()
        convert.addInput(savePass + "cache/YTDL/" + videoId + ".mp4")
        convert.addInput(savePass + "cache/YTDL/" + videoId + ".opus")
        switch (type) {
            case 0: convert.addOptions(["-c:v libx264", "-c:a aac", "-tag:v avc1"]); break
            case 1: convert.addOptions(["-c:v libvpx-vp9", "-c:a libopus"]); ext = ".webm"; break
        }
        convert.addOptions(["-map 0:v:0", "-map 1:a:0"])
        convert.save(savePass + "cache/YTDLConverting/" + videoId + ext)
        convert.on("end", () => {
            if (!fs.existsSync(savePass + "cache/YTDLConvert")) fs.mkdirSync(savePass + "cache/YTDLConvert")
            const Stream = fs.createReadStream(savePass + "cache/YTDLConverting/" + videoId + ext)
            Stream.pipe(fs.createWriteStream(savePass + "cache/YTDLConvert/" + videoId + ext))
            Stream.on("end", () => {
                console.log("動画合成完了: " + videoId)
                resolve()
            })
        })
    })
}
