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
     * Discord.jsを実行するために使用する。
     */
    const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
    /**
     * Discord.jsに関連して使用できるVoiceを利用する際に使用する。
     */
    const { entersState, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType, AudioPlayerStatus } = require("@discordjs/voice"); //Discord.jsVoice
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
     * データを格納しています。
     * このjson内を操作する際は、プログラムを終了してから変更を加えてください。
     */
    const dbs = JSON.parse(fs.readFileSync("data.json"));
    /**
     * Appです(？)
     */
    const app = express();
    /**
     * ポートを割り当てる。
     * env内にPORT情報が乗っている場合、そちらを使用する。
     */
    const port = parseInt(process.env.PORT || "81", 10);
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
        console.log(req.url)
        switch (req.url) {
            case "/": {
                res.header("Content-Type", "text/html;charset=utf-8");
                res.end(fs.readFileSync("sources/index.html"));
            }
            case "/index.html": {
                break;
            }
            case "/index.js": {
                res.header("Content-Type", "text/plain;charset=utf-8");
                res.end(fs.readFileSync("sources/index.js"));
                break;
            }
            case "/stylesheet.css": {
                res.header("Content-Type", "text/plain;charset=utf-8");
                res.end(fs.readFileSync("sources/stylesheet.css"));
                break;
            }
        }
    });
    app.post("*", async (req, res) => {

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
        for (let for0 = 0; dbs.replys.length != for0; for0++) {
            for (let for1 = 0; dbs.replys[for0].input.length != for1; for1++) {
                if (message.content.match(dbs.replys[for0].input[for1])) {
                    message.channel.send(dbs.replys[for0].output[Math.floor(Math.random() * dbs.replys[for0].output.length)]);
                };
            };
        };
    });
    client.login(process.env.token);
};