const express = require("express")
const readline = require("readline")
const fs = require("fs")
const ffmpeg = require("fluent-ffmpeg")
const cors = require("cors")
const ytdl = require("ytdl-core")
const querystring = require("querystring")
const axios = require("axios")
const uuid = require("uuid")
const path = require("path")
const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    Events,
    Message
} = require("discord.js")
const {
    entersState,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    AudioPlayerStatus
} = require("@discordjs/voice")
const mbyteString = require("./modules/mbyteString").mbyteString
const timeString = require("./modules/timeString").timeString
const arrayRamdom = require("./modules/arrayRamdom").arrayRamdom
/**
 * envファイルを生成します。
 */
if (!fs.existsSync(".env")) fs.writeFileSync(".env", "TOKEN=")
/**
 * envファイルからデータを読み込み、process.envに格納します。
 */
require("dotenv").config()
/**
 * 最初にjsonファイルを生成します。
 */
if (!fs.existsSync("data.json")) fs.writeFileSync("data.json", "{}")
/**
 * cacheフォルダを生成します。
 */
if (!fs.existsSync("cache/")) fs.mkdirSync("cache")
/**
 * データを格納しています。
 * このjson内を操作する際は、プログラムを終了してから変更を加えてください。
 */
const dtbs = require("./data.json")
/**
 * Appです(？)
 */
const app = express()
/**
 * 使用するポート番号を決定します。
 * env内にポートが設定されている場合、それを使用します。
 */
const port = parseInt(process.env.PORT || "80", 10)
/**
 * 受信を開始します。
 */
app.listen(port, async () => {
    let address = "http://localhost"
    if (port != "80") address += ":" + port
    console.info("ポート" + port + "でWebを公開しました！ " + address + " にアクセスして、操作を開始します！")
})
/**
 * なんでこれを使うかを忘れた。
 */
app.use(cors())
/**
 * GET、POSTのデータをすべてここで受信する。
 * GET、POSTのパス等はif等で判断する。
 */
app.get("*", async (req, res) => {
    console.log("Get :", req.url)
    if (req.url == "/" || req.url == "/sources/index.html") {
        res.header("Content-Type", "text/html;charset=utf-8")
        res.end(fs.readFileSync("sources/index.html"))
    } else if (req.url == "/sources/ytdl/" || req.url == "/sources/ytdl/index.html") {
        res.header("Content-Type", "text/html;charset=utf-8")
        res.end(fs.readFileSync("sources/ytdl/index.html"))
    } else if (req.url.match("/sources/ytdl/watch?")) {
        res.header("Content-Type", "text/html;charset=utf-8")
        res.end(fs.readFileSync("sources/ytdl/playwith/index.html"))
    } else if (req.url == "/favicon.ico") {
        res.status(204)
        res.end()
    } else if (req.url.match(/\/sources\/*/)) {
        const filelink = "sources/" + (String(req.url).split("/sources/")[1]).split("?")[0]
        console.log(filelink)
        if (fs.existsSync(filelink)) {
            try {
                res.header("Content-Type", "text/plain;charset=utf-8")
                const file = fs.readFileSync(filelink)
                res.end(file)
            } catch (e) { res.status(404); res.end() }
        } else {
            res.status(400)
            res.end()
        }
    } else if (req.url.match(/\/modules\/*/)) {
        const filelink = "modules/" + (String(req.url).split("/modules/")[1])
        console.log(filelink)
        if (fs.existsSync(filelink)) {
            try {
                res.header("Content-Type", "text/javascript;charset=utf-8")
                const file = fs.readFileSync(filelink)
                res.end(file)
            } catch (e) { res.status(404); res.end() }
        } else {
            res.status(400)
            res.end()
        }
    } else if (req.url.match(/\/ytimage\/*/)) {
        const videoId = String(req.url).split("/ytimage/")[1]
        const thumbnailpath = "cache/YouTubeThumbnail/" + videoId + ".jpg"
        if (fs.existsSync(thumbnailpath)) {
            res.header("Content-Type", "image/jpeg")
            res.end(fs.readFileSync(thumbnailpath))
        } else {
            res.status(400)
            res.end()
        }
    } else if (req.url.match(/\/ytvideo\/*/)) {
        const videoId = String(req.url).split("/ytvideo/")[1]
        const videopath = "cache/YTDl/" + videoId + ".mp4"
        if (fs.existsSync(videopath)) {
            const videoSize = fs.statSync(videopath).size
            const chunkSize = 1 * 1e6
            const start = Number((req.headers.range || "0").replace(/\D/g, ""))
            const end = Math.min(start + chunkSize, videoSize - 1)

            const contentrange = "bytes " + start + "-" + end + "/" + videoSize
            const contentLength = end - start + 1
            console.log("Content-Range: " + contentrange + " Content-Length: " + contentLength)

            const headers = {
                "Content-Range": contentrange,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4"
            };
            res.writeHead(206, headers)
            const Stream = fs.createReadStream(videopath, { start, end })
            Stream.pipe(res)
        } else {
            res.status(400)
            res.end()
        }
    } else if (req.url.match(/\/ytaudio\/*/)) {
        const videoId = String(req.url).split("/ytaudio/")[1]
        const audiopath = "cache/YTDl/" + videoId + ".mp3"
        if (fs.existsSync(audiopath)) {
            const audioSize = fs.statSync(audiopath).size
            const chunkSize = 1 * 1e6
            const start = Number((req.headers.range || "0").replace(/\D/g, ""))
            const end = Math.min(start + chunkSize, audioSize - 1)

            const contentrange = "bytes " + start + "-" + end + "/" + audioSize
            const contentLength = end - start + 1
            console.log("Content-Range: " + contentrange + " Content-Length: " + contentLength)

            const headers = {
                "Content-Range": contentrange,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "audio/mp3"
            };
            res.writeHead(206, headers)
            const Stream = fs.createReadStream(audiopath, { start, end })
            Stream.pipe(res)
        } else {
            res.status(400)
            res.end()
        }
    } else if (false) {
    } else if (false) {
    } else if (false) {
    } else if (false) {
    } else if (false) {
    } else if (false) {
    } else {
        console.log("404 : " + req.url)
        res.status(404)
        res.end()
    }
})
app.post("*", async (req, res) => {
    console.log("Post:", req.url)
    switch (req.url) {
        /**
         * YouTube動画の情報を取得し保存します。
         * クライアントにもRawデータを送信はしますが、用途は不明です。
         */
        case "/youtube-info": {
            let data = ""
            req.on("data", async chunk => data += chunk)
            req.on("end", async () => {
                console.log(data)
                const videolist = JSON.parse(data)
                const videoinfos = []
                for (let i = 0; i != videolist.length; i++) {
                    let videoId = videolist[i]
                    res.header("Content-Type", "text/plaincharset=utf-8")
                    if (ytdl.validateURL(videoId) || ytdl.validateID(videoId)) {
                        if (ytdl.validateURL(videoId)) videoId = ytdl.getVideoID(videoId)
                        console.log(videoId)
                        if (!dtbs.ytdlRawInfoData) { dtbs.ytdlRawInfoData = {} }
                        await new Promise(async (resolve, reject) => {
                            if (!dtbs.ytdlRawInfoData[videoId]) await ytdl.getInfo(videoId).then(async info => {
                                dtbs.ytdlRawInfoData[videoId] = info.videoDetails
                                saveingJson()
                                console.log("ytdlinfo-get")
                                ytIndexCreate(videoId)
                            }).catch((e) => { console.log(e); videoinfos.push({ error: "不明" }) })
                            resolve();
                        }).then(async () => {
                            if (!fs.existsSync("cache/YouTubeThumbnail/" + videoId + ".jpg")) {
                                let thumbnails = dtbs.ytdlRawInfoData[videoId].thumbnails
                                const imagedata = await axios.get(thumbnails[thumbnails.length - 1].url, { responseType: "arraybuffer" })
                                if (!fs.existsSync("cache/YouTubeThumbnail")) fs.mkdirSync("cache/YouTubeThumbnail")
                                fs.writeFileSync("cache/YouTubeThumbnail/" + videoId + ".jpg", new Buffer.from(imagedata.data), "binary")
                            }
                            let starttime = {}
                            if (!fs.existsSync("cache/YTDl/" + videoId + ".mp4")) {
                                if (!fs.existsSync("cache/YouTubeDownloadingVideo")) fs.mkdirSync("cache/YouTubeDownloadingVideo")
                                const videoDownload = ytdl(videoId, { filter: "videoonly", quality: "highest" })
                                videoDownload.once("response", () => starttime.video = Date.now())
                                videoDownload.on("progress", (chunkLength, downloaded, total) => {
                                    const floatDownloaded = downloaded / total
                                    const downloadedSeconds = (Date.now() - starttime.video) / 1000
                                    //推定残り時間
                                    const timeLeft = downloadedSeconds / floatDownloaded - downloadedSeconds
                                    //パーセント
                                    const percent = (floatDownloaded * 100).toFixed()
                                    //ダウンロード済みサイズ
                                    const mbyte = mbyteString(downloaded)
                                    //最大ダウンロード量
                                    const totalMbyte = mbyteString(total)
                                    //推定残り時間
                                    const elapsedTime = timeString(downloadedSeconds)
                                })
                                videoDownload.on("error", async err => { console.log("Video Get Error " + videoId) })
                                videoDownload.pipe(fs.createWriteStream("cache/YouTubeDownloadingVideo/" + videoId + ".mp4"))
                                videoDownload.on("end", () => {
                                    if (!fs.existsSync("cache/YTDl")) fs.mkdirSync("cache/YTDl")
                                    fs.createReadStream("cache/YouTubeDownloadingVideo/" + videoId + ".mp4")
                                        .pipe(fs.createWriteStream("cache/YTDl/" + videoId + ".mp4"))
                                })
                            }
                            if (!fs.existsSync("cache/YTDl/" + videoId + ".mp3")) {
                                if (!fs.existsSync("cache/YouTubeDownloadingAudio")) fs.mkdirSync("cache/YouTubeDownloadingAudio")
                                const audioDownload = ytdl(videoId, { filter: "audioonly", quality: "highest" })
                                audioDownload.once("response", () => starttime.audio = Date.now())
                                audioDownload.on("progress", (chunkLength, downloaded, total) => {
                                    const floatDownloaded = downloaded / total
                                    const downloadedSeconds = (Date.now() - starttime.audio) / 1000
                                    //推定残り時間
                                    const timeLeft = downloadedSeconds / floatDownloaded - downloadedSeconds
                                    //パーセント
                                    const percent = (floatDownloaded * 100).toFixed()
                                    //ダウンロード済みサイズ
                                    const mbyte = mbyteString(downloaded)
                                    //最大ダウンロード量
                                    const totalMbyte = mbyteString(total)
                                    //推定残り時間
                                    const elapsedTime = timeString(downloadedSeconds)
                                })
                                audioDownload.on("error", async err => { console.log("Audio Get Error " + videoId) })
                                audioDownload.pipe(fs.createWriteStream("cache/YouTubeDownloadingAudio/" + videoId + ".mp3"))
                                audioDownload.on("end", () => {
                                    if (!fs.existsSync("cache/YTDl")) fs.mkdirSync("cache/YTDl")
                                    fs.createReadStream("cache/YouTubeDownloadingAudio/" + videoId + ".mp3")
                                        .pipe(fs.createWriteStream("cache/YTDl/" + videoId + ".mp3"))
                                })
                            }
                        })
                        videoinfos.push(dtbs.ytdlRawInfoData[videoId])
                    } else {
                        videoinfos.push({ error: "不明" })
                    }
                }
                res.end(JSON.stringify(videoinfos))
            })
            break
        }
        /**
         * アプリ情報をjsonで送信します。
         */
        case "/applcation-info": {
            res.header("Content-Type", "text/plain;charset=utf-8")
            const Apps = [
                {
                    "name": "YouTube Downloader",
                    "id": "youtubedownloader",
                    "compact": "ytdl",
                    "iconURL": "",
                    "status": {
                        "loaded": false,
                        "viewed": false
                    }
                },
                {
                    "name": "Discord Bot",
                    "id": "discordbot",
                    "compact": "ggbot",
                    "iconURL": "",
                    "status": {
                        "loaded": false,
                        "viewed": false
                    }
                },
                {
                    "name": "FFmpeg Converter",
                    "id": "ffmpegconverter",
                    "compact": "ffcvr",
                    "iconURL": "",
                    "status": {
                        "loaded": false,
                        "viewed": false
                    }
                },
                {
                    "name": "JSON Data Server",
                    "id": "jsondataserver",
                    "compact": "jsonds",
                    "iconURL": "",
                    "status": {
                        "loaded": false,
                        "viewed": false
                    }
                }
            ]
            res.end(JSON.stringify(Apps))
            break
        }
        case "/ytvideo-list": {
            res.header("Content-Type", "text/plain;charset=utf-8")
            const videoIds = arrayRamdom(Object.keys(dtbs.youtubedata))
            res.end(JSON.stringify(videoIds))
            break
        }
        case "/ytdlRawInfoData": {
            let data = ""
            req.on("data", chunk => data += chunk)
            req.on("end", () => {
                const { videoId, request } = JSON.parse(data)
                res.header("Content-Type", "text/plain;charset=utf-8")
                const details = dtbs.ytdlRawInfoData[videoId]
                if (!details) return res.end("不明")
                const text = JSON.stringify(details[request])
                res.end(text || "不明")
            })
            break
        }
    }
})
const ytIndexCreate = videoId => {
    if (!dtbs.youtubedata) dtbs.youtubedata = {}
    if (!dtbs.youtubedata[videoId]) console.log("YouTubeInfoIndex Created: " + videoId)
    else console.log("YouTubeInfoIndex Rebuilded: " + videoId)
    dtbs.youtubedata[videoId] = ""
}
const ytIndexReBuild = () => {
    const videoIds = Object.keys(dtbs.ytdlRawInfoData)
    let i = 0
    const timefor = setInterval(() => {
        i++
        if (i == videoIds.length) {
            clearInterval(timefor)
            saveingJson()
            return
        }
        ytIndexCreate(videoIds[i])
    }, 10);
}

const saveingJson = () => fs.writeFileSync("data.json", JSON.stringify(dtbs))
const Discord_JS = () => {
    const client = new Client({
        partials: [
            Partials.Channel,
            Partials.GuildMember,
            Partials.GuildScheduledEvent,
            Partials.Message,
            Partials.Reaction,
            Partials.ThreadMember,
            Partials.User
        ],
        intents: [
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildScheduledEvents,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent
        ]
    })
    client.on("ready", () => {
        console.log(client.user.username + "の準備が完了しました！")
    })
    client.on("messageCreate", message => {
        for (let for0 = 0; dtbs.replys.length != for0; for0++) {
            for (let for1 = 0; dtbs.replys[for0].input.length != for1; for1++) {
                if (message.content.match(dtbs.replys[for0].input[for1])) {
                    message.channel.send(dtbs.replys[for0].output[Math.floor(Math.random() * dtbs.replys[for0].output.length)])
                }
            }
        }
    })
    client.login(process.env.token)
}