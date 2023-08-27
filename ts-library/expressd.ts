import express from "express"
import http from "http"
import fs from "fs"
import { EventEmitter } from "events"

import dataIO from "./dataIO.js"
import vpManageClass from "./vpManageClass.js"

/**
 * # expressd
 * GUI操作プログラムです。最も親しみやすいUIと分かりやすい操作方法、様々な状況でも動く柔軟なプログラムを提供します。
 */
export namespace expressd {
    /**
     * 利用出来るイベントです。
     */
    interface expressdEvents { ready: [void], error: [Error] }
    export declare interface expressd {
        on<K extends keyof expressdEvents>(s: K, listener: (...args: expressdEvents[K]) => any): this
        emit<K extends keyof expressdEvents>(eventName: K, ...args: expressdEvents[K]): boolean
    }
    /**
     * expressdは名前の通りexpressを利用しますが、少し変わった点があります。  
     * それは、cuiIOの上位互換だと言うことです。
     * 
     * つまり、cuiIOでのプログラムにアクセスする手段のGUI版と言うことです。
     * そのため、今後cuiIOとguiIOのプログラム内容の同期を行うための、新しい方法を試行錯誤しておきます。
     * が、それまではプログラムは全く別になり、同じ操作方法を保証することはないです。
     */
    export class expressd extends EventEmitter {
        app: express.Express
        server?: http.Server
        #port = "80"
        shareData: vpManageClass.shareData
        constructor(shareData: vpManageClass.shareData) {
            super();
            (async () => {
                this.app = express()
                const app = this.app
                app.get("*", async (req, res) => this.#get(req, res))
                app.post("*", (req, res) => this.#post(req, res))
                await new Promise<void>(resolve => this.server = app.listen(this.#port, () => { resolve() }))
                if (this.server) this.server.on("error", err => { this.emit("error", err) })
                this.emit("ready", undefined)
                this.shareData = shareData
            })()
        }
        static async initer(shareData: vpManageClass.shareData) {
            const exp = new expressd(shareData)
            await new Promise<void>(resolve => exp.on("ready", () => resolve()))
            shareData.expressd = exp
        }
        async #get(req: express.Request | http.IncomingMessage, res: express.Response) {
            if (req.url !== undefined) {
                const url = await dataIO.pathChecker(process.cwd() + "/ts-library/expressdSrc" + (req.url !== "/" ? req.url : "/index.html"))
                if (url) {
                    const contentType = (() => {
                        switch (url.extension) {
                            case "html": return "text/html"
                            case "css": return "text/css"
                            case "js": return "application/javascript"
                            case "json": return "application/json"
                        }
                    })()
                    res.header("Content-Type", contentType + ";charset=utf-8")
                    const stream = fs.createReadStream(dataIO.slashPathStr(url))
                    stream.on("data", chunk => res.write(chunk))
                    stream.on("end", () => res.end())
                } else {
                    res.status(404)
                    res.end()
                }
            }
        }
        async #post(req: express.Request | http.IncomingMessage, res: express.Response | http.ServerResponse) {
            const urlSplit = req.url?.split("/")
            if (urlSplit) {
                console.log(urlSplit)
                const reqData: {
                    [mainName: string]: {
                        [funcName: string]: {
                            [name: string]: (() => Promise<string>) | undefined
                        } | undefined
                    } | undefined
                } = {
                    "API": {
                        "dataIO": {
                            "parentFolder": async () => {
                                this.shareData.dataIO
                                return ""
                            }
                        }
                    }
                }
                const urlOne = reqData[urlSplit[0]]
                if (!urlOne) { res.end("Not Found"); return }
                const urlTwo = urlOne[urlSplit[1]]
                if (!urlTwo) { res.end("Not Found"); return }
                const urlThree = urlTwo[urlSplit[2]]
                if (!urlThree) { res.end("Not Found"); return }
                res.end(await urlThree())
            }
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
        res.writeHead((range) ? 206 : 200, headers) //206を使用すると接続を続行することが出来る
        const Stream = fs.createReadStream(videopath, options) //ストリームにし、範囲のデータを読み込む
        Stream.on("error", error => {
            res.sendStatus(500)
        });
        Stream.on("data", c => res.write(c))
        Stream.on("end", () => res.end())
    }
}
export default expressd
