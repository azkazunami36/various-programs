import readline from "readline"
import express from "express"
import fs from "fs"
import imageSize from "image-size"
import sharp from "sharp"
/**
 * various-programsのGUIを作成するのが、かなり難しい状態になったため、まずはCUIから作ることにいたします。
 * CUIでもGUIのような使い勝手の良さを実感してください。
 * 改良や機能追加が楽になるように設計いたします。
 */

namespace sumtool {
    interface tempTime {
        sec: number,
        secRaw: number
        min: number,
        minRaw: number,
        hour: number,
        hourRaw: number,
        days: number,
        daysRaw: number,
        year: number,
        convertTime: number
    }
    interface toStringOption {
        days?: boolean,
        year?: boolean,
        count?: {
            sec?: string,
            min?: string,
            hour?: string,
            days?: string,
            year?: string
        }
        fill?: number
        timeString?: number
    }
    export class time {
        #sec = 0
        #secRaw = 0
        #min = 0
        #minRaw = 0
        #hour = 0
        #hourRaw = 0
        #days = 0
        #daysRaw = 0
        #year = 0
        #convertTime = 0
        constructor(rawData?: tempTime) {
            if (rawData) {
                this.#sec = rawData.sec,
                    this.#secRaw = rawData.secRaw,
                    this.#min = rawData.min,
                    this.#minRaw = rawData.minRaw,
                    this.#hour = rawData.hour,
                    this.#hourRaw = rawData.hourRaw,
                    this.#days = rawData.days,
                    this.#daysRaw = rawData.daysRaw,
                    this.#year = rawData.year,
                    this.#convertTime = rawData.convertTime
            }
        }
        /**
         * 入力した値分のms時間要します。
         * ```typescript
         * (async() => {
         *     const time = new sumtool.time()
         *     await time.count(1000) //１秒以上の計算を要します。
         *     console.log(time.toString()) //16分40秒
         * })()
         * ```
         */
        async count(seconds: number) {
            const converttime = Date.now()
            const up = Math.sign(seconds)
            let num = 0
            if (up === 1) while (num < seconds) {
                this.setting(true)
                num++
                await wait(1)
            }
            if (up === -1) while (seconds < num) {
                this.setting(false)
                num--
                await wait(1)
            }
            this.#convertTime = Date.now() - converttime
            return { toJSON: this.toJSON, toString: this.toString }
        }
        setting(up: boolean) {
            if (up) {
                this.#sec++
                this.#secRaw++
                if (this.#sec === 60) {
                    this.#sec = 0
                    this.#min++
                    this.#minRaw++
                } else return
                if (this.#min === 60) {
                    this.#min = 0
                    this.#hour++
                    this.#hourRaw++
                } else return
                if (this.#hour === 24) {
                    this.#hour = 0
                    this.#days++
                    this.#daysRaw++
                } else return
                if (this.#days === 365) {
                    this.#days = 0
                    this.#year++
                }
            } else {
                this.#sec--
                this.#secRaw--
                if (this.#sec === -1) {
                    this.#sec = 59
                    this.#min--
                    this.#minRaw--
                } else return
                if (this.#min === -1) {
                    this.#min = 59
                    this.#hour--
                    this.#hourRaw--
                } else return
                if (this.#hour === -1) {
                    this.#hour = 23
                    this.#days--
                    this.#daysRaw--
                } else return
                if (this.#days === -1) {
                    this.#days = 364
                    this.#year--
                }
            }
            return up
        }
        toString(option?: toStringOption) {
            const outputRaw = { days: false, year: false }
            const fill = {
                fillnum: 1
            }
            const counter = { sec: "秒", min: "分", hour: "時間", days: "日", year: "年" }
            if (option !== undefined) {
                if (option.days) outputRaw.days = true
                if (option.year) outputRaw.year = true, outputRaw.days = true
                if (option.count !== undefined) {
                    const count = option.count
                    if (count.year !== undefined) counter.year = count.year
                    if (count.days !== undefined) counter.days = count.days
                    if (count.hour !== undefined) counter.hour = count.hour
                    if (count.min !== undefined) counter.min = count.min
                    if (count.sec !== undefined) counter.sec = count.sec
                }
                if (option.fill !== undefined) fill.fillnum = option.fill
            }
            const sec = this.#sec
            const min = this.#min
            const hour = outputRaw.days ? this.#hour : this.#hourRaw
            const days = outputRaw.year ? this.#days : this.#daysRaw
            const year = this.#year
            let timeString = 0
            if (min !== 0) timeString = 1
            if (hour !== 0) timeString = 2
            if (outputRaw.days && days !== 0) timeString = 3
            if (outputRaw.year && year !== 0) timeString = 4
            if (option.timeString !== undefined) timeString = option.timeString
            return (3 < timeString ? numfiller(year, fill.fillnum) + counter.year : "") +
                (2 < timeString ? numfiller(days, fill.fillnum) + counter.days : "") +
                (1 < timeString ? numfiller(hour, fill.fillnum) + counter.hour : "") +
                (0 < timeString ? numfiller(min, fill.fillnum) + counter.min : "") +
                numfiller(sec, fill.fillnum) + counter.sec
        }
        toJSON(): tempTime {
            return {
                sec: this.#sec,
                secRaw: this.#secRaw,
                min: this.#min,
                minRaw: this.#minRaw,
                hour: this.#hour,
                hourRaw: this.#hourRaw,
                days: this.#days,
                daysRaw: this.#daysRaw,
                year: this.#year,
                convertTime: this.#convertTime
            }
        }
    }
    export function numfiller(number: number, fillnum: number, option?: { overflow?: boolean }): string {
        let overflow = true
        if (option !== undefined) {
            if (option.overflow !== undefined) overflow = option.overflow
        }
        let fillString = ""
        let fillNum = 0
        const numRawLen = String(number).length
        for (let i = 0; i !== ((overflow && numRawLen > fillnum) ? numRawLen : fillnum); i++) {
            fillString += "0"
            fillNum--
        }
        return (fillString + number.toFixed()).slice(fillNum)
    }
    export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
    export async function exsits(pass: string): Promise<Boolean> { return await new Promise(resolve => { fs.access(pass, err => resolve(err === null)) }) }
    export function textLength(string: string) {
        let length = 0
        for (let i = 0; i !== string.length; i++) string[i].match(/[ -~]/) ? length += 1 : length += 2
        return length
    }
    export async function passCheck(string: string): Promise<{ pass: string } & fs.Stats> {
        const pass = await (async () => {
            const passArray = string.split("/")
            let passtmp = ""
            for (let i = 0; i != passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
            if (await exsits(passtmp)) return passtmp
            while (passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
            if (await exsits(passtmp)) return passtmp
            passtmp = passtmp.replace(/\\ /i, " ")
            if (await exsits(passtmp)) return passtmp
            return null
        })()
        if (!pass) return null
        const stats: fs.Stats = await new Promise(resolve => fs.stat(pass, (err, stats) => resolve(stats)))
        return { pass: pass, ...stats }
    }
    export async function choice(title: string, int: string, array: string[]): Promise<number | null> {
        console.log(title + ": ")
        for (let i = 0; i !== array.length; i++) console.log("[" + (i + 1) + "] " + array[i])
        const request = Number(await question(int))
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
    export async function question(text: string): Promise<string> {
        const iface =
            readline.createInterface({ input: process.stdin, output: process.stdout })
        return await
            new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
    }
    export async function fileLister(pass: string, option?: { contain?: boolean, extensionFilter?: string[] }) {
        let contain = false
        let extensionFilter: string[] = []
        if (option !== undefined) {
            if (option.contain) contain = true
            if (option.extensionFilter !== undefined) extensionFilter = option.extensionFilter
        }
        const processd: {
            filename: string,
            extension: string,
            pass: string,
            point: string[]
        }[] = []
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
                    const extension = namedot[namedot.length - 1];
                    if ((() => {
                        if (extensionFilter[0]) {
                            for (let i = 0; i !== extensionFilter.length; i++)
                                if (extensionFilter[i].match(new RegExp(extension, "i"))) return true
                                else return false
                        }
                        else return true
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
    export class sharpConvert {
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
            this.#interval = setInterval(() => this.#progressCallback(this.#convertPoint, this.processd.length), 100)
        }
        #progressCallback: (now: number, total: number) => void = () => { }
        progress(callback: (now: number, total: number) => void) { this.#progressCallback = callback }
        #end: () => void = () => { }
        end(callback: () => void) { this.#end = callback }
        async convert() {
            await new Promise<void>(resolve => {
                const convert = async () => {
                    if (this.#converting === this.#maxconvert) return
                    if (this.#convertPoint === this.processd.length) {
                        if (this.#converting === 0) {
                            this.#end()
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
                        if (!fs.existsSync(this.afterPass + "/" + outfolders)) fs.mkdirSync(this.afterPass + "/" + outfolders)
                    }
                    const Stream = fs.createWriteStream(this.afterPass + "/" + outfolders + [
                        this.processd[i].filename,
                        (i + 1) + " - " + this.processd[i].filename,
                        this.processd[i].extension + " - " + this.processd[i].filename,
                        (i + 1) + "_" + this.processd[i].extension + " - " + this.processd[i].filename,
                        i + 1,
                    ][this.nameing] + ".png")
                    this.#progressCallback(this.#convertPoint, this.processd.length)
                    await new Promise(async resolve => {
                        const imageW = imageSize(this.processd[i].pass + fileName).width
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
    }
    export async function cuiIO() {
        while (true) {
            const programChoice = await choice("利用可能なプログラム", "実行したいプログラムを選択してください。", ["Image Resize"])
            switch (programChoice) {
                case 1: {
                    const imageSize = Number(await question("指定の画像サイズを入力してください。"))
                    if (Number.isNaN(imageSize)) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        break
                    }
                    const beforePass = await passCheck(await question("変換元の画像フォルダを指定してください。"))
                    if (beforePass === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        break
                    }
                    const afterPass = await passCheck(await question("変換先のフォルダを指定してください。(空フォルダ推奨)"))
                    if (afterPass === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        break
                    }
                    const type = [
                        "[ファイル名].png",
                        "[連番] - [ファイル名].png",
                        "[元拡張子] - [ファイル名].png",
                        "[連番]_[元拡張子] - [ファイル名].png",
                        "[連番].png"
                    ]
                    const nameing = await choice("命名方法", "上記から命名方法を選択してください。", type)
                    if (nameing === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        break
                    }
                    const folderContain = await booleanIO("フォルダ内にあるフォルダも画像変換に含めますか？yで同意します。")
                    const fileList = await fileLister(beforePass.pass, { contain: folderContain, extensionFilter: ["png", "jpg", "jpeg", "tiff"] })
                    console.log(
                        "変換元パス: " + beforePass.pass + "\n" +
                        "変換先パス: " + afterPass.pass + "\n" +
                        "変換先サイズ(縦): " + imageSize + "\n" +
                        "変換するファイル数: " + fileList.length + "\n" +
                        "命名方法: " + type[nameing]
                    )
                    const permission = await booleanIO("上記のデータで実行してもよろしいですか？yと入力すると続行します。")
                    if (permission) {
                        const convert = new sharpConvert()
                        convert.afterPass = afterPass.pass
                        convert.nameing = nameing
                        convert.size = imageSize
                        convert.processd = fileList
                        convert.progress((now, total) => {
                            const windowSize = process.stdout.getWindowSize()
                            const percent = now / total
                            const oneDisplay = "変換中(" + now + "/" + total + ") " +
                                (percent * 100).toFixed() + "%["
                            const twoDisplay = "]"
                            let progress = ""
                            let length = textLength(oneDisplay) + textLength(twoDisplay)
                            const progressLength = windowSize[0] - 3 - length
                            const displayProgress = Number((percent * progressLength).toFixed())
                            for (let i = 0; i < displayProgress; i++) progress += "#"
                            for (let i = 0; i < progressLength - displayProgress; i++) progress += " "
                            const display = oneDisplay + progress + twoDisplay
                            readline.cursorTo(process.stdout, 0)
                            process.stdout.clearLine(0)
                            process.stdout.write(display)
                        })
                        convert.end(() => {
                            console.log("\n変換が完了しました。")
                        })
                        await convert.convert()
                    }
                    break
                }
            }
        }
    }
}
(async () => {
    sumtool.cuiIO()
})()
