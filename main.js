(async () => {
    const express = require("express")
    const readline = require("readline")
    const fs = require("fs")
    const ffmpeg = require("fluent-ffmpeg")
    const cors = require("cors")
    const ytdl = require("ytdl-core")
    const yts = require("yt-search")
    const ytch = require("yt-channel-info")
    const querystring = require("querystring")
    const axios = require("axios")
    const uuid = require("uuid")
    const path = require("path")
    const util = require("util")
    const sharp = require("sharp")
    const imageSize = require("image-size")
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
    const VASourceGet = require("./modules/VASourceGet").VASourceGet
    const ytThumbnailGet = require("./modules/ytThumbnailGet").ytThumbnailGet
    const ytVideoGet = require("./modules/ytVideoGet").ytVideoGet
    const ytAudioGet = require("./modules/ytAudioGet").ytAudioGet
    const ytIndexCreate = require("./modules/ytIndexCreate").ytIndexCreate
    const ytIndexRebuild = require("./modules/ytIndexRebuild").ytIndexReBuild
    const ytVASourceCheck = require("./modules/ytVASourceCheck").ytVASourceCheck
    const ytAuthorIconGet = require("./modules/ytAuthorIconGet").ytAuthorIconGet
    const ytVideoInfoGet = require("./modules/ytVideoInfoGet").ytVideoInfoGet
    const ytAuthorInfoGet = require("./modules/ytAuthorInfoGet").ytAuthorInfoGet
    const wait = util.promisify(setTimeout)
    /**
     * データを格納しています。
     * このjson内を操作する際は、プログラムを終了してから変更を加えてください。
     */
    const dtbs = require("./data.json")
    if (!fs.existsSync("data.json")) fs.writeFileSync("data.json", "{}")
    //----ここから初期化ラインです----
    if (!dtbs.ytdlRawInfoData) dtbs.ytdlRawInfoData = {}
    if (!dtbs.ytchRawInfoData) dtbs.ytchRawInfoData = {}
    if (!dtbs.ytIndex) dtbs.ytIndex = {}

    if (!fs.existsSync(".env")) fs.writeFileSync(".env", "TOKEN=")
    if (!fs.existsSync("cache/")) fs.mkdirSync("cache")
    if (!fs.existsSync("cache/YTDL")) fs.mkdirSync("cache/YTDL")
    if (!fs.existsSync("cache/YouTubeDownloadingVideo")) fs.mkdirSync("cache/YouTubeDownloadingVideo")
    if (!fs.existsSync("cache/YouTubeDownloadingAudio")) fs.mkdirSync("cache/YouTubeDownloadingAudio")
    if (!fs.existsSync("cache/YouTubeThumbnail")) fs.mkdirSync("cache/YouTubeThumbnail")
    if (!fs.existsSync("cache/YouTubeThumbnailRatioResize")) fs.mkdirSync("cache/YouTubeThumbnailRatioResize")
    if (!fs.existsSync("cache/YouTubeAuthorIcon")) fs.mkdirSync("cache/YouTubeAuthorIcon")
    if (!fs.existsSync("cache/YouTubeAuthorIconRatioResize")) fs.mkdirSync("cache/YouTubeAuthorIconRatioResize")
    //-----------ここまで------------
    require("dotenv").config()
    const processJson = require("./processJson.json")
    const procData = {}
    const app = express()
    /**
     * 使用するポート番号を決定します。
     * env内にポートが設定されている場合、それを使用します。
     */
    const port = parseInt(process.env.PORT || "81", 10)
    app.listen(port, async () => {
        let address = "http://localhost"
        if (port != "80") address += ":" + port //Webではポート80がデフォルトなため、省略としてif
        console.info("ポート" + port + "でWebを公開しました！ " + address + " にアクセスして、操作を開始します！")
    })
    app.use(cors())
    app.get("*", async (req, res) => {
        console.log("Get :", req.url) //URL確認
        if (req.url == "/" || req.url == "/sources/index.html") { //ルートとindex.htmlが取得できる
            res.header("Content-Type", "text/html;charset=utf-8")
            res.end(fs.readFileSync("sources/index.html"))

        } else if (req.url == "/sources/ytdl/" || req.url == "/sources/ytdl/index.html") { //ルートとind (ry
            res.header("Content-Type", "text/html;charset=utf-8")
            res.end(fs.readFileSync("sources/ytdl/index.html"))

        } else if (req.url == "/sources/ggbot/" || req.url == "/sources/ggbot/index.html") { //ルートt (ry
            res.header("Content-Type", "text/html;charset=utf-8")
            res.end(fs.readFileSync("sources/ggbot/index.html"))

        } else if (req.url.match("/sources/ytdl/watch?")) {
            //watchというリンクは少々特殊なため、matchで検出し返答します
            res.header("Content-Type", "text/html;charset=utf-8")
            res.end(fs.readFileSync("sources/ytdl/playwith/index.html"))

        } else if (req.url == "/favicon.ico") { //faviconまだ準備してないので204
            res.status(204)
            res.end()

        } else if (req.url.match(/\/sources\/*/)) { //ソースフォルダへ直接アクセス
            //sourcesパスとクエリを切り取ってファイルパスを取得
            const filelink = "sources/" + String(req.url).split("/sources/")[1].split("?")[0]
            console.log(filelink) //表示
            if (fs.existsSync(filelink)) {
                try {
                    res.header("Content-Type", "text/plain;charset=utf-8")
                    const file = fs.readFileSync(filelink)
                    res.end(file)
                } catch (e) { //指定したファイルが何故か取得出来ない時は404
                    console.log(e)
                    res.status(404)
                    res.end()
                }
            } else { //ファイルが見つからない時は400
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/modules\/*/)) { //モジュールへ直接アクセス
            //modules/パスとクエリを切り取ってファイルパスを取得
            const filelink = "modules/" + (String(req.url).split("/modules/")[1])
            console.log(filelink) //表示
            if (fs.existsSync(filelink)) {
                try {
                    res.header("Content-Type", "text/javascript;charset=utf-8")
                    const file = fs.readFileSync(filelink)
                    res.end(file)
                } catch (e) { //指定したファイルが何故か取得出来ない時は404
                    console.log(e)
                    res.status(404)
                    res.end()
                }
            } else { //ファイルが存在しない場合400
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytimage\/*/)) { //YouTubeサムネイルにアクセスする
            await wait(Math.floor(Math.random() * 450) + 50) //安定のため応答にラグを作る
            const info = String(req.url).split("/ytimage/")[1].split("?") //urlから情報を取得
            const videoId = info[0] //urlからVideoIDを取得
            let param = {}
            try {
                param = querystring.parse(info[1]) //パラメータを取得
            } catch (e) { }
            let thumbnailpath = "cache/YouTubeThumbnail/" + videoId + ".jpg"
            if (param.ratio && param.size)
                thumbnailpath = "cache/YouTubeThumbnailRatioResize/" + videoId + "-r" + param.ratio + "-" + param.size + ".jpg"

            //これはVideoIDが有効かつ画像がうまく取得出来なかった際に使用するif文です
            if (dtbs.ytdlRawInfoData[videoId]) //データが存在したら
                if (!fs.existsSync(thumbnailpath)) //画像が存在してい無かったら
                    await ytThumbnailGet(videoId, { ratio: param.ratio, size: param.size })  //画像を取得する
            if (fs.existsSync(thumbnailpath)) { //上のifを遠し、画像が存在したら
                res.header("Content-Type", "image/jpeg")
                res.end(fs.readFileSync(thumbnailpath)) //返答
            } else { //上のifを通しても存在しない場合は400
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytauthorimage\/*/)) { //YouTubeサムネイルにアクセスする
            await wait(Math.floor(Math.random() * 450) + 50) //安定のため応答にラグを作る
            const info = String(req.url).split("/ytauthorimage/")[1].split("?") //urlから情報を取得
            const channelId = info[0] //urlからVideoIDを取得
            let param = {}
            try {
                param = querystring.parse(info[1]) //パラメータを取得
            } catch (e) { }
            let thumbnailpath = "cache/YouTubeAuthorIcon/" + channelId + ".jpg"
            if (param.ratio && param.size)
                thumbnailpath = "cache/YouTubeAuthorIconRatioResize/" + channelId + "-r" + param.ratio + "-" + param.size + ".jpg"

            //これはVideoIDが有効かつ画像がうまく取得出来なかった際に使用するif文です
            if (dtbs.ytchRawInfoData[channelId]) //データが存在したら
                if (!fs.existsSync(thumbnailpath)) //画像が存在してい無かったら
                    await ytAuthorIconGet(channelId, { ratio: param.ratio, size: param.size })  //画像を取得する
            if (fs.existsSync(thumbnailpath)) { //上のifを遠し、画像が存在したら
                res.header("Content-Type", "image/jpeg")
                res.end(fs.readFileSync(thumbnailpath)) //返答
            } else { //上のifを通しても存在しない場合は400
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytvideo\/*/)) { //YouTube動画にアクセスする
            const videoId = String(req.url).split("/ytvideo/")[1] //urlから情報を取得
            const videopath = "cache/YTDL/" + videoId + ".mp4" //パス
            if (dtbs.ytdlRawInfoData[videoId]) //データが存在したら
                if (!fs.existsSync(videopath)) //動画が存在してい無かったら
                    await ytVideoGet(videoId)  //動画を取得する
            if (fs.existsSync(videopath)) //動画が存在したら
                VASourceGet(videopath, req.headers.range, "video/mp4", res) //動画を送信
            else { //存在しない場合400
                console.log("あれっ...動画は...？")
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytaudio\/*/)) { //YouTube音声にアクセスする
            const videoId = String(req.url).split("/ytaudio/")[1] //urlから情報を取得
            const audiopath = "cache/YTDL/" + videoId + ".mp3" //パス
            if (dtbs.ytdlRawInfoData[videoId]) //データが存在したら
                if (!fs.existsSync(audiopath)) //音声が存在してい無かったら
                    await ytAudioGet(videoId)  //音声を取得する
            if (fs.existsSync(audiopath)) //音声が存在したら
                VASourceGet(audiopath, req.headers.range, "audio/mp3", res) //音声を送信
            else { //存在しない場合400
                console.log("あれっ...音声は...？")
                res.status(400)
                res.end()
            }
        } else if (false) {
        } else if (false) {
        } else if (false) {
        } else if (false) {
        } else if (false) {
        } else if (false) { //falseで空のif
        } else { //どのパスも一致しない場合は製作の想定外なので404
            console.log("404 : " + req.url)
            res.status(404)
            res.end()
        }
    })
    app.post("*", async (req, res) => {
        console.log("Post:", req.url)
        if (req.url == "/youtube-info") { //YouTube動画の情報を保存します。
            let data = ""
            req.on("data", async chunk => data += chunk)
            req.on("end", async () => {
                const videolist = JSON.parse(data) //VideoIDかURLの入った配列を取得
                const videoIds = [] //VideoIDの配列をクライアントに返すため
                console.log(videolist)
                for (let i = 0; i != videolist.length; i++) { //VideoIDかURLの数だけ実行
                    let videoId = videolist[i] //VideoIDとなるもの
                    if (ytdl.validateURL(videoId) || ytdl.validateID(videoId)) {
                        if (ytdl.validateURL(videoId)) videoId = ytdl.getVideoID(videoId) //URLからVideoIDを取得
                    } else {
                        const data = await yts({ query: videolist[i] })
                        let video
                        if (data.videos[0]) video = data.videos[0]
                        else return videoIds.push("こんなやつなかったな")
                        videoId = video.videoId
                    }
                    const data = await yts({ query: videolist[i] })
                    let video
                    if (data.videos[0]) videoId = data.videos[0].videoId
                    else return videoIds.push("こんなやつなかったな")
                    console.log(videoId)
                    dtbs.ytdlRawInfoData[videoId] = await ytVideoInfoGet(videoId, dtbs.ytdlRawInfoData)
                    const authorId = dtbs.ytdlRawInfoData[videoId].author.id
                    dtbs.ytchRawInfoData[authorId] = await ytAuthorInfoGet(authorId, dtbs.ytchRawInfoData)
                    saveingJson() //保存
                    dtbs.ytIndex = await ytIndexCreate(videoId, dtbs.ytIndex) //インデックス作成
                    videoIds.push(videoId) //IDをプッシュ
                    await ytThumbnailGet(videoId) //サムネを取得
                    await ytAuthorIconGet(authorId)
                }
                console.log(videoIds)
                res.header("Content-Type", "text/plaincharset=utf-8")
                res.end(JSON.stringify(videoIds))
                for (let i = 0; i != videoIds.length; i++) {
                    ytVideoGet(videoIds[i]) //動画を取得
                    ytAudioGet(videoIds[i]) //音声を取得
                }
            })
        } else if (req.url == "/applcation-info") { //アプリ情報をjsonで送信
            res.header("Content-Type", "text/plain;charset=utf-8")
            res.end(JSON.stringify(processJson.Apps))

        } else if (req.url == "/ytvideo-list") {
            res.header("Content-Type", "text/plain;charset=utf-8")
            const videoIds = arrayRamdom(Object.keys(dtbs.ytIndex.videoIds))
            res.end(JSON.stringify(videoIds))

        } else if (req.url == "/ytdlRawInfoData") {
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
        } else if (req.url.match("/discord-seting")) {
            let data = ""
            req.on("data", chunk => data += chunk)
            req.on("end", () => {
                const request = JSON.parse(data)
                if (request.token) {
                    procData.discordBot[request.token] = {}
                    const proc = procData.discordBot[request.token]
                    if (request.init) proc.client = new Client({
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
                    /**
                     * @type {Client}
                     */
                    const client = proc.client
                    if (request.login) client.login(request.token)
                }
            })
        } else if (req.url.match("/discord-statusGet")) {
        } else if (false) {
        } else {
            res.status(404)
            res.end()
        }
    })
    const startToInfomation = async start => {
        if (!start) return
        ytIndexRebuild(dtbs.ytdlRawInfoData, dtbs.ytIndex, async ytIndex => {
            dtbs.ytIndex = ytIndex
            saveingJson()
            console.log("再作成完了")
        })
        ytVASourceCheck(dtbs.ytIndex)
    }
    startToInfomation(false)
    const saveingJson = async () => fs.writeFileSync("data.json", JSON.stringify(dtbs))
    const Discord_JS = async () => {
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
})()