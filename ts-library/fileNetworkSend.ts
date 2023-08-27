import express from "express"
import request from "request"
import fs from "fs"
import http from "http"

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
        await new Promise<void>((resolve, reject) => {
            app.post("*", (req, res) => {
                console.log(req.headers)
                const stream = fs.createWriteStream(dataIO.slashPathStr(path) + "/test")
                stream.on("error", e => { reject(e) })
                req.on("error", e => { reject(e) })
                req.on("end", () => { resolve() })
                req.pipe(stream)
            })
        })
        server.close()
    }
    /**
     * データを送信します。
     * 受信先が見つからないとエラーになる可能性があります。
     * @param path 送信元のデータパス
     */
    async send(path: dataIO.dataPath) {
        await new Promise<void>(async (resolve, reject) => {
            const stream = fs.createReadStream(dataIO.slashPathStr(path))
            stream.on("error", e => { reject(e) })
            try {
                const req = request.post(this.ipAddress, {
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
                req.on("error", err => { reject(err) })
                req.on("complete", () => { resolve() })
            } catch (e) {
                reject(e)
            }
        })
    }
}
