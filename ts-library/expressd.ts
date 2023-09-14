import express from "express"
import http from "http"
import fs from "fs"
import { EventEmitter } from "events"

import dataIO from "./dataIO.js"
import vpManageClass from "./vpManageClass.js"
import sfs from "./fsSumwave.js"
import bodyParser from "body-parser"

/**
 * # expressd
 * GUI操作プログラムです。最も親しみやすいUIと分かりやすい操作方法、様々な状況でも動く柔軟なプログラムを提供します。  
 * さらに、expressを利用したデータをネットワーク上で送受信する機能を利用することが出来ます。
 */
export namespace expressd {
    /**
     * 利用出来るイベントです。
     */
    interface expressdEvents { ready: [void], error: [Error] }/**
    * JSON型定義の上書き
    */
    interface expressdDataIOextJSON extends dataIO.dataIO {
        json: {}
    }
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
        data: expressdDataIOextJSON
        server?: http.Server
        #port = "80"
        shareData: vpManageClass.shareData
        constructor(shareData: vpManageClass.shareData) {
            super();
            (async () => {
                this.app = express()
                const app = this.app
                app.use(bodyParser.urlencoded({ limit: "127gb", extended: true }));
                app.get("*", async (req, res) => this.#get(req, res))
                app.post("*", (req, res) => this.#post(req, res))
                await new Promise<void>(resolve => this.server = app.listen(this.#port, () => { resolve() }))
                if (this.server) this.server.on("error", err => { this.emit("error", err) })
                const data = await dataIO.dataIO.initer("expressd")
                if (!data) {
                    const e = new ReferenceError()
                    e.message = "dataIOの準備ができませんでした。"
                    e.name = "Discord Bot"
                    this.emit("error", e)
                    return
                }
                this.data = data
                this.emit("ready", undefined)
                this.shareData = shareData
            })()
        }
        static async initer(shareData: vpManageClass.shareData) {
            const exp = new expressd(shareData)
            await new Promise<void>(resolve => exp.on("ready", () => resolve()))
            shareData.expressd = exp
        }
        #typeGet(string: string, type: "extension" | "contentType") {
            const data = [
                ["aac", "audio/aac"],
                ["abw", "application/x-abiword"],
                ["arc", "application/x-freearc"],
                ["avi", "video/x-msvideo"],
                ["azw", "application/vnd.amazon.ebook"],
                ["bin", "application/octet-stream"],
                ["bmp", "image/bmp"],
                ["bz", "application/x-bzip"],
                ["bz2", "application/x-bzip2"],
                ["csh", "application/x-csh"],
                ["css", "text/css"],
                ["csv", "text/csv"],
                ["doc", "application/msword"],
                ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
                ["eot", "application/vnd.ms-fontobject"],
                ["epub", "application/epub+zip"],
                ["gz", "application/gzip"],
                ["gif", "image/gif"],
                ["htm", "text/html"],
                ["html", "text/html"],
                ["ico", "image/vnd.microsoft.icon"],
                ["ics", "text/calendar"],
                ["jar", "application/java-archive"],
                ["jpeg", "image/jpeg"],
                ["jpg", "image/jpeg"],
                ["js", "text/javascript"],
                ["json", "application/json"],
                ["jsonld", "application/ld+json"],
                ["mid", "audio/midi audio/x-midi"],
                ["midi", "audio/midi audio/x-midi"],
                ["mjs", "text/javascript"],
                ["mp3", "audio/mpeg"],
                ["mp4", "video/mp4"],
                ["mpeg", "video/mpeg"],
                ["mpkg", "application/vnd.apple.installer+xml"],
                ["odp", "application/vnd.oasis.opendocument.presentation"],
                ["ods", "application/vnd.oasis.opendocument.spreadsheet"],
                ["odt", "application/vnd.oasis.opendocument.text"],
                ["oga", "audio/ogg"],
                ["ogv", "video/ogg"],
                ["ogx", "application/ogg"],
                ["opus", "audio/opus"],
                ["otf", "font/otf"],
                ["png", "image/png"],
                ["pdf", "application/pdf"],
                ["php", "application/x-httpd-php"],
                ["ppt", "application/vnd.ms-powerpoint"],
                ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
                ["rar", "application/vnd.rar"],
                ["rtf", "application/rtf"],
                ["sh", "application/x-sh"],
                ["svg", "image/svg+xml"],
                ["swf", "application/x-shockwave-flash"],
                ["tar", "application/x-tar"],
                ["tif", "image/tiff"],
                ["tiff", "image/tiff"],
                ["ts", "video/mp2t"],
                ["ttf", "font/ttf"],
                ["txt", "text/plain"],
                ["vsd", "application/vnd.visio"],
                ["wav", "audio/wav"],
                ["weba", "audio/webm"],
                ["webm", "video/webm"],
                ["webp", "image/webp"],
                ["woff", "font/woff"],
                ["woff2", "font/woff2"],
                ["xhtml", "application/xhtml+xml"],
                ["xls", "application/vnd.ms-excel"],
                ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
                ["xml", "application/xml"],
                ["xul", "application/vnd.mozilla.xul+xml"],
                ["zip", "application/zip"],
                ["3gp", "video/3gpp"],
                ["3g2", "video/3gpp2"],
                ["7z", "application/x-7z-compressed"]
            ]
            for (let i = 0; i !== data.length; i++) if (data[i][type === "extension" ? 1 : 0] === string) return data[i][type === "extension" ? 0 : 1]
            return ["", "text/plain"][type === "extension" ? 0 : 1]
        }
        async #get(req: express.Request | http.IncomingMessage, res: express.Response) {
            if (req.url !== undefined) {
                const url = await dataIO.pathChecker(process.cwd() + "/ts-library/expressdSrc" + (req.url !== "/" ? req.url : "/index.html"))
                if (url && url.extension) {
                    const contentType = this.#typeGet(url.extension, "contentType")
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
                            },
                            "sendFile": async () => {
                                return await new Promise<string>(async (resolve, reject) => {
                                    let data: string = ""
                                    const contentType = req.headers["content-type"]
                                    if (contentType) {
                                        const path = await this.data.passGet(["sendFile"], String(Date.now()), { extension: this.#typeGet(contentType, "extension") })
                                        if (path) {
                                            const stream = fs.createWriteStream(path)
                                            req.pipe(stream)
                                            req.on("end", async () => resolve("Done"))
                                            req.on("error", e => { resolve("Network Error") })
                                        }
                                        else resolve("dataIO Error")
                                    } else resolve("Content type cannot be identified")
                                })
                            }
                        }
                    }
                }
                const urlOne = reqData[urlSplit[1]]
                if (!urlOne) { res.end("Request Not Found"); return }
                const urlTwo = urlOne[urlSplit[2]]
                if (!urlTwo) { res.end("Request Not Found"); return }
                const urlThree = urlTwo[urlSplit[3]]
                if (!urlThree) { res.end("Request Not Found"); return }
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
