import readline from "readline"
import fs from "fs"
import EventEmitter from "events"
import sharp from "sharp"
import imageSize from "image-size"

export async function fileLister(pass: string, option?: { contain?: boolean, extensionFilter?: string[] }) {
    let contain = false
    let extensionFilter: string[] = []
    if (option !== undefined) {
        if (option.contain) contain = true
        if (option.extensionFilter !== undefined) extensionFilter = option.extensionFilter
    }
    const processd: passInfo[] = []
    const point: string[] = [] //パス場所を設定
    const filepoint: {
        [lpass: string]: {
            point: number,
            dirents: fs.Dirent[]
        }
    } = {}

    while (true) {
        let lpass = pass + "/" //ファイル処理時の一時的パス場所
        for (let i = 0; i !== point.length; i++) lpass += point[i] + "/" //パス取得
        if (!filepoint[lpass]) filepoint[lpass] = {
            point: 0,
            dirents: await new Promise(resolve => {
                fs.readdir(lpass, { withFileTypes: true }, (err, dirents) => {
                    if (err) throw err
                    resolve(dirents)
                })
            })
        }
        if (!filepoint[lpass].point) filepoint[lpass].point = 0
        if (!filepoint[lpass].dirents) {
            filepoint[lpass].dirents = await new Promise(resolve => {
                fs.readdir(lpass, { withFileTypes: true }, (err, dirents) => {
                    if (err) throw err
                    resolve(dirents)
                })
            })
        }
        const dirents = filepoint[lpass].dirents
        if (dirents.length === filepoint[lpass].point)
            if (lpass === pass + "/") break
            else point.pop()
        else {
            const name = dirents[filepoint[lpass].point].name
            if (!dirents[filepoint[lpass].point].isDirectory()) {
                const namedot = name.split(".")
                const extension = namedot[namedot.length - 1]
                if ((() => {
                    if (extensionFilter[0]) {
                        for (let i = 0; i !== extensionFilter.length; i++)
                            if (extensionFilter[i].match(new RegExp(extension, "i"))) return true
                    } else return true
                    return false
                })()) processd.push({
                    filename: name.slice(0, -(extension.length + 1)),
                    extension: extension,
                    pass: lpass,
                    point: JSON.parse(JSON.stringify(point))
                })
            } else if (contain && dirents[filepoint[lpass].point].isDirectory()) point.push(name)
            filepoint[lpass].point++
        }
    }
    return processd
}
export async function mkdir(pass: string): Promise<boolean> { return await new Promise<boolean>(resolve => fs.mkdir(pass, err => resolve(err === null))) }
interface sharpConvertEvents {
    end: [null],
    progress: [now: number, total: number]
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
                        this.emit("end", null)
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
                    if (!(await exsits(this.afterPass + "/" + outfolders))) await mkdir(this.afterPass + "/" + outfolders)
                }
                const Stream = fs.createWriteStream(this.afterPass + "/" + outfolders + [
                    this.processd[i].filename,
                    (i + 1) + " - " + this.processd[i].filename,
                    this.processd[i].extension + " - " + this.processd[i].filename,
                    (i + 1) + "_" + this.processd[i].extension + " - " + this.processd[i].filename,
                    i + 1,
                ][this.nameing] + ".png")
                this.emit("progress", this.#convertPoint, this.processd.length)
                await new Promise(async resolve => {
                    const imageW = (() => {
                        const image = imageSize(this.processd[i].pass + fileName)
                        if (image.width) return image.width
                        return 0
                    })()
                    sharp(this.processd[i].pass + fileName)
                        .resize((this.size < imageW) ? this.size : imageW)
                        .png()
                        .pipe(Stream)
                    Stream.on("finish", resolve)
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
}
export async function exsits(pass: string): Promise<Boolean> { return await new Promise(resolve => { fs.access(pass, err => resolve(err === null)) }) }
export async function passCheck(string: string): Promise<{ pass: string } & fs.Stats | null> {
    const pass = await (async () => {
        const passDeli = (string.match(/:\\/)) ? "\\" : "/"
        const passArray = string.split(passDeli)
        let passtmp = ""
        for (let i = 0; i != passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
        if (await exsits(passtmp)) return passtmp
        if (passtmp[0] === "\"" && passtmp[passtmp.length - 1] === "\"") passtmp = passtmp.substring(1, passtmp.length - 1)
        if (await exsits(passtmp)) return passtmp
        while (passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
        if (await exsits(passtmp)) return passtmp
        passtmp = passtmp.replace(/\\ /g, " ")
        if (await exsits(passtmp)) return passtmp
        return null
    })()
    if (!pass) return null
    const stats: fs.Stats = await new Promise(resolve => fs.stat(pass, (err, stats) => resolve(stats)))
    return { pass: pass, ...stats }
}
export async function choice(array: string[], title?: string, questionText?: string): Promise<number | null> {
    console.log((title ? title : "一覧") + ": ")
    for (let i = 0; i !== array.length; i++) console.log("[" + (i + 1) + "] " + array[i])
    const request = Number(await question(questionText ? questionText : "上記から数字で選択してください。"))
    if (Number.isNaN(request)) return null
    if (request > array.length || request < 1) return null
    return request
}
export async function booleanIO(text: string): Promise<boolean> {
    switch (await question(text)) {
        case "y": return true
        case "yes": return true
        case "true": return true
        default: return false
    }
}
export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
export async function question(text: string): Promise<string> {
    const iface =
        readline.createInterface({ input: process.stdin, output: process.stdout })
    return await
        new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
}
export function textLength(string: string) {
  let length = 0
  for (let i = 0; i !== string.length; i++) string[i].match(/[ -~]/) ? length += 1 : length += 2
  return length
}
interface passInfo {
    filename: string,
    extension: string,
    pass: string,
    point: string[]
}
export class progress {
    #viewed: boolean = false
    /**
     * 現在の進行度または最大より小さい値を入力します。
     */
    now: number = 0
    /**
     * 100%を計算するために、最大値または合計値をここに入力します。
     */
    total: number = 0
    /**
     * プログレスバー更新間隔をms秒で入力します。
     */
    interval: number = 100
    /**
     * プログレスバーの左に説明を入れます。
     */
    viewStr: string = "進行中..."
    /**
     * プログレスバーに更なる小さな進行を表すためのものです。
     * メインのnow:2,total:4だとして、このエリアでのnow:3,total:6はnow:2.5,total:4となります。
     */
    relativePercent: {
        now: number,
        total: number
    } = {
            now: 0,
            total: 0
        }
    /**
     * プログレスバーの表示を開始します。
     */
    view() {
        if (!this.#viewed) this.#viewed = true
        this.#view()
    }
    /**
     * プログレスバーの表示をするかを設定します。
     * trueを設定すると自動で表示を開始します。
     */
    set viewed(type: boolean) {
        this.#viewed = type
        if (this.#viewed) this.#view
    }
    async #view() {
        if (!this.#viewed) return
        const windowSize = process.stdout.getWindowSize()
        const percent = this.now / this.total
        const miniPercent = this.relativePercent.now / this.relativePercent.total
        const oneDisplay = this.viewStr + "(" + this.now + "/" + this.total + ") " +
            (percent * 100).toFixed() + "%["
        const twoDisplay = "]"
        let progress = ""
        const length = textLength(oneDisplay) + textLength(twoDisplay)
        const progressLength = windowSize[0] - 3 - length
        const displayProgress = Number((percent * progressLength).toFixed())
        const miniDisplayProgress = Number(((miniPercent / this.total) * progressLength).toFixed())
        for (let i = 0; i < (displayProgress + miniDisplayProgress); i++) progress += "#"
        for (let i = 0; i < progressLength - (displayProgress + miniDisplayProgress); i++) progress += " "
        const display = oneDisplay + progress + twoDisplay
        readline.cursorTo(process.stdout, 0)
        process.stdout.clearLine(0)
        process.stdout.write(display)
        await wait(this.interval)
        this.#view()
    }
}
(async () => {
    const imageSize = Number(await question("指定の画像サイズを入力してください。"))
    if (Number.isNaN(imageSize)) {
        console.log("入力が間違っているようです。最初からやり直してください。")
        return
    }
    const beforePass = await passCheck(await question("変換元の画像フォルダを指定してください。"))
    if (beforePass === null) {
        console.log("入力が間違っているようです。最初からやり直してください。")
        return
    }
    const afterPass = await passCheck(await question("変換先のフォルダを指定してください。(空フォルダ推奨)"))
    if (afterPass === null) {
        console.log("入力が間違っているようです。最初からやり直してください。")
        return
    }
    const nameing = await choice(sharpConvert.type, "命名方法", "上記から命名方法を選択してください。")
    if (nameing === null) {
        console.log("入力が間違っているようです。最初からやり直してください。")
        return
    }
    const folderContain = await booleanIO("フォルダ内にあるフォルダも画像変換に含めますか？yで同意します。")
    const fileList = await fileLister(beforePass.pass, { contain: folderContain, extensionFilter: ["png", "jpg", "jpeg", "tiff"] })
    console.log(
        "変換元パス: " + beforePass.pass + "\n" +
        "変換先パス: " + afterPass.pass + "\n" +
        "変換先サイズ(縦): " + imageSize + "\n" +
        "変換するファイル数: " + fileList.length + "\n" +
        "命名方法: " + sharpConvert.type[nameing - 1]
    )
    const permission = await booleanIO("上記のデータで実行してもよろしいですか？yと入力すると続行します。")
    if (permission) {
        const convert = new sharpConvert()
        convert.afterPass = afterPass.pass
        convert.nameing = nameing - 1
        convert.size = imageSize
        convert.processd = fileList
        const progressd = new progress()
        progressd.viewStr = "変換中"
        progressd.view()
        convert.on("progress", (now, total) => {
            progressd.now = now
            progressd.total = total
        })
        convert.on("end", () => {
            progressd.view()
            progressd.viewed = false
            console.log("\n変換が完了しました。")
        })
        await convert.convert()
    }
})()
