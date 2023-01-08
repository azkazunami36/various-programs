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
    const chunkSize = videoSize //チャンクサイズ

    //これは取得するデータ範囲を決定します。
    const start = Number(((Number(range) < 0 ? 0 : range) || "0").replace(/\D/g, "")) //始まりの指定
    const end = Math.min(start + chunkSize, videoSize - 1) //終わりの指定

    const headers = { //ヘッダー
        "Content-Range": "bytes " + start + "-" + end + "/" + videoSize,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": type
    };
    res.writeHead(206, headers) //206を使用すると接続を続行することが出来る
    const Stream = fs.createReadStream(videopath, { start: start, end: (end < 0 ? 0 : end) }) //ストリームにし、範囲のデータを読み込む
    Stream.pipe(res) //送信
}
