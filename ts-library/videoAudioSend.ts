import fs from "fs"

/**
 * 動画や音声をスムーズにクライアントに送信する関数です
 * @param videopath パスを入力します
 * @param range リクエストのレンジを入力します
 * @param type Content-Typeに使用します
 * @param res response変数を入力します
 */
async function videoAudioSend(videopath: string, range: string, type: string, res: any) {
    const videoSize = fs.statSync(videopath).size //ファイルサイズ(byte)
    const chunkSize = 1 * 1e7 //チャンクサイズ

    const ranges = String(range).split("-")
    if (ranges[0]) ranges[0] = ranges[0].replace(/\D/g, "")
    if (ranges[1]) ranges[1] = ranges[1].replace(/\D/g, "")
    //これは取得するデータ範囲を決定します。
    const options = { start: 0, end: 0 }
    options.start = Number(ranges[0]) //始まりの指定
    options.end = Number(ranges[1]) || Math.min(options.start + chunkSize, videoSize - 1) //終わりの指定
    if (!range) options.end = videoSize - 1

    const headers: {
        [name: string]: string
    } = {} //ヘッダー
    headers["Accept-Ranges"] = "bytes"
    headers["Content-Length"] = String(videoSize)
    if (range) headers["Content-Length"] = String(options.end - options.start + 1)
    if (range) headers["Content-Range"] = "bytes " + options.start + "-" + options.end + "/" + videoSize
    headers["Content-Range"] = "bytes " + options.start + "-" + options.end + "/" + videoSize
    headers["Content-Type"] = type
    console.log(options, ranges, range)
    res.writeHead((range) ? 206 : 200, headers) //206を使用すると接続を続行することが出来る
    const Stream = fs.createReadStream(videopath, options) //ストリームにし、範囲のデータを読み込む
    Stream.on("error", error => {
        console.log("Error reading file" + videopath + ".")
        console.log(error)
        res.sendStatus(500)
    });
    Stream.on("data", c => res.write(c))
    Stream.on("end", () => res.end())
}
export default videoAudioSend