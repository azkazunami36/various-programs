import readline from "readline"
import express from "express"
import fs, { write } from "fs"
import imageSize from "image-size"
import sharp from "sharp"
import ffmpeg from "fluent-ffmpeg"
import Discord from "discord.js"
import net from "net"
import crypto from "crypto"
import EventEmitter from "events"
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
    /**
     * 秒単位のnumberを秒、分、時間、日、年に変換します。
     * 現在はまだ高効率ではありません。
     */
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
        /**
         * timeクラスに前回のデータを引き継ぐ際に使用します。
         */
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
    export async function mkdir(pass: string): Promise<boolean> { return await new Promise<boolean>(resolve => fs.mkdir(pass, err => resolve(err === null))) }
    export async function readFile(pass: string): Promise<Buffer> { return await new Promise<Buffer>(resolve => fs.readFile(pass, (err, data) => resolve(data))) }
    export async function writeFile(pass: string, data: string): Promise<void> { return await new Promise<void>(resolve => fs.writeFile(pass, data, () => resolve())) }
    export function textLength(string: string) {
        let length = 0
        for (let i = 0; i !== string.length; i++) string[i].match(/[ -~]/) ? length += 1 : length += 2
        return length
    }
    export async function passCheck(string: string): Promise<{ pass: string } & fs.Stats> {
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
    export async function question(text: string): Promise<string> {
        const iface =
            readline.createInterface({ input: process.stdin, output: process.stdout })
        return await
            new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
    }
    interface passInfo {
        filename: string,
        extension: string,
        pass: string,
        point: string[]
    }
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
    interface discordBotData {
        client?: Discord.Client,
        programs?: {
            message?: {
                [programName: string]: (message: Discord.Message) => void
            },
            interaction?: {
                [programName: string]: (interaction: Discord.Interaction) => void
            }
        }
    }
    export class discordBots {
        constructor() { }
        static async inits(data: discordBotData) {
            const { Client, GatewayIntentBits, Partials } = Discord
            data.client = new Client({
                intents: [
                    GatewayIntentBits.AutoModerationConfiguration,
                    GatewayIntentBits.AutoModerationExecution,
                    GatewayIntentBits.DirectMessageReactions,
                    GatewayIntentBits.DirectMessageTyping,
                    GatewayIntentBits.DirectMessages,
                    GatewayIntentBits.GuildBans,
                    GatewayIntentBits.GuildEmojisAndStickers,
                    GatewayIntentBits.GuildIntegrations,
                    GatewayIntentBits.GuildInvites,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessageReactions,
                    GatewayIntentBits.GuildMessageTyping,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildPresences,
                    GatewayIntentBits.GuildScheduledEvents,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildWebhooks,
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.MessageContent
                ],
                partials: [
                    Partials.Channel,
                    Partials.GuildMember,
                    Partials.GuildScheduledEvent,
                    Partials.Message,
                    Partials.Reaction,
                    Partials.ThreadMember,
                    Partials.User
                ]
            })
        }
    }
    interface sharpConvertEvents {
        end: void,
        progress: { now: number, total: number }
    }
    export declare interface sharpConvert {
        on<K extends keyof sharpConvertEvents>(s: K, listener: (v: sharpConvertEvents[K]) => any): this;
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
                            this.emit("end")
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
        static type = [
            "[ファイル名].png",
            "[連番] - [ファイル名].png",
            "[元拡張子] - [ファイル名].png",
            "[連番]_[元拡張子] - [ファイル名].png",
            "[連番].png"
        ]
    }
    export class ffmpegConverter extends EventEmitter {
        #ffmpeg: ffmpeg.FfmpegCommand
        constructor(pass: string) {
            super()
            this.#ffmpeg = ffmpeg(pass)
        }
        preset: string[]
        async convert(savePass: string) {
            await new Promise<void>(resolve => {
                this.#ffmpeg.addOptions(this.preset)
                this.#ffmpeg.save(savePass)
                this.#ffmpeg.on("end", () => { resolve() })
                this.#ffmpeg.on('progress', function (progress) {
                    console.log(progress);
                });
            })
        }
        addInput(pass: string) {
            this.#ffmpeg.addInput(pass)
        }
        static async inputPreset(option?: { tagonly?: boolean }): Promise<{ name: string, ext: string, tag: string[] }> {
            console.log("-からタグの入力を始めます。複数を１度に入力してはなりません。検知し警告します。\n空白で続行すると完了したことになります。")
            const presets: string[] = []
            while (true) {
                const string = await question("タグを入力してください。(" + presets.length + "個が登録済み)")
                if (string === "") if (presets.length !== 0) break
                else {
                    if (await booleanIO("タグが１つも登録されていません。このままで予想外の動作をする可能性がありますがよろしいですか？")) break
                    else continue
                }
                if (string[0] !== "-" && !(await booleanIO("最初にハイフンがありません。今後エラーになる恐れがありますが、よろしいですか？"))) continue
                if (string.split("-").length > 2 && !(await booleanIO("ハイフンを２つ以上検知しました。今後エラーになる可能性が否めませんが、よろしいですか？"))) continue
                presets.push(string)
            }
            const extension = await question("保存時に使用する拡張子を入力してください。間違えると今後エラーを起こします。")
            const name = (option ? option.tagonly : false) ? null : await question("プリセット名を入力してください。名前は自由です。")
            return {
                name: name,
                ext: extension,
                tag: presets
            }
        }
    }
    export function kanaConvert(string: string, convertTo: boolean) {
        const array = [
            {
                "key": " ",
                "kana": " "
            },
            {
                "key": " ",
                "kana": "　"
            },
            {
                "key": "1",
                "kana": "ぬ"
            },
            {
                "key": "2",
                "kana": "ふ"
            },
            {
                "key": "3",
                "kana": "あ"
            },
            {
                "key": "4",
                "kana": "う"
            },
            {
                "key": "5",
                "kana": "え"
            },
            {
                "key": "6",
                "kana": "お"
            },
            {
                "key": "7",
                "kana": "や"
            },
            {
                "key": "8",
                "kana": "ゆ"
            },
            {
                "key": "9",
                "kana": "よ"
            },
            {
                "key": "0",
                "kana": "わ"
            },
            {
                "key": "-",
                "kana": "ほ"
            },
            {
                "key": "^",
                "kana": "へ"
            },
            {
                "key": "¥",
                "kana": "ー"
            },
            {
                "key": "q",
                "kana": "た"
            },
            {
                "key": "w",
                "kana": "て"
            },
            {
                "key": "e",
                "kana": "い"
            },
            {
                "key": "r",
                "kana": "す"
            },
            {
                "key": "t",
                "kana": "か"
            },
            {
                "key": "y",
                "kana": "ん"
            },
            {
                "key": "u",
                "kana": "な"
            },
            {
                "key": "i",
                "kana": "に"
            },
            {
                "key": "o",
                "kana": "ら"
            },
            {
                "key": "p",
                "kana": "せ"
            },
            {
                "key": "@",
                "kana": "゛"
            },
            {
                "key": "[",
                "kana": "゜"
            },
            {
                "key": "a",
                "kana": "ち"
            },
            {
                "key": "s",
                "kana": "と"
            },
            {
                "key": "d",
                "kana": "し"
            },
            {
                "key": "f",
                "kana": "は"
            },
            {
                "key": "g",
                "kana": "き"
            },
            {
                "key": "h",
                "kana": "く"
            },
            {
                "key": "j",
                "kana": "ま"
            },
            {
                "key": "k",
                "kana": "の"
            },
            {
                "key": "l",
                "kana": "り"
            },
            {
                "key": ";",
                "kana": "れ"
            },
            {
                "key": ":",
                "kana": "け"
            },
            {
                "key": "]",
                "kana": "む"
            },
            {
                "key": "z",
                "kana": "つ"
            },
            {
                "key": "x",
                "kana": "さ"
            },
            {
                "key": "c",
                "kana": "そ"
            },
            {
                "key": "v",
                "kana": "ひ"
            },
            {
                "key": "b",
                "kana": "こ"
            },
            {
                "key": "n",
                "kana": "み"
            },
            {
                "key": "m",
                "kana": "も"
            },
            {
                "key": ",",
                "kana": "ね"
            },
            {
                "key": ".",
                "kana": "る"
            },
            {
                "key": "/",
                "kana": "め"
            },
            {
                "key": "_",
                "kana": "ろ"
            },
            {
                "key": "!",
                "kana": "ぬ"
            },
            {
                "key": "\"",
                "kana": "ふ"
            },
            {
                "key": "#",
                "kana": "ぁ"
            },
            {
                "key": "$",
                "kana": "ぅ"
            },
            {
                "key": "%",
                "kana": "ぇ"
            },
            {
                "key": "&",
                "kana": "ぉ"
            },
            {
                "key": "'",
                "kana": "ゃ"
            },
            {
                "key": "(",
                "kana": "ゅ"
            },
            {
                "key": ")",
                "kana": "ょ"
            },
            {
                "key": "0",
                "kana": "を"
            },
            {
                "key": "=",
                "kana": "ほ"
            },
            {
                "key": "~",
                "kana": "へ"
            },
            {
                "key": "|",
                "kana": "ー"
            },
            {
                "key": "Q",
                "kana": "た"
            },
            {
                "key": "W",
                "kana": "て"
            },
            {
                "key": "E",
                "kana": "ぃ"
            },
            {
                "key": "R",
                "kana": "す"
            },
            {
                "key": "T",
                "kana": "か"
            },
            {
                "key": "Y",
                "kana": "ん"
            },
            {
                "key": "U",
                "kana": "な"
            },
            {
                "key": "I",
                "kana": "に"
            },
            {
                "key": "O",
                "kana": "ら"
            },
            {
                "key": "P",
                "kana": "せ"
            },
            {
                "key": "`",
                "kana": "゛"
            },
            {
                "key": "{",
                "kana": "「"
            },
            {
                "key": "A",
                "kana": "ち"
            },
            {
                "key": "S",
                "kana": "と"
            },
            {
                "key": "D",
                "kana": "し"
            },
            {
                "key": "F",
                "kana": "は"
            },
            {
                "key": "G",
                "kana": "き"
            },
            {
                "key": "H",
                "kana": "く"
            },
            {
                "key": "J",
                "kana": "ま"
            },
            {
                "key": "K",
                "kana": "の"
            },
            {
                "key": "L",
                "kana": "り"
            },
            {
                "key": "+",
                "kana": "れ"
            },
            {
                "key": "*",
                "kana": "け"
            },
            {
                "key": "}",
                "kana": "」"
            },
            {
                "key": "Z",
                "kana": "っ"
            },
            {
                "key": "X",
                "kana": "さ"
            },
            {
                "key": "C",
                "kana": "そ"
            },
            {
                "key": "V",
                "kana": "ひ"
            },
            {
                "key": "B",
                "kana": "こ"
            },
            {
                "key": "N",
                "kana": "み"
            },
            {
                "key": "M",
                "kana": "も"
            },
            {
                "key": "<",
                "kana": "、"
            },
            {
                "key": ">",
                "kana": "。"
            },
            {
                "key": "?",
                "kana": "・"
            },
            {
                "key": "_",
                "kana": "ろ"
            }
        ]
        const type = convertTo ? 1 : 0

        let outText = ""
        for (let i = 0; i !== string.length; i++) {
            const e = (() => {
                for (let e = 0; e !== array.length; e++)
                    if (string[i] === array[e][((type === 1) ? "key" : "kana")]) return e
                return null
            })()
            if (e !== null) outText += array[e][((type === 1) ? "kana" : "key")]
            else outText += string[i]
        }
        return outText
    }
    interface bouyomiStatus {
        speed?: number
        tone?: number
        volume?: number
        voice?: number
        address?: string
        port?: number
    }
    interface BouyomiEvents {
        ready: void,
        error: Error,
        end: void
    }
    export declare interface Bouyomi {
        on<K extends keyof BouyomiEvents>(s: K, listener: (v: BouyomiEvents[K]) => any): this;
    }
    export class Bouyomi extends EventEmitter {
        #client: net.Socket
        #data: { speed: number, tone: number, volume: number, voice: number, port: number, url: string, code: "utf8" } = {
            speed: -1,
            tone: -1,
            volume: -1,
            voice: 0,
            port: 50001,
            url: "localhost",
            code: "utf8"
        }
        constructor(data: { speed?: number, tone?: number, volume?: number, voice?: number, port?: number, address?: string, ccode?: "utf8" }) {
            super()
            this.speed = data.speed ? data.speed : -1
            this.tone = data.tone ? data.tone : -1
            this.volume = data.volume ? data.volume : -1
            this.voice = data.voice ? data.voice : 0
            this.port = data.port ? data.port : 50001
            this.address = data.address ? data.address : "localhost"
            this.ccode = data.ccode ? data.ccode : "utf8"
            this.#client = new net.Socket()
            const client = this.#client
            client.on("ready", () => this.emit("ready"))
            client.on("error", e => this.emit("error", e))
            client.on("end", () => this.emit("end"))
        }
        set speed(d) {
            d = (d > 200) ? 200 : d
            d = (d < -1) ? -1 : d
            this.#data.speed = d
        }
        get speed() { return this.#data.speed }
        set tone(d) {
            d = (d > 200) ? 200 : d
            d = (d < -1) ? -1 : d
            this.#data.tone = d
        }
        get tone() { return this.#data.tone }
        set volume(d) {
            d = (d > 100) ? 100 : d
            d = (d < -1) ? -1 : d
            this.#data.volume = d
        }
        get volume() { return this.#data.volume }
        set voice(d) {
            d = (d < 0) ? 0 : d
            this.#data.voice = d
        }
        get voice() { return this.#data.voice }
        set port(d) {
            d = (d > 65535) ? 65535 : d
            d = (d < 0) ? 0 : d
            this.#data.port = d
        }
        get port() { return this.#data.port }
        set address(d) { this.#data.url = d }
        get address() { return this.#data.url }
        set ccode(d) { this.#data.code = d }
        get ccode() { return this.#data.code }
        send(msg: string) {
            const client = this.#client
            client.connect(this.#data.port, this.#data.url)
            const Command = Buffer.alloc(2)
            Command.writeInt16LE(1, 0)
            client.write(Command)
            const Speed = Buffer.alloc(2)
            Speed.writeInt16LE(this.#data.speed, 0)
            client.write(Speed)
            const Tone = Buffer.alloc(2)
            Tone.writeInt16LE(this.#data.tone, 0)
            client.write(Tone)
            const Volume = Buffer.alloc(2)
            Volume.writeInt16LE(this.#data.volume, 0)
            client.write(Volume)
            const Voice = Buffer.alloc(2)
            Voice.writeInt16LE(this.#data.voice, 0)
            client.write(Voice)
            const Code = Buffer.alloc(1)
            Code.writeInt8(0, 0)
            client.write(Code)
            const Message = Buffer.from(msg, this.#data.code)
            const Length = Buffer.alloc(4)
            Length.writeInt32LE(Message.length, 0)
            client.write(Length)
            client.write(Message)
            client.end()
        }
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
    interface dataiofiles {
        [fileName: string]: dataiofile
    }
    interface dataiofile {
        attribute: {
            directory: boolean
        }
        data: dataiofiles,
        pass: string,
        smalldata?: {}
    }
    interface dataIOEvents { ready: void }
    export declare interface dataIO {
        on<K extends keyof dataIOEvents>(s: K, listener: (v: dataIOEvents[K]) => any): this;
    }
    export class dataIO extends EventEmitter {
        #operation = false
        #pass: string
        #name: string
        #jsonPass: string
        #folderPass: string
        json: any
        #passIndex: dataiofiles
        constructor(pass: string, programName: string) {
            super()
            passCheck(pass).then(async data => {
                if (data) this.#pass = data.pass
                else throw new Error("パスが間違っています。")
                if (programName === "dataIO") throw new Error("dataIOを利用することは出来ません")
                this.#name = programName
                if (!await exsits(this.#pass + "/dataIO.json")) await writeFile(this.#pass + "/dataIO.json", "[]")
                const dataIOIndex: { [programName: string]: any } = JSON.parse(String(await readFile(this.#pass + "/dataIO.json")))
                if (!dataIOIndex[programName]) dataIOIndex[programName] = true
                await writeFile(this.#pass + "/dataIO.json", JSON.stringify(dataIOIndex))
                this.#jsonPass = this.#pass + "/" + this.#name + ".json"
                this.#folderPass = this.#pass + "/" + this.#name
                const initValue = JSON.stringify({ json: {}, passIndex: {} })
                if (!await exsits(this.#jsonPass)) await writeFile(this.#jsonPass, initValue)
                if (!await exsits(this.#folderPass)) await mkdir(this.#folderPass)
                const rawJSON: {
                    json: {},
                    passIndex: dataiofiles
                } = await JSON.parse(String(await readFile(this.#jsonPass)))
                this.json = rawJSON.json
                this.#passIndex = rawJSON.passIndex
                this.#operation = true
                this.emit("ready")
            })
        }
        static async initer(programName: string): Promise<dataIO> {
            if (programName === "dataIO") {
                console.log("クラス名と同じ名前を使用しないでください。\nこの名前は内部で予約されています。")
                return null
            }
            if (!await exsits("passCache.json")) {
                console.log("passCache.jsonが存在しないため、プログラムを続行することが出来ません。\n設定を行ってください。")
                return null
            }
            const io = new dataIO(JSON.parse(String(await readFile("passCache.json"))), programName)
            await new Promise<void>(resolve => io.on("ready", () => resolve()))
            return io
        }
        get operation() { return this.#operation }
        async passGet(pass: string[], name: string, option?: { extension?: string }): Promise<string> {
            if (!this.#operation) return null
            let extension: string
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
            await writeFile(this.#jsonPass, JSON.stringify({ json: this.json, passIndex: this.#passIndex }))
        }
    }
    export async function cuiIO() {
        const cuiIOtmp: {
            discordJs?: {
                bots?: {
                    [botName: string]: {

                    }
                }
            }
        } = {
            discordJs: {
                bots: {
                    ["kannininshou"]: {}
                }
            }
        }
        const programs: { [programName: string]: () => Promise<void> } = {
            "Image Resize": async () => {
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
                    convert.on("progress", stats => {
                        const { now, total } = stats
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
            },
            "QWERTY Kana Convert": async () => console.log(kanaConvert(await question("変換元のテキストを入力してください。"), await booleanIO("QWERTYからかなに変換しますか？yで変換、nで逆変換します。"))),
            "Discord Bot": async () => {
                const botChoice = await choice(["簡易認証"], "bot一覧", "利用するbotを選択してください。")
                while (true) {
                    const control = await choice(["起動/停止", "直前のログ", "終了"], "利用可能な操作一覧", "利用する機能を選択してください。")
                    if (control === 3) break
                }
            },
            "Time Class": async () => {
                const rawtime = Number(await question("時間を指定してください。"))
                const count = new time()
                count.count(rawtime)
                const year = await booleanIO("年を含めて表示しますか？")
                const days = await booleanIO("日にちを含めて表示しますか？")
                const cou = {
                    year: await question("年の数え方を入力してください。"),
                    days: await question("日にちの数え方を入力してください。"),
                    hour: await question("時間の数え方を入力してください。"),
                    min: await question("分の数え方を入力してください。"),
                    sec: await question("秒の数え方を入力してください。")
                }
                const fill = Number(await question("数字を埋める数を入力してください。"))
                console.log(count.toString({
                    year: year,
                    days: year ? false : days,
                    count: {
                        year: cou.year ? cou.year : undefined,
                        days: cou.days ? cou.days : undefined,
                        hour: cou.hour ? cou.hour : undefined,
                        min: cou.min ? cou.min : undefined,
                        sec: cou.sec ? cou.sec : undefined
                    },
                    fill: (Number.isNaN(fill)) ? undefined : fill
                }))
            },
            "FFmpeg Converter": async () => {
                const data = await dataIO.initer("ffmpeg-converter")
                if (data === null) return
                if (!data.json.presets) data.json.presets = [
                    {
                        name: "h264(品質21-key120)-通常速度",
                        ext: "mp4",
                        tag: [
                            "-c:v libx264",
                            "-c:a aac",
                            "-tag:v avc1",
                            "-pix_fmt yuv420p",
                            "-crf 21",
                            "-g 120"
                        ]
                    },
                    {
                        name: "h264(品質21-key1)-高速処理",
                        ext: "mp4",
                        tag: [
                            "-c:v libx264",
                            "-c:a aac",
                            "-tag:v avc1",
                            "-pix_fmt yuv420p",
                            "-preset ultrafast",
                            "-tune fastdecode,zerolatency",
                            "-crf 21",
                            "-g 1"
                        ]
                    },
                    {
                        name: "h264(リサイズ960x540-品質31-key240)-通常処理",
                        ext: "mp4",
                        tag: [
                            "-c:v libx264",
                            "-c:a aac",
                            "-tag:v avc1",
                            "-vf scale=960x540",
                            "-pix_fmt yuv420p",
                            "-crf 31",
                            "-g 240"
                        ]
                    },
                    {
                        name: "mp3(128kbps)-30db音量上昇用",
                        ext: "mp3",
                        tag: [
                            "-af volume=30dB",
                            "-c:a libmp3lame",
                            "-ar 44100",
                            "-ab 128"
                        ]
                    }
                ]
                const presets: {
                    name: string,
                    ext: string,
                    tag: string[]
                }[] = data.json.presets
                const convertChoice = await choice(["変換を開始する", "プリセットの作成・編集"], "FFmpeg Converter", "利用する機能を選択してください、")
                if (convertChoice === null) {
                    console.log("入力が間違っているようです。最初からやり直してください。")
                    return
                }
                switch (convertChoice) {
                    case 1: {
                        const convertType = await choice(["パスを指定しプリセットで変換", "タグを手入力し、詳細な設定を自分で行う", "複数ファイルを一括変換"], "変換の種類の一覧", "上記から変換の種類を選択してください。")
                        if (convertType === null) {
                            console.log("入力が間違っているようです。最初からやり直してください。")
                            break
                        }
                        switch (convertType) {
                            case 1: {
                                const beforePass = await passCheck(await question("元のソースパスを入力してください。"))
                                if (beforePass === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    break
                                }
                                const afterPass = await passCheck(await question("保存先のフォルダパスを入力してください。"))
                                if (afterPass === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    break
                                }
                                const filename = await question("書き出し先のファイル名を入力してください。")
                                const presetChoice = await choice((() => {
                                    let presetNames: string[] = []
                                    presets.forEach(preset => {
                                        presetNames.push(preset.name)
                                    })
                                    return presetNames
                                })(), "プリセット一覧", "使用するプリセットを選択してください。")
                                console.log(
                                    "変換元: " + beforePass.pass + "\n" +
                                    "変換先: " + afterPass.pass + "/" + filename + "." + presets[presetChoice - 1].ext + "\n" +
                                    "タグ: " + (() => {
                                        let tags = ""
                                        presets[presetChoice - 1].tag.forEach(tag => tags += tag + " ")
                                        return tags
                                    })()
                                )
                                const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                                if (permission) {
                                    const convert = new ffmpegConverter(beforePass.pass)
                                    convert.preset = presets[presetChoice - 1].tag
                                    console.log(convert.preset)
                                    await convert.convert(afterPass.pass + "/" + filename + "." + presets[presetChoice - 1].ext)
                                    console.log("変換が完了しました！")
                                }
                                break
                            }
                            case 2: {
                                const beforePass = await passCheck(await question("元のソースパスを入力してください。"))
                                if (beforePass === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    break
                                }
                                const afterPass = await passCheck(await question("保存先のフォルダパスを入力してください。"))
                                if (afterPass === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    break
                                }
                                const filename = await question("書き出し先のファイル名を入力してください。")
                                const preset = await ffmpegConverter.inputPreset({ tagonly: true })
                                console.log(
                                    "変換元: " + beforePass.pass + "\n" +
                                    "変換先: " + afterPass.pass + "/" + filename + "." + preset.ext + "\n" +
                                    "タグ: " + (() => {
                                        let tags = ""
                                        preset.tag.forEach(tag => tags += tag + " ")
                                        return tags
                                    })()
                                )
                                const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                                if (permission) {
                                    const convert = new ffmpegConverter(beforePass.pass)
                                    convert.preset = preset.tag
                                    console.log(convert.preset)
                                    await convert.convert(afterPass.pass + "/" + filename + "." + preset.ext)
                                    console.log("変換が完了しました！")
                                }
                                break
                            }
                            case 3: {
                                const beforePass = await passCheck(await question("元のフォルダパスを入力してください。"))
                                if (beforePass === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    break
                                }
                                const afterPass = await passCheck(await question("保存先のフォルダパスを入力してください。"))
                                if (afterPass === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    break
                                }
                                const folderContain = await booleanIO("フォルダ内にあるフォルダも変換に含めますか？yで同意します。")
                                const fileList = await fileLister(beforePass.pass, { contain: folderContain, extensionFilter: ["mp4", "mov", "mkv", "avi", "m4v"] })
                                const presetChoice = await choice((() => {
                                    let presetNames: string[] = []
                                    presets.forEach(preset => {
                                        presetNames.push(preset.name)
                                    })
                                    return presetNames
                                })(), "プリセット一覧", "使用するプリセットを選択してください。")
                                console.log(
                                    "変換元: " + beforePass.pass + "\n" +
                                    "変換先: " + afterPass.pass + "\n" +
                                    "タグ: " + (() => {
                                        let tags = ""
                                        presets[presetChoice - 1].tag.forEach(tag => tags += tag + " ")
                                        return tags
                                    })() + "\n" +
                                    "変換するファイル数: " + fileList.length
                                )
                                const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                                if (permission) {
                                    const progressd = new progress()
                                    progressd.viewStr = "変換中"
                                    progressd.view()
                                    progressd.total = fileList.length
                                    for (let i = 0; i != fileList.length; i++) {
                                        progressd.now = i
                                        const convert = new ffmpegConverter(fileList[i].pass + fileList[i].filename + "." + fileList[i].extension)
                                        convert.preset = presets[presetChoice - 1].tag

                                        await convert.convert(afterPass.pass + "/" + (await (async () => {
                                            let outfolders = ""
                                            const point = fileList[i].point
                                            for (let i = 0; i !== point.length; i++) {
                                                outfolders += point[i] + "/"
                                                if (!(await exsits(afterPass.pass + "/" + outfolders))) await mkdir(afterPass.pass + "/" + outfolders)
                                            }
                                            return outfolders
                                        })()) + fileList[i].filename + "." + presets[presetChoice - 1].ext)
                                    }
                                    progressd.now = fileList.length
                                    progressd.view()
                                    progressd.viewed = false
                                }
                                break
                            }
                        }
                        break
                    }
                    case 2: {
                        while (true) {
                            const typeChoice = await choice(["プリセット作成", "プリセット編集", "プリセット一覧を表示", "終了"], "プリセット作成・編集の一覧", "操作したい項目を選択してください。")
                            if (typeChoice === null) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                break
                            } else if (typeChoice === 1) {
                                presets.push(await ffmpegConverter.inputPreset())
                                await data.save()
                            } else if (typeChoice === 2) {
                                if (!presets[0]) {
                                    console.log("プリセットがありません。追加してからもう一度やり直してください。")
                                    continue
                                }
                                const presetChoice = await choice((() => {
                                    let presetNames: string[] = []
                                    presets.forEach(preset => {
                                        presetNames.push(preset.name)
                                    })
                                    return presetNames
                                })(), "プリセット一覧", "編集するプリセットを選択してください。")
                                if (presetChoice === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    continue
                                }
                                const funcChoice = await choice(["タグを修正", "タグを削除", "プリセット名を変更", "プリセットを削除"], "機能一覧", "利用する機能を選択してください。")
                                switch (funcChoice) {
                                    case 1: {
                                        const tagChoice = await choice((() => {
                                            let tags: string[] = []
                                            presets[presetChoice - 1].tag.forEach(tag => tags.push(tag))
                                            return tags
                                        })(), "タグ一覧", "編集するタグを選択してください。")
                                        presets[presetChoice - 1].tag[tagChoice - 1] = await question("新しいタグ名を入力してください。エラー検知はしません。")
                                        break
                                    }
                                    case 2: {
                                        const tagChoice = await choice((() => {
                                            let tags: string[] = []
                                            presets[presetChoice - 1].tag.forEach(tag => tags.push(tag))
                                            return tags
                                        })(), "タグ一覧", "削除するタグを選択してください。")
                                        presets[presetChoice - 1].tag.splice(tagChoice - 1)
                                        break
                                    }
                                    case 3: {
                                        presets[presetChoice - 1].name = await question("新しい名前を入力してください。")
                                        break
                                    }
                                    case 4: {
                                        const permission = await booleanIO("プリセットを削除してもよろしいですか？元に戻すことは出来ません。")
                                        if (permission) presets.splice(presetChoice - 1)
                                    }
                                }
                                await data.save()

                            } else if (typeChoice === 3) {
                                presets.forEach(preset => {
                                    console.log(
                                        "プリセット名: " + preset.name +
                                        "\nタグ: " + (() => {
                                            let tags = ""
                                            preset.tag.forEach(string => tags += string + " ")
                                            return tags
                                        })()
                                    )
                                })
                            } else if (typeChoice === 4) break
                        }
                        break
                    }
                }
            },
            "棒読みちゃん読み上げ": async () => {
                const data = await dataIO.initer("bouyomi")
                if (data === null) return
                if (!data.json.temp) data.json.temp = null
                const msg = await question("読み上げたい内容を入力してください。")
                if (!data.json.temp || !await booleanIO("前回のデータを再利用しますか？")) {
                    const speed = Number(await question("読み上げ速度を入力してください。"))
                    const tone = Number(await question("声の高さを入力してください。"))
                    const volume = Number(await question("声の大きさを入力してください。"))
                    const voice = Number(await question("声の種類を入力してください。"))
                    const address = await question("送信先のアドレスを入力してください。空白でlocalhostです。")
                    const port = Number(await question("ポートを入力してください。空白で50001です。"))
                    data.json.temp = {
                        speed: speed ? speed : -1,
                        tone: tone ? tone : -1,
                        voice: voice ? voice : 0,
                        volume: volume ? volume : -1,
                        address: address ? address : "localhost",
                        port: port ? port : 50001
                    }
                    await data.save()
                }
                const client = new Bouyomi(data.json.temp)
                await new Promise<void>(resolve => {
                    client.on("ready", () => console.log("送信を開始します。"))
                    client.on("error", e => {
                        console.log("理由: " + e + "により通信エラーが発生しました。")
                        resolve()
                    })
                    client.on("end", () => {
                        console.log("送信が完了しました。")
                        resolve()
                    })
                    client.send(msg)
                })
            },
            "Various Programsの状態・設定": async () => {
                const programs: { [programName: string]: () => Promise<void> } = {
                    "プロセスのメモリ使用率": async () => {
                        console.log("メモリ使用率(bytes): " + process.memoryUsage.rss())
                    },
                    "cuiIOデータをRaw表示": async () => {
                        const tmp = JSON.parse(JSON.stringify(cuiIOtmp))
                        delete tmp.cache
                        console.log(
                            "cuiIOtmpに入った不必要なデータは削除されています。\n" +
                            JSON.stringify(tmp, (k, v) => { return v }, "  ")
                        )
                    },
                    "キャッシュデータ等のパス設定": async () => {
                        const data = await exsits("passCache.json") ? JSON.parse(String(await readFile("passCache.json"))) : null
                        console.log("現在のキャッシュパス場所は" + (data ? data + "です。" : "設定されていません。"))
                        const pass = await passCheck(await question("キャッシュデータを保存するパスを入力してください。"))
                        if (pass === null) {
                            console.log("入力が間違っているようです。最初からやり直してください。")
                            return
                        }
                        await writeFile("passCache.json", JSON.stringify(pass.pass))
                        console.log(JSON.parse(String(await readFile("passCache.json"))) + "に変更されました。")
                    }
                }
                const programChoice = await choice(Object.keys(programs), "設定・情報一覧", "実行したい操作を選択してください。")
                if (programChoice === null) {
                    console.log("入力が間違っているようです。最初からやり直してください。")
                    return
                }
                const choiceProgramName = Object.keys(programs)[programChoice - 1]
                await programs[choiceProgramName]()
            },
            "Cryptoによる暗号化": async () => {
                const algorithm = "aes-256-cbc"
                const data = await question("使用する文字列を入力してください。")
                const password = await question("パスワードを入力してください。")
                async function scrypt(password: crypto.BinaryLike, salt: crypto.BinaryLike, keylen: number): Promise<Buffer> {
                    return await new Promise<Buffer>(resolve => { crypto.scrypt(password, salt, keylen, (err, derivedKey) => resolve(derivedKey)) })
                }
                const key = await scrypt(password, data, 32)
                const iv = crypto.randomBytes(16)

                const programs: { [programName: string]: () => Promise<void> } = {
                    "暗号化": async () => {
                        const cipher = crypto.createCipheriv(algorithm, key, iv)
                        const crypted = cipher.update("ここに暗号化する文字列", 'utf-8', 'hex')
                        const crypted_text = crypted + cipher.final('hex')

                        console.log(crypted_text)
                    },
                    "復号化": async () => {
                        const decipher = crypto.createDecipher(algorithm, "ここにパスワード")
                        const decrypted = decipher.update("ここに復号化する文字列", 'hex', 'utf-8')
                        const decrypted_text = decrypted + decipher.final('utf-8')

                        console.log(decrypted_text)
                    }
                }
                const programChoice = await choice(Object.keys(programs), "設定・情報一覧", "実行したい操作を選択してください。")
                if (programChoice === null) {
                    console.log("入力が間違っているようです。最初からやり直してください。")
                    return
                }
                const choiceProgramName = Object.keys(programs)[programChoice - 1]
                await programs[choiceProgramName]()
            }
        }
        console.log(process.env.npm_package_name + " v" + process.env.npm_package_version)
        while (true) {
            const programChoice = await choice(Object.keys(programs), "利用可能なプログラム", "実行したいプログラムを選択してください。")
            if (programChoice === null) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                continue
            }
            const choiceProgramName = Object.keys(programs)[programChoice - 1]
            console.log(choiceProgramName + "を起動します。")
            try {
                await programs[choiceProgramName]()
            } catch (e) {
                console.log("プログラム「" + choiceProgramName + "が以下の理由で異常終了したようです。\n", e)
            }
            console.log(choiceProgramName + "が終了しました。")
        }
    }
    /**
     * expressdは名前の通りexpressを利用しますが、少し変わった点があります。  
     * それは、cuiIOの上位互換だと言うことです。
     * 
     * つまり、cuiIOでのプログラムにアクセスする手段のGUI版と言うことです。
     * そのため、今後cuiIOとguiIOのプログラム内容の同期を行うための、新しい方法を試行錯誤しておきます。
     * が、それまではプログラムは全く別になり、同じ操作方法を保証することはないです。
     */
    export class expressd {
        constructor() { }
        /**
         * 未完成のため、ここの関数で実行されます。
         * もしここの関数のみで完成した場合、classを削除しfunctionに置き換えます。
         * ※sourcedフォルダにデータを入れていますが、main.jsのプログラムを全てここに入れ終えたら、sourcesに名前を変更します。
         */
        static async main(): Promise<void> {
            const app = express()
            app.get("", async (req, res) => {
                /**
                 * リクエスト(要求)された場所
                 */
                const url = req.url
                /**
                 * 応答の種類です。
                 * sourcesフォルダにアクセスするか、その他のデータにアクセスするかを確認し、それに合ったプログラムを実行します。
                 * pass内に「/」で分割し、それを利用してファイル先へアクセスする手がかりにします。
                 * 戻り値にファイルパスを入れる必要があります。
                 */
                const type: { [type: string]: (pass: string[]) => Promise<string> } = {
                    "sources": async pass => {
                        return ""
                    }
                }
                const passArray = url.split("/")
                const passdata = await type[passArray[1]]([...passArray])
            })
        }
    }
}
(async () => {
    sumtool.cuiIO() //コンソール画面で直接操作するためのプログラムです。
    sumtool.expressd.main() //ブラウザ等から直感的に操作するためのプログラムです。
})()
