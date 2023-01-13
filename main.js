(async () => {
    const express = require("express")
    const readline = require("readline")
    const fs = require("fs")
    const ffmpeg = require("fluent-ffmpeg")
    const http = require("http")
    const request = require("request")
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
    const ytVideoIdToAuthorInfoGet = require("./modules/ytVideoIdToAuthorInfoGet").ytVideoIdToAuthorInfoGet
    const ytVAMargeConvert = require("./modules/ytVAMargeConvert").ytVAMargeConvert
    const wait = util.promisify(setTimeout)
    /**
     * データを格納しています。
     * このjson内を操作する際は、プログラムを終了してから変更を加えてください。
     */
    const dtbs = require("./data.json")
    const savePass = require("./dataPass.json").default
    if (!fs.existsSync("data.json")) fs.writeFileSync("data.json", "{}")
    //----ここから初期化ラインです----
    if (!dtbs.ytdlRawInfoData) dtbs.ytdlRawInfoData = {}
    if (!dtbs.ytchRawInfoData) dtbs.ytchRawInfoData = {}
    if (!dtbs.ytIndex) dtbs.ytIndex = {}

    if (!fs.existsSync(".env")) fs.writeFileSync(".env", "TOKEN=")
    if (!fs.existsSync(savePass + "cache/")) fs.mkdirSync(savePass + "cache")
    if (!fs.existsSync(savePass + "cache/YTDL")) fs.mkdirSync(savePass + "cache/YTDL")
    if (!fs.existsSync(savePass + "cache/YouTubeDownloadingVideo")) fs.mkdirSync(savePass + "cache/YouTubeDownloadingVideo")
    if (!fs.existsSync(savePass + "cache/YouTubeDownloadingAudio")) fs.mkdirSync(savePass + "cache/YouTubeDownloadingAudio")
    if (!fs.existsSync(savePass + "cache/YouTubeThumbnail")) fs.mkdirSync(savePass + "cache/YouTubeThumbnail")
    if (!fs.existsSync(savePass + "cache/YouTubeThumbnailRatioResize")) fs.mkdirSync(savePass + "cache/YouTubeThumbnailRatioResize")
    if (!fs.existsSync(savePass + "cache/YouTubeAuthorIcon")) fs.mkdirSync(savePass + "cache/YouTubeAuthorIcon")
    if (!fs.existsSync(savePass + "cache/YouTubeAuthorIconRatioResize")) fs.mkdirSync(savePass + "cache/YouTubeAuthorIconRatioResize")
    if (!fs.existsSync(savePass + "cache/YTDLConverting")) fs.mkdirSync(savePass + "cache/YTDLConverting")
    if (!fs.existsSync(savePass + "cache/YTDLConvert")) fs.mkdirSync(savePass + "cache/YTDLConvert")
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

        } else if (req.url == "/sources/flmv/" || req.url == "/sources/flmv/index.html") { //ルートt (ry
            res.header("Content-Type", "text/html;charset=utf-8")
            res.end(fs.readFileSync("sources/flmv/index.html"))

        } else if (req.url == "/sources/vd/" || req.url == "/sources/vd/index.html") { //ルートt (ry
            res.header("Content-Type", "text/html;charset=utf-8")
            res.end(fs.readFileSync("sources/vd/index.html"))

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
            let thumbnailpath = savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg"
            if (param.ratio && param.size)
                thumbnailpath = savePass + "cache/YouTubeThumbnailRatioResize/" + videoId + "-r" + param.ratio + "-" + param.size + ".jpg"

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
            let thumbnailpath = savePass + "cache/YouTubeAuthorIcon/" + channelId + ".jpg"
            if (param.ratio && param.size)
                thumbnailpath = savePass + "cache/YouTubeAuthorIconRatioResize/" + channelId + "-r" + param.ratio + "-" + param.size + ".jpg"

            //これはVideoIDが有効かつ画像がうまく取得出来なかった際に使用するif文です
            if (dtbs.ytchRawInfoData[channelId]) //データが存在したら
                if (!fs.existsSync(thumbnailpath)) //画像が存在してい無かったら
                    await ytAuthorIconGet(channelId, { ratio: param.ratio, size: param.size })  //画像を取得する
            if (fs.existsSync(thumbnailpath)) { //上のifを遠し、画像が存在したら
                res.header("Content-Type", "image/jpeg")
                res.end(fs.readFileSync(thumbnailpath)) //返答
            } else {//上のifを通しても存在しない場合は400
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytvideo\/*/)) { //YouTube動画にアクセスする
            const videoId = String(req.url).split("/ytvideo/")[1] //urlから情報を取得
            const videopath = savePass + "cache/YTDL/" + videoId + ".mp4" //パス
            if (dtbs.ytdlRawInfoData[videoId]) //データが存在したら
                if (!fs.existsSync(videopath)) {
                    await ytVideoGet(videoId)
                }
            if (fs.existsSync(videopath)) //動画が存在したら
                VASourceGet(videopath, req.headers.range, "video/mp4", res) //動画を送信
            else { //存在しない場合400
                console.log("あれっ...動画は...？")
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytDownload\/*/)) { //YouTube動画にアクセスする
            const info = String(req.url).split("/ytDownload/")[1].split("?") //urlから情報を取得
            const videoId = info[0] //urlから情報を取得
            let param = {}
            try {
                param = querystring.parse(info[1]) //パラメータを取得
            } catch (e) { }
            const videopath = savePass + "cache/YTDLConvert/" + videoId + ((param.type == "1") ? ".webm" : ".mp4") //パス
            if (dtbs.ytdlRawInfoData[videoId]) //データが存在したら
                if (!fs.existsSync(videopath)) {
                    await ytVAMargeConvert(videoId, param.type ? Number(param.type) : 0)
                }
            if (fs.existsSync(videopath)) { //動画が存在したら
                /**
                 * @type {string}
                 */
                const title = dtbs.ytdlRawInfoData[videoId].title
                const filename = ((title.length > 75) ? title.substring(0, 75) : title) + ((param.type == "1") ? ".webm" : ".mp4")
                res.download(videopath, filename)
            }
            else { //存在しない場合400
                console.log("あれっ...動画は...？")
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytaudio\/*/)) { //YouTube音声にアクセスする
            const videoId = String(req.url).split("/ytaudio/")[1] //urlから情報を取得
            const audiopath = savePass + "cache/YTDL/" + videoId + ".opus" //パス
            if (dtbs.ytdlRawInfoData[videoId]) //データが存在したら
                if (!fs.existsSync(audiopath)) //音声が存在してい無かったら
                    await ytAudioGet(videoId)  //音声を取得する
            if (fs.existsSync(audiopath)) //音声が存在したら
                VASourceGet(audiopath, req.headers.range, "audio/opus", res) //音声を送信
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
        if (req.url == "/youtube-videoId") {
            //YouTube動画の情報を保存します。
            let data = ""
            req.on("data", chunk => data += chunk)
            req.on("end", async () => {
                let videoId = data //VideoIDとなるもの
                if (videoId) { //""や空のvideoIdで無ければ続行
                    const ytdlURL = ytdl.validateURL(videoId) //URLであるかどうか
                    const ytdlID = ytdl.validateID(videoId) //IDであるかどうか
                    if (ytdlURL) videoId = ytdl.getVideoID(videoId) //URLからVideoIDを取得
                    if (!ytdlID && !ytdlURL) { //どちらも違う場合
                        console.log("リンクデータ無し:" + videoId) //該当しないデータを表示
                        const data = await yts({ query: videoId }) //検索
                        if (data.videos[0]) videoId = data.videos[0].videoId //検索から取得する
                    }
                    await new Promise(resolve => request.get({ //リクエスト
                        url: videoId,
                        headers: {
                            "content-type": "text/plain"
                        }
                    }, resolve)).then(async error => {
                        /**
                         * このif処理でyoutubeリンクでも無く文字列でもない際に
                         * 下のコードがスキップされるようにコードを組んで居ます
                         */
                        if (error) {
                            console.log(videoId, data)
                            const exisytdl = dtbs.ytdlRawInfoData[videoId] //ただ存在を確認するためだけなので、ね？
                            if (!exisytdl) //rawデータにvideoIdのデータが無い場合
                                dtbs.ytdlRawInfoData[videoId] = await ytVideoInfoGet(videoId, dtbs.ytdlRawInfoData) //情報を取得
                            const authorId = dtbs.ytdlRawInfoData[videoId].author.id //ChannelIDを取得
                            const exisytch = dtbs.ytchRawInfoData[authorId] //ただ存在を確認するd(ry
                            if (!exisytch) //rawデータにauthorIdのデータが無い場合
                                dtbs.ytchRawInfoData[authorId] = await ytAuthorInfoGet(authorId, dtbs.ytchRawInfoData) //情報を取得
                            if (!exisytdl || !exisytch) { //どちらかが存在しなかったら
                                await saveingJson() //保存
                                dtbs.ytIndex = await ytIndexCreate(videoId, dtbs.ytIndex, dtbs.ytdlRawInfoData[videoId]) //インデックス作成
                            }
                            await ytThumbnailGet(videoId) //サムネを取得
                            await ytAuthorIconGet(authorId) //チャンネルアイコンを取得
                            res.header("Content-Type", "text/plain;charset=utf-8")
                            res.end(videoId)
                            await ytVideoGet(videoId) //動画を取得
                            await ytAudioGet(videoId) //音声を取得
                        }
                    })
                }
            })
        } else if (req.url == "/applcation-info") {
            //アプリ情報をjsonで送信
            res.header("Content-Type", "text/plain;charset=utf-8")
            res.end(JSON.stringify(processJson.Apps))

        } else if (req.url == "/ytvideo-list") {
            //indexから高速でデータを取得するときに使用する
            res.header("Content-Type", "text/plain;charset=utf-8")
            const videoIds = arrayRamdom(Object.keys(dtbs.ytIndex.videoIds))
            res.end(JSON.stringify(videoIds))

        } else if (req.url == "/ytdlRawInfoData") {
            //そのままのデータを指定して取得するときに使用する
            let data = ""
            req.on("data", async chunk => data += chunk)
            req.on("end", async () => {
                const { videoId, request } = JSON.parse(data)
                res.header("Content-Type", "text/plain;charset=utf-8")
                const details = dtbs.ytdlRawInfoData[videoId]
                if (!details) return res.end("不明")
                const text = JSON.stringify(details[request])
                res.end(text || "不明")
            })

        } else if (req.url == "/ytdlRawInfoArray") {
            /**
             * 動画リストのそのままの配列を渡す
             * 最後に取得した動画などを見るときに使います。
             * ただデータを取得したいだけの場合、パフォーマンス低下を防ぐため使わないように
             */
            res.header("Content-Type", "text/plain;charset=utf-8")
            res.end(JSON.stringify(Object.keys(dtbs.ytdlRawInfoData)))

        } else if (req.url.match("/discord-seting")) {
            let data = ""
            req.on("data", async chunk => data += chunk)
            req.on("end", async () => {
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
        await new Promise(resolve => ytIndexRebuild(dtbs.ytdlRawInfoData, dtbs.ytIndex, async ytIndex => {
            dtbs.ytIndex = ytIndex
            saveingJson()
            console.log("再作成完了")
            resolve()
        }))
        dtbs.ytchRawInfoData = await ytVideoIdToAuthorInfoGet(dtbs.ytdlRawInfoData, dtbs.ytchRawInfoData)
        await saveingJson()
        ytVASourceCheck(dtbs.ytIndex)
    }
    startToInfomation(false)
    const saveingJson = async () => {
        fs.writeFileSync("data.json", JSON.stringify(dtbs))
        console.log("JSON保存済み")
    }
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
