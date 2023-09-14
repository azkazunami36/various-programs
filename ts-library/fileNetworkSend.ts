import express from "express"
import fs from "fs"
import http from "http"
import axios from "axios"

import dataIO from "./dataIO.js"
import bodyParser from "body-parser"

/**
 * # File Network Send
 * expressを利用し、データを送受信します。主にfsのデータからテキストも送信が可能です。
 * ただ、一時的なものであるため、改善または削除の可能性があります。
 */
export class fileNetworkSend {
    constructor() {

    }
    /**
     * 送信先IP Address
     */
    ipAddress: string = ""
    /**
     * 送信先Port
     */
    #port: number = 1
    /**
     * 送信先Port セット
     */
    set port(num: number) {
        if (num > 25565) { this.#port = 25565 }
        else if (num < 0) { this.#port = 0 }
        else { this.#port = num }
    }
    get port() { return this.#port }
    /**
     * データを受信します。
     * 送信先が送信を開始・終了するまでPromiseは待機します。
     * @param path 受信データの保存先フォルダパス
     */
    async get(path: dataIO.dataPath) {
        const app = express()
        app.use(bodyParser.urlencoded({ limit: "20gb" }))
        const server = await new Promise<http.Server>(resolve => { const server = app.listen(this.#port, () => { resolve(server) }) })
        console.log("受信準備完了")
        await new Promise<void>((resolve, reject) => {
            app.post("*", (req, res) => {
                console.log(req.headers, "ヘッダー")
                const savePath = dataIO.slashPathStr(path) + "/test"
                console.log("保存先: " + savePath + "に保存")
                const stream = fs.createWriteStream(savePath)
                stream.on("error", e => { reject(e) })
                req.on("error", e => { reject(e) })
                req.on("end", () => { resolve() })
                req.pipe(stream)
                console.log("postプログラムの終端に到着")
            })
        })
        console.log("終了")
        server.close()
    }
    /**
     * データを送信します。
     * 受信先が見つからないとエラーになる可能性があります。
     * @param path 送信元のデータパス
     */
    async send(path: dataIO.dataPath) {
        const stream = fs.createReadStream(dataIO.slashPathStr(path))
        stream.on("error", e => { throw e })
        try {
            const req = await axios.post("http://" + this.ipAddress, {
                port: this.#port,
                body: stream,
                headers: {
                    "Content-length": await new Promise<number>((resolve, reject) => {
                        fs.stat(dataIO.slashPathStr(path), (err, stat) => {
                            if (err) reject(err)
                            resolve(stat.size)
                        })
                    }),
                    "File-Name": path.name + (path.extension ? "." + path.extension : "")
                },
            })
        } catch (e) { throw e }
    }
}
