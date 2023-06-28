import EventEmitter from "events"

import sfs from "./fsSumwave"
import pathChecker from "./pathChecker"
import slashPathStr from "./slashPathStr"

interface dataiofiles {
    [fileName: string]: dataiofile
}
interface dataiofile {
    attribute: {
        directory: boolean
    }
    data: dataiofiles,
    pass: string | null,
    smalldata?: {}
}
interface dataIOEvents { ready: [void] }
export declare interface dataIO {
    on<K extends keyof dataIOEvents>(s: K, listener: (...args: dataIOEvents[K]) => any): this
    emit<K extends keyof dataIOEvents>(eventName: K, ...args: dataIOEvents[K]): boolean
}
export class dataIO extends EventEmitter {
    #operation = false
    #pass: string[]
    #name: string
    #jsonPass: string
    #folderPass: string
    json: any
    #passIndex: dataiofiles
    constructor(pass: string, programName: string) {
        super()
        pathChecker(pass).then(async data => {
            if (data) this.#pass = data
            else throw new Error("パスが間違っています。")
            if (programName === "dataIO") throw new Error("dataIOを利用することは出来ません")
            this.#name = programName
            const path = slashPathStr(this.#pass)
            if (!await sfs.exsits(path + "/dataIO.json")) await sfs.writeFile(path + "/dataIO.json", "[]")
            const dataIOIndex: { [programName: string]: any } = JSON.parse(String(await sfs.readFile(path + "/dataIO.json")))
            if (!dataIOIndex[programName]) dataIOIndex[programName] = true
            await sfs.writeFile(path + "/dataIO.json", JSON.stringify(dataIOIndex))
            this.#jsonPass = path + "/" + this.#name + ".json"
            this.#folderPass = path + "/" + this.#name
            const initValue = JSON.stringify({ json: {}, passIndex: {} })
            if (!await sfs.exsits(this.#jsonPass)) await sfs.writeFile(this.#jsonPass, initValue)
            if (!await sfs.exsits(this.#folderPass)) await sfs.mkdir(this.#folderPass)
            const rawJSON: {
                json: {},
                passIndex: dataiofiles
            } = await JSON.parse(String(await sfs.readFile(this.#jsonPass)))
            this.json = rawJSON.json
            this.#passIndex = rawJSON.passIndex
            this.#operation = true
            this.emit("ready", undefined)
        })
    }
    static async initer(programName: string): Promise<dataIO | null> {
        if (programName === "dataIO") {
            console.log("クラス名と同じ名前を使用しないでください。\nこの名前は内部で予約されています。")
            return null
        }
        if (!await sfs.exsits("passCache.json")) {
            if (!await sfs.exsits("cache")) sfs.mkdir("cache")
            await sfs.writeFile("passCache.json", "\"cache\"")
        }
        const io = new dataIO(JSON.parse(String(await sfs.readFile("passCache.json"))), programName)
        await new Promise<void>(resolve => io.on("ready", () => resolve()))
        return io
    }
    get operation() { return this.#operation }
    async passGet(pass: string[], name: string, option?: { extension?: string }): Promise<string | null> {
        if (!this.#operation) return null
        let extension: string | null = null
        if (option) {
            if (option.extension) extension = option.extension
        }
        let obj: dataiofiles = this.#passIndex
        for (let i = 0; i !== pass.length; i++) {
            if (!obj[pass[i]]) obj[pass[i]] = {
                attribute: { directory: true },
                pass: null,
                data: {}
            }
            if (obj[pass[i]].attribute.directory) obj = obj[pass[i]].data
            else {
                const error = new Error()
                error.message = "JSONによる擬似パス内階層にアクセス中に例外「ファイル内フォルダにアクセス」が発生しました。"
                error.name = "JSON擬似パスエラー"
                throw error
            }
        }
        if (!obj[name]) obj[name] = {
            attribute: { directory: false },
            pass: this.#folderPass + "/" + name + "-" + Date.now() + "-" + pass.join("") + "-" + Math.floor(Math.random() * 99) + (extension ? "." + extension : ""),
            data: {}
        }
        return obj[name].pass
    }
    async save() {
        await sfs.writeFile(this.#jsonPass, JSON.stringify({ json: this.json, passIndex: this.#passIndex }))
    }
}
export default dataIO