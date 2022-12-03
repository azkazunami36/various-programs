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
            res.header("Content-Type", "text/html;charset=utf-8");
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