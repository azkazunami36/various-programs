import EventEmitter from "events"

import sfs from "./fsSumwave"
import pathChecker from "./pathChecker"
import slashPathStr from "./slashPathStr"

/**
 * フォルダ内のファイルを表現するための型定義です。
 */
interface dataiofiles {
    [fileName: string]: dataiofile
}
/**
 * ファイルにあたる型定義です。
 */
interface dataiofile {
    /**
     * 属性を指定します。
     */
    attribute: {
        /**
         * フォルダかどうかを決めます。
         */
        directory: boolean
    }
    /**
     * フォルダの場合、ファイルを追加できます。
     * ファイルの場合、{}だけを格納します。
     */
    data: dataiofiles,
    /**
     * ファイルの場合はパスが格納され、そうでない場合はスキップされます。  
     * パスのフォーマット
     * ```
     * dataIO管理のフォルダまでのパス/ファイル名-現在の時間(ms)-疑似階層配列-ランダム数字 + 必要であれば.と拡張子
     * ```
     */
    pass: string | null,
    /**
     * ファイル、フォルダにデータ(タグ等)をつけることができます。
     */
    smalldata?: {}
}
/**
 * 利用出来るイベントです。
 */
interface dataIOEvents { ready: [void], error: [Error] }
export declare interface dataIO {
    on<K extends keyof dataIOEvents>(s: K, listener: (...args: dataIOEvents[K]) => any): this
    emit<K extends keyof dataIOEvents>(eventName: K, ...args: dataIOEvents[K]): boolean
}
/**
 * dataIOのメインクラスです。  
 * dataIOで扱うファイルは実際の階層とは別物です。JSONを書き換えたりするなど、人為的にデータを操作した場合には例外が発生する可能性があり、データを失う恐れがあります。
 * JSONに型定義をする場合は都度、「**XXXX**dataIOextJSON」というインターフェイスに
 * ```ts
 * interface hogedataIOextJSON extend dataIO {
 *   json: {
 *     hoge: string
 *   }
 * }
 * ```
 * 等の型定義を行ってください。  
 * 識別名を設定するとき、クラス名と同じ名前を使用しないでください。dataIOという名前は内部で予約されているため、必ずクラスがエラーまたはnullになります。
 */
export class dataIO extends EventEmitter {
    /**
     * 利用可能かどうかをステータスとして保持しています。
     */
    #operation = false
    /**
     * dataIOが管理しているパスです。このパスを中心にデータを読み込み、書き込み、操作や計算を行います。
     */
    #pass: string[]
    /**
     * dataIOを複数利用している場合、判別するために使用します。
     */
    #name: string
    /**
     * dataIOが管理してるJSONを保存する場所を指定しています。
     */
    #jsonPass: string
    /**
     * dataIOが管理しているファイルを格納するフォルダを保存する場所を指定しています。
     */
    #folderPass: string
    /**
     * ユーザーがアクセスできるJSONデータです。
     */
    json: any
    /**
     * フォルダの階層やパス、タグなどを保存しています。
     */
    #passIndex: dataiofiles
    /**
     * dataIOの設定をします。
     * @param pass dataIOに関するデータのインデックスを保存するパスを入力します。
     * @param programName dataIOの識別名を入力します。英字と[-_]のみにしてください。
     */
    constructor(pass: string, programName: string) {
        super()
        pathChecker(pass).then(async data => { // 存在を確認し、dataIO用(Various Programs標準)パス型に変換
            if (data) this.#pass = data
            else return this.emit("error", new Error("パスが間違っています。")) // 存在しないフォルダの場合、エラー
            if (programName === "dataIO") return this.emit("error", new Error("dataIOを利用することは出来ません")) // dataIOに名前を設定していたらエラー
            this.#name = programName //名前を確定
            const path = slashPathStr(this.#pass) // 通常のパス文字列に変換
            if (!await sfs.exsits(path + "/dataIO.json")) await sfs.writeFile(path + "/dataIO.json", "[]") // 予約されたdataIO.jsonを作成
            const dataIOIndex: { [programName: string]: any } = JSON.parse(String(await sfs.readFile(path + "/dataIO.json"))) // dataIO.jsonを読み込み
            if (!dataIOIndex[programName]) dataIOIndex[programName] = true // 識別名に対応したオブジェクトが存在しない場合、Trueを入力し作成
            await sfs.writeFile(path + "/dataIO.json", JSON.stringify(dataIOIndex)) // 保存
            this.#jsonPass = path + "/" + this.#name + ".json" // JSONの保存場所を定義
            this.#folderPass = path + "/" + this.#name // ファイルを保存するフォルダの保存場所を定義
            const initValue = JSON.stringify({ json: {}, passIndex: {} }) // インデックスやJSONデータを保存するためのJSONを初期化
            if (!await sfs.exsits(this.#jsonPass)) await sfs.writeFile(this.#jsonPass, initValue) // JSONが存在しなかったら初期化したデータを作成
            if (!await sfs.exsits(this.#folderPass)) await sfs.mkdir(this.#folderPass) // フォルダが存在しなかったら作成
            const rawJSON: {
                json: {},
                passIndex: dataiofiles
            } = await JSON.parse(String(await sfs.readFile(this.#jsonPass))) // JSONを読み込み
            this.json = rawJSON.json // クラスにJSONを定義
            this.#passIndex = rawJSON.passIndex // クラスにフォルダ階層のデータを定義
            this.#operation = true // 利用可能のフラグをTrueに
            this.emit("ready", undefined) // 利用可能のイベントを送信
        })
    }
    /**
     * 簡易初期化ができるものです。パスはVarious Programsで管理されているパスを利用します。
     * @param programName dataIOの識別名を入力します。英字と[-_]のみにしてください。
     * @returns dataIOの初期化済みクラスまたはnullを返します。
     */
    static async initer(programName: string): Promise<dataIO | null> {
        if (programName === "dataIO") return null
        if (!await sfs.exsits("passCache.json")) {
            if (!await sfs.exsits("cache")) sfs.mkdir("cache")
            await sfs.writeFile("passCache.json", "\"cache\"")
        }
        const io = new dataIO(JSON.parse(String(await sfs.readFile("passCache.json"))), programName)
        await new Promise<void>(resolve => io.on("ready", () => resolve()))
        return io
    }
    /**
     * 利用可能かどうかを確認できます。
     */
    get operation() { return this.#operation }
    /**
     * 保存されたファイルを取得または、新しいファイル格納場所を追加します。
     * @param pass パスを入力します。
     * @param name ファイル名を入力します。
     * @param option オプションを指定します。
     * @returns 
     */
    async passGet(pass: string[], name: string, option?: { 
        /**
         * 拡張子を指定します。
         */
        extension?: string 
    }): Promise<string | null> {
        if (!this.#operation) return null
        let extension: string | null = null
        if (option) {
            if (option.extension) extension = option.extension
        }
        /**
         * 現在いる階層
         */
        let obj: dataiofiles = this.#passIndex
        for (let i = 0; i !== pass.length; i++) {
            if (!obj[pass[i]]) obj[pass[i]] = { // ここまでのパスが存在しない場合。
                attribute: { directory: true }, // フォルダを生成
                pass: null,
                data: {}
            }
            // 読み込まれているファイルがディレクトリである場合
            if (obj[pass[i]].attribute.directory) obj = obj[pass[i]].data // フォルダ内に入る
            else { // そうでない場合
                const error = new Error()
                error.message = "JSONによる擬似パス内階層にアクセス中に例外「ファイル内フォルダにアクセス」が発生しました。"
                error.name = "JSON擬似パスエラー"
                this.emit("error", error) // ファイル内にフォルダを作らないようにする
                return null
            }
        }
        if (!obj[name]) obj[name] = { // ファイルが存在しない場合
            attribute: { directory: false }, //ファイルとして作成
            pass: this.#folderPass + "/" + name + "-" + Date.now() + "-" + pass.join("") + "-" + Math.floor(Math.random() * 99) + (extension ? "." + extension : ""), // 新規パスを生成
            data: {}
        }
        return obj[name].pass
    }
    /**
     * 現在のdataIOの状態を保存します。
     */
    async save() {
        await sfs.writeFile(this.#jsonPass, JSON.stringify({ json: this.json, passIndex: this.#passIndex }))
    }
}
export default dataIO
