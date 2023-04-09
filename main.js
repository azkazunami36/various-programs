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
    const { mbyteString } = require("./modules/mbyteString")
    const { timeString } = require("./modules/timeString")
    const { arrayRamdom } = require("./modules/arrayRamdom")
    const { VASourceGet } = require("./modules/VASourceGet")
    const { ytThumbnailGet } = require("./modules/ytThumbnailGet")
    const { ytIndexCreate } = require("./modules/ytIndexCreate")
    const { ytIndexReBuild } = require("./modules/ytIndexRebuild")
    const { ytVASourceCheck } = require("./modules/ytVASourceCheck")
    const { ytAuthorIconGet } = require("./modules/ytAuthorIconGet")
    const { ytVideoInfoGet } = require("./modules/ytVideoInfoGet")
    const { ytAuthorInfoGet } = require("./modules/ytAuthorInfoGet")
    const { ytVideoIdToAuthorInfoGet } = require("./modules/ytVideoIdToAuthorInfoGet")
    const { ytVideoGetErrorMessage } = require("./modules/ytVideoGetErrorMessage")
    const { ytPassGet, sourceExist, youtubedl, passContentTypeGet, deleteSource } = require("./modules/ytPassGet")
    const wait = util.promisify(setTimeout)
    /**
     * データを格納しています。
     * このjson内を操作する際は、プログラムを終了してから変更を加えてください。
     */
    if (!fs.existsSync("data.json")) fs.writeFileSync("data.json", "{}")
    const dtbs = require("./data.json")
    const savePass = require("./dataPass.json").default
    //----ここから初期化ラインです----
    if (!dtbs.ytdlRawInfoData) dtbs.ytdlRawInfoData = {}
    if (!dtbs.ytchRawInfoData) dtbs.ytchRawInfoData = {}
    if (!dtbs.ytIndex) dtbs.ytIndex = { videoIds: {} }
    const folderCreate = pass => {
        if (!fs.existsSync(pass)) fs.mkdirSync(pass)
    }
    if (!fs.existsSync(".env")) fs.writeFileSync(".env", "TOKEN=")
    folderCreate(savePass + "cache/")
    folderCreate(savePass + "cache/YouTubeAuthorIcon")
    folderCreate(savePass + "cache/YouTubeAuthorIconRatioResize")
    folderCreate(savePass + "cache/YouTubeThumbnail")
    folderCreate(savePass + "cache/YouTubeThumbnailRatioResize")
    folderCreate(savePass + "cache/Temp")
    folderCreate(savePass + "cache/YouTubeDL")
    folderCreate(savePass + "cache/YouTubeDLConvert")
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

        } else if (req.url == "/sources/ytdl/clipcreate/" || req.url == "/sources/ytdl/clipcreate/") { //ルートt (ry
            res.header("Content-Type", "text/html;charset=utf-8")
            res.end(fs.readFileSync("sources/ytdl/clipcreate/index.html"))

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
            if (!await sourceExist(videoId, "video")) await youtubedl(videoId, "video")
            const videopath = await sourceExist(videoId, "video") //パス
            if (videopath) //動画が存在したら
                VASourceGet(videopath, req.headers.range, (await passContentTypeGet(videopath)), res) //動画を送信
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
            let type
            switch (Number(param.type)) {
                case 0: type = "mp4"; break
                case 1: type = "webm"; break
                case 2: type = "copy"; break
                default: type = "mp4"; break
            }
            const videopath = await ytPassGet(videoId, type) //パス
            if (videopath) { //動画が存在したら
                /**
                 * @type {string}
                 */
                const title = dtbs.ytdlRawInfoData[videoId].title
                const filename = ((title.length > 75) ? title.substring(0, 75) : title) + "." + type
                const headers = {} //ヘッダー
                headers["Content-Length"] = String(fs.statSync(videopath).size)
                headers["Content-Disposition"] = "attachment; filename=" + encodeURI(filename)
                res.writeHead(200, headers)
                const Stream = fs.createReadStream(videopath)
                Stream.pipe(res)
            }
            else { //存在しない場合400
                console.log("あれっ...動画は...？")
                res.status(400)
                res.end()
            }

        } else if (req.url.match(/\/ytaudio\/*/)) { //YouTube音声にアクセスする
            const videoId = String(req.url).split("/ytaudio/")[1] //urlから情報を取得
            if (!await sourceExist(videoId, "audio")) await youtubedl(videoId, "audio")
            const audiopath = await sourceExist(videoId, "audio") //パス
            if (audiopath) //音声が存在したら
                VASourceGet(audiopath, req.headers.range, (await passContentTypeGet(audiopath)), res) //音声を送信
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
                /**
                 * 入力された文字列からVideoIDを取得します。
                 * @param {string} videoId 
                 * @returns 
                 */
                const videoIdGet = async videoId => {
                    if (!videoId) {
                        console.log("VideoIDを取得するためのデータがありません: " + videoId)
                        return null
                    }
                    const time = Date.now() //経過時間を測ります。
                    const ytdlURL = ytdl.validateURL(videoId) //URLであるかどうか
                    const ytdlID = ytdl.validateID(videoId) //IDであるかどうか
                    if (ytdlURL) videoId = ytdl.getVideoID(videoId) //URLからVideoIDを取得
                    if (!ytdlID && !ytdlURL) { //どちらも存在しない場合
                        if (await new Promise(resolve => request.get({
                            url: videoId,
                            headers: {
                                "content-type": "text/plain"
                            }
                        }, resolve))) {
                            console.log("次の文字列ではVideoIDは見つかりませんでした。: " + videoId) //該当しないデータを表示
                            const data = await yts({ query: videoId }) //検索
                            if (data.videos[0]) videoId = data.videos[0].videoId //検索から取得する
                            else {
                                console.log("検索してもVideoIDは取得できませんでした。: " + videoId)
                                return null
                            }
                        } else {
                            console.log("次の文字列はYouTube以外のリンクです。: " + videoId)
                            return null
                        }
                    }
                    console.log("VideoIDの取得に" + timeString((Date.now() - time) / 1000) + "かかりました。: " + videoId)
                    return videoId
                }
                const videoId = await videoIdGet(data)
                if (videoId) { //""や空のvideoIdで無ければ続行
                    const exisytdl = dtbs.ytdlRawInfoData[videoId] //ただ存在を確認するためだけなので、ね？
                    if (!exisytdl) //rawデータにvideoIdのデータが無い場合
                        dtbs.ytdlRawInfoData[videoId] = await ytVideoInfoGet(videoId, dtbs.ytdlRawInfoData) //情報を取得
                    if (!dtbs.ytdlRawInfoData[videoId]) return res.end()
                    const authorId = dtbs.ytdlRawInfoData[videoId].author.id //ChannelIDを取得
                    const exisytch = dtbs.ytchRawInfoData[authorId] //ただ存在を確認するd(ry
                    if (!exisytch) //rawデータにauthorIdのデータが無い場合
                        dtbs.ytchRawInfoData[authorId] = await ytAuthorInfoGet(authorId, dtbs.ytchRawInfoData) //情報を取得
                    if (!dtbs.ytchRawInfoData[authorId]) return res.end()
                    if (!exisytdl || !exisytch) {
                        await saveingJson() //保存
                        dtbs.ytIndex = await ytIndexCreate(videoId, dtbs.ytIndex, dtbs.ytdlRawInfoData[videoId]) //インデックス作成
                    }
                    await ytThumbnailGet(videoId) //サムネを取得
                    await ytAuthorIconGet(authorId) //チャンネルアイコンを取得
                    res.header("Content-Type", "text/plain;charset=utf-8")
                    res.end(videoId)
                    if (false) {
                        if (await sourceExist(videoId, "video"))
                            await youtubedl(videoId, "video")
                        if (await sourceExist(videoId, "audio"))
                            await youtubedl(videoId, "audio")
                    }
                } else {
                    res.header("Content-Type", "text/plain;charset=utf-8")
                    res.end(videoId)
                }
            })
        } else if (req.url == "/applcation-info") {
            //アプリ情報をjsonで送信
            res.header("Content-Type", "text/plain;charset=utf-8")
            res.end(JSON.stringify(processJson.Apps))

        } else if (req.url == "/ytvideo-list") {
            //indexから高速でデータを取得するときに使用する(現在非推奨)
            res.header("Content-Type", "text/plain;charset=utf-8")
            const videoIds = arrayRamdom(Object.keys(dtbs.ytIndex.videoIds))
            res.end(JSON.stringify(videoIds))

        } else if (req.url == "/ytindex-list") {
            //indexデータを取得する時に使用する
            res.header("Content-Type", "text/plain;charset=utf-8")
            res.end(JSON.stringify(dtbs.ytIndex.videoIds))

        } else if (req.url == "/ytdlRawInfoData") {
            /**
             * VideoIDのデータをそのまま取得する際に使用します。
             */
            let data
            req.on("data", async chunk => {
                if (data) data += chunk
                if (!data) data = chunk
            })
            req.on("end", async () => {
                res.header("Content-Type", "text/plain;charset=utf-8")
                res.end(JSON.stringify(dtbs.ytdlRawInfoData[data]) || "不明")
            })

        } else if (req.url == "/ytdlRawInfoArray") {
            /**
             * 動画リストのそのままの配列を渡す
             * 最後に取得した動画などを見るときに使います。
             * ただデータを取得したいだけの場合、パフォーマンス低下を防ぐため使わないように
             * ytdlRawInfoDataと共に使用すれば、全データを取得することができます。
             */
            res.header("Content-Type", "text/plain;charset=utf-8")
            res.end(JSON.stringify(Object.keys(dtbs.ytdlRawInfoData)))

        } else if (req.url.match("/ytvideo-delete")) {
            /**
             * 一時的な削除指示です。
             * あまり使わないように
             */
            let data
            req.on("data", async chunk => {
                if (data) data += chunk
                if (!data) data = chunk
            })
            req.on("end", async () => {
                console.log("動画の削除: " + data)
                deleteSource(String(data))
                if (dtbs.ytdlRawInfoData[String(data)]) {
                    delete dtbs.ytdlRawInfoData[String(data)]
                    delete dtbs.ytIndex.videoIds[String(data)]
                    saveingJson()
                    console.log(dtbs.ytdlRawInfoData[String(data)])
                }
                res.end()
            })
        } else if (req.url.match("/discord-seting")) {
            let data = ""
            req.on("data", async chunk => data += chunk)
            req.on("end", async () => {
                const request = JSON.parse(data)
                if (request.token) {
                    procData.discordBot[request.token] = {}
                    const proc = procData.discordBot[request.token]
                    if (request.init) {
                        proc.client = new Client({
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
                        client.on(Events.MessageCreate, message => {

                        })
                    }
                    /**
                     * @type {Client}
                     */
                    const client = proc.client
                    if (request.login) client.login(request.token)
                }
            })
        } else if (req.url.match("/discord-statusGet")) {
        } else if (false) {
        } else if (false) {
        } else if (false) {
        } else if (false) {
        } else {
            res.status(404)
            res.end()
        }
    })
    const startToInfomation = async start => {
        if (!start) return
        dtbs.ytIndex = await ytIndexReBuild(dtbs.ytdlRawInfoData, dtbs.ytIndex)
        dtbs.ytchRawInfoData = await ytVideoIdToAuthorInfoGet(dtbs.ytdlRawInfoData, dtbs.ytchRawInfoData)
        await saveingJson()
        await ytVASourceCheck(dtbs.ytIndex)
    }
    startToInfomation(true)
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
