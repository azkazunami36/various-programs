import EventEmitter from "events"
import fs from "fs"
import imageSize from "image-size"
import sharp from "sharp"

import sfs from "./fsSumwave"

interface sharpConvertEvents {
    end: [void],
    progress: [now: number, total: number],
    error: [Error]
}
export declare interface sharpConvert {
    on<K extends keyof sharpConvertEvents>(s: K, listener: (...args: sharpConvertEvents[K]) => any): this
    emit<K extends keyof sharpConvertEvents>(eventName: K, ...args: sharpConvertEvents[K]): boolean
}
export class sharpConvert extends EventEmitter {
    #converting = 0
    #convertPoint = 0
    afterPass = ""
    size = 100
    processd: {
        filename: string,
        extension: string,
        point: string[],
        pass: string
    }[] = []
    nameing = 1
    type: 0 | 1 = 0
    #maxconvert = 20
    #interval: NodeJS.Timer
    constructor() {
        super()
        this.#interval = setInterval(() => this.emit("progress", this.#convertPoint, this.processd.length), 100)
    }
    async convert() {
        await new Promise<void>(resolve => {
            const convert = async () => {
                if (this.#converting === this.#maxconvert) return
                if (this.#convertPoint === this.processd.length) {
                    if (this.#converting === 0) {
                        this.emit("end", undefined)
                        resolve()
                    }
                    clearInterval(this.#interval)
                    clearInterval(loopInterval)
                    return
                }
                const i = this.#convertPoint
                this.#convertPoint++
                this.#converting++
                const fileName = this.processd[i].filename + "." + this.processd[i].extension
                let outfolders = ""
                const point = this.processd[i].point
                for (let i = 0; i !== point.length; i++) {
                    outfolders += point[i] + "/"
                    if (!(await sfs.exsits(this.afterPass + "/" + outfolders))) await sfs.mkdir(this.afterPass + "/" + outfolders)
                }
                const Stream = fs.createWriteStream(this.afterPass + "/" + outfolders + [
                    this.processd[i].filename,
                    (i + 1) + " - " + this.processd[i].filename,
                    this.processd[i].extension + " - " + this.processd[i].filename,
                    (i + 1) + "_" + this.processd[i].extension + " - " + this.processd[i].filename,
                    i + 1,
                ][this.nameing] + "." + sharpConvert.extType[this.type])
                this.emit("progress", this.#convertPoint, this.processd.length)
                await new Promise<void>(async resolve => {
                    try {
                        const image = imageSize(this.processd[i].pass + fileName)
                        if (image.width) {
                            const sha = sharp(this.processd[i].pass + fileName)
                            sha.resize((this.size < image.width) ? this.size : image.width)
                            switch (sharpConvert.extType[this.type]) {
                                case "png": sha.png(); break
                                case "jpg": sha.jpeg(); break
                            }
                            sha.pipe(Stream)
                            Stream.on("finish", resolve)
                        } else {
                            const e = new ReferenceError()
                            e.message = "width is undefined."
                            e.name = "imageSize"
                            this.emit("error", e)
                            resolve()
                        }
                    } catch (e) {
                        this.emit("error", e)
                        resolve()
                    }
                })
                this.#converting--
                convert()
            }
            const loopInterval = setInterval(convert, 100)
        })
    }
    /**
     * 命名タイプを設定。これに反ってプログラムを作ること。
     */
    static type: string[] = [
        "[ファイル名].png",
        "[連番] - [ファイル名].png",
        "[元拡張子] - [ファイル名].png",
        "[連番]_[元拡張子] - [ファイル名].png",
        "[連番].png"
    ]
    static extType = ["png", "jpg"]
}
export default sharpConvert