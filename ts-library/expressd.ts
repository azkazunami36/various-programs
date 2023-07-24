import express from "express"
import http from "http"
import fs from "fs"

import vpManageClass from "./vpManageClass"


export namespace expressd {
    export interface expressApp {
        app?: express.Express
        server?: http.Server
    }
    /**
     * expressdは名前の通りexpressを利用しますが、少し変わった点があります。  
     * それは、cuiIOの上位互換だと言うことです。
     * 
     * つまり、cuiIOでのプログラムにアクセスする手段のGUI版と言うことです。
     * そのため、今後cuiIOとguiIOのプログラム内容の同期を行うための、新しい方法を試行錯誤しておきます。
     * が、それまではプログラムは全く別になり、同じ操作方法を保証することはないです。
     */
    export class expressd {
        constructor() { }
        /**
         * 未完成のため、ここの関数で実行されます。
         * もしここの関数のみで完成した場合、classを削除しfunctionに置き換えます。
         * ※sourcedフォルダにデータを入れていますが、main.jsのプログラムを全てここに入れ終えたら、sourcesに名前を変更します。
         */
        static async main(shareData: vpManageClass.shareData): Promise<void> {
            if (!shareData.expressApp) shareData.expressApp = {}
            shareData.expressApp.app = express()
            const app = shareData.expressApp.app
            app.get("*", async (req, res) => {
                /**
                 * リクエスト(要求)された場所
                 */
                const url = req.url
                /**
                 * 応答の種類です。
                 * sourcesフォルダにアクセスするか、その他のデータにアクセスするかを確認し、それに合ったプログラムを実行します。
                 * pass内に「/」で分割し、それを利用してファイル先へアクセスする手がかりにします。
                 * 戻り値にファイルパスを入れる必要があります。
                 */
                const type: { [type: string]: (pass: string[]) => Promise<string> } = {
                    "sources": async pass => {
                        return ""
                    }
                }
                const passArray = url.split("/")
                const passdata = await type[passArray[1]]([...passArray])
            })
            app.post("*", (req, res) => {
            })
            shareData.expressApp.server = app.listen("80", () => { })
        }
    }
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
}
export default expressd
