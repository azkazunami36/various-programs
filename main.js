/**
 * GET、POSTを使用する。
 */
const express = require("express");
/**
 * コンソールの詳細な表示のために使用する。
 */
const readline = require("readline");
/**
 * ファイルの読み書きに使用する。
 */
const fs = require("fs");
/**
 * FFmpegで動画を変換するために使用する。
 */
const ffmpeg = require("fluent-ffmpeg");
/**
 * なんで使うかを忘れた。
 */
const cors = require("cors");
/**
 * YouTubeの動画データ等を入手する際に使用する。
 */
const ytdl = require("ytdl-core");
/**
 * ネットなどで使用するクエリをjsonに変換する際に使用
 * url=http... = {"url": "http..."}
 */
const querystring = require("querystring");
/**
 * 主にデータを取得する際に使用する。
 * 予定ではYouTubeのサムネイルを取得する。
 */
const axios = require("axios");
/**
 * Discord.jsを実行するために使用する。
 */
const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder
} = require("discord.js");
/**
 * Discord.jsに関連して使用できるVoiceを利用する際に使用する。
 */
const {
    entersState,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    AudioPlayerStatus
} = require("@discordjs/voice"); //Discord.jsVoice
/**
 * envファイルを生成します。
 * 既に存在している場合、このコードはスキップされます。
 */
if (!fs.existsSync(".env")) fs.writeFileSync(".env", "TOKEN=");
/**
 * envファイルからデータを読み込み、process.envに格納します。
 */
require("dotenv").config();
/**
 * 最初にjsonファイルを生成します。
 * 既に存在している場合、このコードはスキップされます。
 */
if (!fs.existsSync("data.json")) fs.writeFileSync("data.json", "{}");
/**
 * cacheフォルダを生成します。
 * 既に存在している場合。このコードはスキップされます。
 */
if (!fs.existsSync("cache/")) fs.mkdirSync("cache");
/**
 * データを格納しています。
 * このjson内を操作する際は、プログラムを終了してから変更を加えてください。
 */
const dtbs = require("./data.json");
/**
 * Appです(？)
 */
const app = express();
/**
 * ポートを割り当てる。
 * env内にPORT情報が乗っている場合、そちらを使用する。
 */
const port = parseInt(process.env.PORT || "80", 10);
/**
 * 使用するポートを設定する。
 */
app.listen(port, async () => {
    let address = "http://localhost";
    if (port != "80") address += ":" + port;
    console.info("ポート" + port + "でWebを公開しました！ " + address + " にアクセスして、操作を開始します！");
});
/**
 * なんでこれを使うかを忘れた。
 */
app.use(cors());
/**
 * GET、POSTのデータをすべてここで受信する。
 * GET、POSTのパス等はif等で判断する。
 */
app.get("*", async (req, res) => {
    console.log("Get :", req.url);
    if (req.url == "/" || req.url == "/sources/index.html") {
        res.header("Content-Type", "text/html;charset=utf-8");
        res.end(fs.readFileSync("sources/index.html"));
    } else if (req.url == "/sources/ytdl/" || req.url == "/sources/ytdl/index.html") {
        res.header("Content-Type", "text/html;charset=utf-8");
        res.end(fs.readFileSync("sources/ytdl/index.html"));
    } else if (req.url == "/favicon.ico") {
        res.status(204);
        res.end();
    } else if (req.url.match(/\/sources\/*/)) {
        const filelink = "sources/" + String(req.url).split("/sources/")[1];
        if (fs.existsSync(filelink)) {
            try {
                res.header("Content-Type", "text/plain;charset=utf-8");
                const file = fs.readFileSync(filelink);
                res.end(file);
            } catch (e) { res.status(404); res.end(); }
        } else {
            res.status(400);
            res.end();
        };
    } else if (req.url.match(/\/ytimage\/*/)) {
        const videoid = String(req.url).split("/ytimage/")[1];
        res.header("Content-Type", "image/jpeg");
    } else if (false) {
    } else if (false) {
    } else {
        console.log("404 : " + req.url)
        res.status(404);
        res.end();
    };
});
app.post("*", async (req, res) => {
    console.log("Post:", req.url);
    switch (req.url) {
        /**
         * YouTube動画の情報を取得し保存します。
         * クライアントにもRawデータを送信はしますが、用途は不明です。
         */
        case "/youtube-info": {
            let data = "";
            req.on("data", async chunk => data += chunk);
            req.on("end", async () => {
                console.log(data);
                let VID = data;
                res.header("Content-Type", "text/plain;charset=utf-8");
                if (ytdl.validateURL(data) || ytdl.validateID(data)) {
                    if (ytdl.validateURL(VID)) VID = ytdl.getVideoID(VID);
                    console.log(VID)
                    if (!dtbs.ytdlRawInfoData) dtbs.ytdlRawInfoData = {};
                    if (!dtbs.ytdlRawInfoData[VID]) await ytdl.getInfo(VID).then(async info => {
                        dtbs.ytdlRawInfoData[VID] = info.videoDetails;
                        const thumbnails = info.videoDetails.thumbnails;
                        const imagedata = await axios.get(thumbnails[thumbnails.length - 1].url, { responseType: "arraybuffer" });
                        if (!fs.existsSync("cache/YouTubeThumbnail")) fs.mkdirSync("cache/YouTubeThumbnail");
                        fs.writeFileSync("cache/YouTubeThumbnail/" + VID + ".jpg", new Buffer.from(imagedata.data), "binary");
                    });
                    res.end(JSON.stringify(dtbs.ytdlRawInfoData[VID]));
                } else {
                    res.end(JSON.stringify({ error: "不明" }));
                };
            });
            break;
        }
        /**
         * アプリ情報をjsonで送信します。
         */
        case "/applcation-info": {
            res.header("Content-Type", "text/plain;charset=utf-8");
            res.end(JSON.stringify(dtbs.Apps));
            break;
        }
    }
});
/**
 * Discord.js実行用関数
 */
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
    });
    client.on("ready", () => {
        console.log(client.user.username + "の準備が完了しました！");
    });
    client.on("messageCreate", message => {
        for (let for0 = 0; dtbs.replys.length != for0; for0++) {
            for (let for1 = 0; dtbs.replys[for0].input.length != for1; for1++) {
                if (message.content.match(dtbs.replys[for0].input[for1])) {
                    message.channel.send(dtbs.replys[for0].output[Math.floor(Math.random() * dtbs.replys[for0].output.length)]);
                };
            };
        };
    });
    client.login(process.env.token);
};