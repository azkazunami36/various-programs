const ytdl = require("ytdl-core");
const fs = require("fs")
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline")

videoIdGet("https://youtube.com/watch?v=ZHgrIIQ3UzA")
    .then(videoId => ytdlGet(videoId, "h264"));

async function videoIdGet(videoId) {
    if (!videoId) {
        console.log("VideoIDを取得するためのデータがありません: " + videoId);
        return null;
    };
    if (!ytdl.validateURL(videoId) && !ytdl.validateID(videoId)) { //URLでもIDでもない場合
        console.log("次の文字列はVideoIDを取得することができません。: " + videoId)
        return null
    }
    videoId = ytdl.getVideoID(videoId) //URLからVideoIDを取得
    return videoId
}
async function ytdlGet(videoId, type) {
    const info = await ytdl.getInfo(videoId)
    const filenameTemp = [
        {
            fileName: "",
            codecName: "",
            fileSize: "",
            progress: 0
        },
        {
            fileName: "",
            codecName: "",
            fileSize: "",
            progress: 0
        }
    ]
    if (!fs.existsSync("Temp")) fs.mkdirSync("Temp")
    const displayInterval = setInterval(() => {
        readline.cursorTo(process.stdout, 0)
        readline.clearLine(process.stdout)
        const prog = filenameTemp[0]["progress"] + filenameTemp[1]["progress"]
        process.stdout.write("ソースをダウンロード中... " + (prog * 50).toFixed() + "%")
    }, 50);
    for (let i = 0; i != 2; i++) {
        await new Promise(async resolve => {
            const youtubedl = ytdl(videoId, { filter: ["video", "audio"][i] + "only", quality: "highest" })
            filenameTemp[i]["fileName"] = "Temp/" + videoId + "-" + Date.now()
            youtubedl.pipe(fs.createWriteStream(filenameTemp[i]["fileName"]))
            youtubedl.on("progress", (chunkLength, downloaded, total) => {
                filenameTemp[i]["progress"] = downloaded / total
            })
            youtubedl.on("end", async e => {
                const ffprobe = ffmpeg()
                ffprobe.addInput(filenameTemp[i]["fileName"])
                ffprobe.ffprobe(async (err, data) => {
                    if (err) throw err
                    if (data.streams.length == 0) throw "ストリームがありません。(予想外のエラー)"
                    filenameTemp[i]["codecName"] = data.streams[0].codec_name
                    filenameTemp[i]["fileSize"] = fs.statSync(filenameTemp[i]["fileName"]).size
                    resolve()
                })
            })
        })
    }
    clearInterval(displayInterval)
    console.log("\n")
    console.log(
        "動画のキャッシュファイル名: " + filenameTemp[0]["fileName"] + "\n" +
        "動画のコーデック名: " + filenameTemp[0]["codecName"] + "\n" +
        "動画のサイズ: " + (filenameTemp[0]["fileSize"] / 1000000).toFixed(1) + "MB" + "\n" +
        "音声のキャッシュファイル名: " + filenameTemp[1]["fileName"] + "\n" +
        "音声のコーデック名: " + filenameTemp[1]["codecName"] + "\n" +
        "音声のサイズ: " + (filenameTemp[1]["fileSize"] / 1000000).toFixed(1) + "MB"
    )
    let options = {
        main: "",
        data: {
            "h264": "-c:v libx264",
            "vp9": "-c:v libvpx-vp9",
            "av1": "-c:v libaom-av1"
        }
    }
    if (options.data[type]) options.main = options.data[type]
    else options.main = options.data[filenameTemp[0]["codecName"]]
    if (!options.main) throw "正しくプログラムが動作しませんでした。"
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
}
