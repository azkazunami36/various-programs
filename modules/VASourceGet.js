const fs = require("fs")
/**
 * 動画や音声をスムーズにクライアントに送信する関数です
 * @param {string} videopath パスを入力します
 * @param {string} range リクエストのレンジを入力します
 * @param {string} type Content-Typeに使用します
 * @param res response変数を入力します
 */
module.exports.VASourceGet = async (videopath, range, type, res) => {
    const videoSize = fs.statSync(videopath).size //ファイルサイズ(byte)
    const chunkSize = 1 * 1e7 //チャンクサイズ

    const ranges = String(range).split("-")
    //これは取得するデータ範囲を決定します。
    const options = { start: 0, end: 0 }
    options.start = Number(ranges[0].replace(/\D/g, ""))//始まりの指定
    options.end = Number(ranges[1]) || Math.min(options.start + chunkSize, videoSize - 1) //終わりの指定

    const headers = { //ヘッダー
        "Content-Range": "bytes " + options.start + "-" + options.end + "/" + videoSize,
        "Accept-Ranges": "bytes",
        "Content-Length": String(options.end - options.start + 1),
        "Content-Type": type
    };
    res.writeHead((range) ? 206 : 200, headers) //206を使用すると接続を続行することが出来る
    const Stream = fs.createReadStream(videopath, options) //ストリームにし、範囲のデータを読み込む
    Stream.on("error", error => {
        console.log("Error reading file" + filePath + ".");
        console.log(error);
        res.sendStatus(500);
    });
    Stream.pipe(res) //送信
}
