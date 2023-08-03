import EventEmitter from "events"
import fs from "fs"

import sfs from "./fsSumwave"
import vpManageClass from "./vpManageClass"
import handyTool from "./handyTool"

/**
 * # dataIO
 * 様々なファイルやデータを適切かつ安定的に管理する為の物です。全てのプログラムで利用を推奨しており、これらを利用してVarious Programs関連のデータ全てを正しく扱うことが出来ます。
 */
export namespace dataIO {
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
    export declare interface ny {
        on<K extends keyof dataIOEvents>(s: K, listener: (...args: dataIOEvents[K]) => any): this
        emit<K extends keyof dataIOEvents>(eventName: K, ...args: dataIOEvents[K]): boolean
    }
    /**
     * dataIO.jsonの型定義です。
     */
    interface dataIOJSON {
        /**
         * dataIOにアクセスしたプログラムの情報です。
         */
        manageProgramData?: {
            /**
             * プログラム名です。
             */
            [name: string]: {
                folderPath: string[],
                jsonPath: string[]
            }
        }
    }
    /**
     * # dataIO
     * pathCache.jsonが自動でvarious-programsフォルダ内に作成されます。
     */
    export class ny {
        /**
         * dataIOが利用できるかのステータスの状況
         */
        #dataIOstatus = false
        constructor() {
            (async () => {
                // パスが保存されたjsonがあるかどうかで、初期化する
                if (!await sfs.exsits("pathCache.json")) {
                    if (!await sfs.exsits("cache")) sfs.mkdir("cache")
                    await sfs.writeFile("pathCache.json", "\"cache\"")
                }
                const dataIOjsonPath = await this.#dataIOjsonPath()
                // 取得できない、またはパスが存在しなかったらreturn
                if (!dataIOjsonPath || !sfs.exsits(dataIOjsonPath)) return
                if (!sfs.exsits(dataIOjsonPath + "/dataIO.json")) sfs.writeFile(dataIOjsonPath + "/dataIO.json", JSON.stringify({}))
                this.#dataIOstatus = true // 利用可能としてマークする
                this.emit("ready", undefined)
            })
        }
        /**
         * クラス定義時に非同期関数をawaitで待機できるようにしたもの
         * @returns 
         */
        static async initer() {
            const dataIO = new ny()
            await new Promise<void>(resolve => dataIO.on("ready", () => resolve()))
            return dataIO
        }
        /**
         * dataIOが現在利用できるかどうかを確認できます。
         */
        get dataIOStatus() {
            return this.#dataIOstatus
        }
        /**
         * dataIOのインデックスが入ったJSON等の場所を記したパス
         */
        async #dataIOjsonPath() {
            const str = JSON.parse(String(await sfs.readFile("pathCache.json")))
            if (typeof str === "string" && await sfs.exsits(str)) return str as string
            const e = new Error("pathCache.jsonを処理できませんでした。削除してやり直してください。")
            e.name = "dataIO"
            this.emit("error", e)
        }
        /**
         * JSONデータを取得します。
         * 型定義を自己で行ってください。
         * ```ts
         * (await dataio.json<{
         *   data: {
         *     gba: number,
         *     index?: string[]
         *   }
         * }>(dataioclient)).data.gba
         * ```
         * @param client dataIOClientを入力します。
         */
        async json<T>(client: dataIOClient): Promise<T> {
            return JSON.parse("")
        }
        /**
         * dataIOClientクラスの初期化に使用されます。
         * クライアント側は利用せずお使いいただけます。
         */
        async clientdataiosetting(dataIOClient: dataIOClient, password: string) {
            const data = dataIOClient.data(password)
            if (!data) return
            const dataIOjsonPath = await this.#dataIOjsonPath()
            // 取得できない、またはパスが存在しなかったらreturn
            if (!dataIOjsonPath || !sfs.exsits(dataIOjsonPath)) return
            const json = JSON.parse(String(sfs.readFile(dataIOjsonPath + "/dataIO.json"))) as dataIOJSON
            if (json.manageProgramData !== undefined && data.name) {
                if (!json.manageProgramData[data.name]) json.manageProgramData[data.name] = {
                    folderPath: [],
                    jsonPath: [""]
                }
            }
        }

    }
    export declare interface dataIOClient {
        on<K extends keyof dataIOEvents>(s: K, listener: (...args: dataIOEvents[K]) => any): this
        emit<K extends keyof dataIOEvents>(eventName: K, ...args: dataIOEvents[K]): boolean
    }
    /**
     * これはdataIOにプログラムのデータを簡単に渡すためのクラスです。  
     * このクラスをdataIOの操作する関数に入力すると、自動で情報を取得しプログラム用のデータを提供します。
     * 名前、設定にアクセスすることができ、基本クラスの内容を書き換えることは避けてください。
     */
    export class dataIOClient extends EventEmitter {
        /**
         * クラス内の内容を書き換えるために利用される文字列です。特定の関数に入力し一致することで書き換えが可能になります。
         */
        #accessKey: string
        #data: {
            name?: string
        } = {}
        constructor(name: string, shareData: vpManageClass.shareData) {
            super();
            (async () => {
                this.#accessKey = handyTool.randomStringCreate(10, {
                    str: true,
                    num: true,
                    upstr: true
                }) // キーをセット
                if (!shareData.dataIO) shareData.dataIO = await ny.initer()
                this.#data.name = name
                await shareData.dataIO.clientdataiosetting(this, this.#accessKey)
                this.emit("ready", undefined)
            })
        }
        static async initer(name: string, shareData: vpManageClass.shareData) {
            const d = new dataIOClient(name, shareData)
            await new Promise<void>(resolve => d.on("ready", () => resolve()))
            return d
        }
        data(accessKey: string) {
            if (this.#accessKey === accessKey) return this.#data
            return null
        }
    }
    /**
     * 文字列配列を元にスラッシュ付きのパス型に変換します。
     * @param passArray 文字列配列を入力します。
     * @returns 
     */
    export function slashPathStr(passArray: string[]) {
        let passtmp = ""
        for (let i = 0; i !== passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
        return passtmp
    }
    /**
     * 有効なパスかをチェックします。そして、一部の特殊なパスの場合に変換をします
     * @param string 文字列を入力します。
     * @returns 
     */
    export async function pathChecker(str: string | string[]) {
        const pass = await (async () => {
            const string = (() => {
                if (typeof str === "string") return str
                else return slashPathStr(str)
            })()
            const passDeli = (string.match(/:\\/)) ? "\\" : "/"
            const passArray = string.split(passDeli)
            let passtmp = ""
            for (let i = 0; i !== passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
            if (await sfs.exsits(passtmp)) return passtmp
            if (passtmp[0] === "\"" && passtmp[passtmp.length - 1] === "\"") passtmp = passtmp.substring(1, passtmp.length - 1)
            if (await sfs.exsits(passtmp)) return passtmp
            if (passtmp[0] === "\'" && passtmp[passtmp.length - 1] === "\'") passtmp = passtmp.substring(1, passtmp.length - 1)
            if (await sfs.exsits(passtmp)) return passtmp
            while (passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
            if (await sfs.exsits(passtmp)) return passtmp
            const expType = " ()#~"
            for (let i = 0; i !== expType.length; i++) {
                const type = expType[i]
                const exp = new RegExp("\\\\\\" + type, "g")
                passtmp = passtmp.replace(exp, type)
                if (await sfs.exsits(passtmp)) return passtmp
            }
            return null
        })()
        if (!pass) return null
        const passArray = pass.split("/")
        return passArray
    }
    interface passInfo {
        /**
         * 拡張子を含まないファイル名が記載
         */
        filename: string
        /**
         * 拡張子が記載
         */
        extension: string
        /**
         * この位置までのパスが記載
         */
        pass: string
        /**
         * 相対パスでの配列での記載
         * フォルダ内のデータを移動する際に役立つ。
         */
        point: string[]
        /**
         * 元パスから配列での記載
         * データにアクセスするために役立つ。passデータとはあまり変わらない。
         */
        isPoint: string[]
    }
    /**
     * フォルダ内のファイルを配列として出力します。
     * @param pass フォルダへのパスを入力します。
     * @param option オプションを設定します。
     * @returns 配列を返します。
     */
    export async function fileLister(
        /**
         * フォルダパスを入力。その中のファイルやフォルダを配列化する。
         */
        pass: string[],
        /**
         * 様々なオプションを入力
         */
        option?: {
            /**
             * フォルダ内のフォルダにアクセス、階層内のデータを読み込むかどうか
             */
            contain?: boolean,
            /**
             * 拡張子を限定し、検索範囲を絞る
             */
            extensionFilter?: string[],
            /**
             * 「.」を使った隠しファイルを検出し、検索から除外する
             */
            invFIleIgnored?: boolean,
            /**
             * 「._」を使った隠しパラメーターファイルを検出し、検索から除外する
             */
            macosInvIgnored?: boolean
        }
    ) {
        //オプションデータの格納用
        /**
         * フォルダ内のフォルダにアクセス、階層内のデータを読み込むかどうか
         */
        let contain = false
        /**
         * 拡張子を限定し、検索範囲を絞る
         */
        let extensionFilter: string[] = []
        /**
         * 「.」を使った隠しファイルを検出し、検索から除外する
         */
        let invFIleIgnored = false
        /**
         * 「._」を使った隠しパラメーターファイルを検出し、検索から除外する
         */
        let macosInvIgnored = false
        if (option !== undefined) {
            if (option.contain) contain = true
            if (option.extensionFilter !== undefined) extensionFilter = option.extensionFilter
            if (option.invFIleIgnored) invFIleIgnored = true
            if (option.macosInvIgnored) macosInvIgnored = true
        }

        const processd: passInfo[] = [] //出力データの保存場所
        if (!await pathChecker(pass)) return processd
        const point: string[] = [] //パス場所を設定
        /**
         * キャッシュデータの格納
         */
        const filepoint: {
            /**
             * マークとなるディレクトリのパスを入力
             * @param lpass どこのパスかを記述する
             */
            [lpass: string]: {
                /**
                 * キャッシュからファイルを指定する
                 */
                point: number,
                /**
                 * ディレクトリやファイルリストのキャッシュを保存
                 */
                dirents: fs.Dirent[]
            }
        } = {}

        while (true) {
            let lpass = pass //ファイル処理時の一時的パス場所
            for (let i = 0; i !== point.length; i++) lpass.push(point[i]) //パス解析、配列化

            //filepointの初期化
            if (!filepoint[slashPathStr(lpass)]) filepoint[slashPathStr(lpass)] = {
                point: 0,
                dirents: await new Promise(resolve => {
                    fs.readdir(slashPathStr(lpass), { withFileTypes: true }, (err, dirents) => {
                        if (err) throw err
                        resolve(dirents)
                    })
                })
            }
            /**
             * 保存されたリストを取得
             */
            const dirents = filepoint[slashPathStr(lpass)].dirents
            //もしディレクトリ内のファイル数とファイル指定番号が同じな場合
            if (dirents.length === filepoint[slashPathStr(lpass)].point)
                //lpassが初期値「pass + "/"」と同じ場合ループを抜ける
                if (slashPathStr(lpass) === slashPathStr(pass)) break
                //そうでない場合上の階層へ移動する
                else point.pop()
            else {
                //ファイル名の取得
                const name = dirents[filepoint[slashPathStr(lpass)].point].name
                //フォルダ、ディレクトリでない場合
                if (!dirents[filepoint[slashPathStr(lpass)].point].isDirectory()) {
                    //ドットで分割
                    const namedot = name.split(".")
                    //拡張子を取得
                    const extension = namedot[namedot.length - 1]
                    if ((() => { //もしも
                        if (extensionFilter[0]) { //拡張子指定がある場合
                            let stats = false
                            for (let i = 0; i !== extensionFilter.length; i++)
                                if (extensionFilter[i].match(new RegExp(extension, "i"))) stats = true
                            if (!stats) return false //拡張子がマッチしなかったらfalse
                        }
                        //末端が一致した場合false
                        if (invFIleIgnored && name[0] === ".") return false
                        if (macosInvIgnored && name[0] === "." && name[1] === "_") return false
                        return true //全てがreturnしない場合true
                    })()) processd.push({ //ファイルデータを追加
                        filename: name.slice(0, -(extension.length + 1)),
                        extension: extension,
                        pass: slashPathStr(lpass),
                        isPoint: JSON.parse(JSON.stringify([...pass, ...point])),
                        point: point
                    })
                    //ディレクトりの場合は階層を移動し、ディレクトリ内に入り込む
                } else if (contain && dirents[filepoint[slashPathStr(lpass)].point].isDirectory()) point.push(name)
                //次のファイルへ移動する
                filepoint[slashPathStr(lpass)].point++
            }
        }
        //データを出力
        console.log(processd)
        return processd
    }
    /**
     * 拡張子と名前で分割します。
     */
    export function splitExt(name: string) {
        const splitedName = name.split(".")
        const extension = splitedName[splitedName.length - 1]
        return {
            filename: name.slice(0, -(extension.length + 1)),
            extension: extension
        }
    }
}
export default dataIO
