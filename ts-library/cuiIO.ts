import fs from "fs"
import Discord from "discord.js"
import crypto from "crypto"
import readline from "readline"

import sfs from "./fsSumwave.js"
import time from "./time.js"
import dataIO from "./dataIO.js"
import sharpConvert from "./sharpConvert.js"
import kanaConvert from "./kanaConvert.js"
import discordBot from "./discord-bot.js"
import ffmpegConverter from "./ffmpegConverter.js"
import bouyomi from "./bouyomi.js"
import vpManageClass from "./vpManageClass.js"
import handyTool from "./handyTool.js"

/**
 * # Console UI Programs
 * 便利なツールが集まっています。ここの仕様を変更すると、様々な操作感覚の違いが発生します。
 */
export namespace consoleUIPrograms {
    /**
     * ユーザーから文字列を受け取ります。
     * @param text ユーザーへの質問文を入力します。
     * @returns 
     */
    export async function question(text: string): Promise<string> {
        const iface = readline.createInterface({ input: process.stdin, output: process.stdout })
        return await new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
    }
    /**
     * 文字列配列からユーザー入力を利用し番号を選択させます。
     * @param array 文字列配列を入力します。
     * @param title 文字列配列の意図を入力します。
     * @param questionText 質問文を入力します。
     * @param manyNumNotDetected 配列以外の数字を選択された際にundefinedを返さないかどうかを決定します。
     * @returns 
     */
    export async function choice(array: string[], title?: string, questionText?: string, manyNumNotDetected?: boolean): Promise<number | undefined> {
        console.log((title ? title : "一覧") + ": ")
        for (let i = 0; i !== array.length; i++) console.log("[" + (i + 1) + "] " + array[i])
        const request = Number(await question(questionText ? questionText : "上記から数字で選択してください。"))
        if (Number.isNaN(request)) return
        if (!manyNumNotDetected && request > array.length || request < 1) return
        return request
    }
    /**
     * ユーザーの文字列からture、falseを決定します。
     * @param text ユーザーへの質問文を入力します。
     * @returns 
     */
    export async function booleanIO(text: string): Promise<boolean> {
        switch (await question(text)) {
            case "y": return true
            case "yes": return true
            case "true": return true
            case "ok": return true
            default: return false
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
         * 例でいう50%から51%の間の処理状況が具現化できます。
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
                ((percent ? percent : 0) * 100).toFixed() + "%["
            const twoDisplay = "]"
            let progress = ""
            const length = handyTool.textLength(oneDisplay) + handyTool.textLength(twoDisplay)
            const progressLength = windowSize[0] - 3 - length
            const displayProgress = Number((((percent ? percent : 0) + ((miniPercent ? miniPercent : 0) / this.total)) * progressLength).toFixed())
            for (let i = 0; i < displayProgress; i++) progress += "#"
            for (let i = 0; i < progressLength - (displayProgress); i++) progress += " "
            const display = oneDisplay + progress + twoDisplay
            readline.cursorTo(process.stdout, 0)
            process.stdout.clearLine(0)
            process.stdout.write(display)
            await handyTool.wait(this.interval)
            this.#view()
        }
    }
    /**
     * プログラムをユーザーが選択するための簡易クラスです。プログラムの選択肢として簡潔にし、確定されると自動で実行されます。
     * ```ts
     * const fc = new funcSelect({
     *   "program": async () => {
     *     console.log()
     *   }
     * })
     * ```
     */
    export class funcSelect {
        /**
         * ユーザーに表示するメッセージを入力します。
         */
        message: {
            topMsg?: string,
            userToMsg?: string
        } = {}
        /**
         * プログラム選択にこの関数を使用した場合、エラー時の特定となる名前を決定してください。
         */
        selectingFuncName: string = ""
        /**
         * catchされたエラーをコンソールに直接出力しますか？※開発者向け
         */
        errorView: boolean = false
        /**
         * 繰り返しプログラム選択を刺せるかどうかを設定します。
         * この場合、クラス内のendを手動でtrueに置き換えることによってループを終了できます。
         */
        loop: boolean = false
        /**
         * loopが有効になっている場合、これをtrueにすると停止します。
         */
        end: boolean = false
        functions: {
            [programName: string]: (() => Promise<void>)
        } = {}
        constructor(
            functions: {
                [programName: string]: (() => Promise<void>)
            },
            option?: {
                /**
                 * ユーザーに表示するメッセージを入力します。
                 */
                message?: {
                    topMsg?: string,
                    userToMsg?: string
                },
                /**
                 * プログラム選択にこの関数を使用した場合、エラー時の特定となる名前を決定してください。
                 */
                selectingFuncName?: string,
                /**
                 * catchされたエラーをコンソールに直接出力しますか？※開発者向け
                 */
                errorView?: boolean,
                /**
                 * 繰り返しプログラム選択を刺せるかどうかを設定します。
                 * この場合、クラス内のendを手動でtrueに置き換えることによってループを終了できます。
                 */
                loop?: boolean
            }
        ) {
            this.functions = functions
            if (option) {
                if (option.message) this.message = option.message
                if (option.selectingFuncName) this.selectingFuncName = option.selectingFuncName
                if (option.errorView) this.errorView = option.errorView
                if (option.loop) this.loop = option.loop
            }
        }
        async view() {
            let stats = false
            while (!this.end) {
                const programChoice = await choice(
                    Object.keys(this.functions),
                    this.message.topMsg ? this.message.topMsg : "利用可能な操作一覧",
                    this.message.userToMsg ? this.message.userToMsg : "利用する機能を選択してください。"
                )
                if (!programChoice) {
                    console.log("選択された番号は利用できません。最初からやり直してください。")
                    stats = false
                    continue
                }
                const choiceProgramName = Object.keys(this.functions)[programChoice - 1]
                try {
                    await this.functions[choiceProgramName]()
                    stats = true
                } catch (e) {
                    console.log("「" + choiceProgramName + "」でエラーを確認しました。" + (this.selectingFuncName ? "名称:" + this.selectingFuncName : ""))
                    if (this.errorView) console.log(e)
                    stats = false
                }
                if (!this.loop) this.loop = true
            }
            return stats
        }
    }
}

const { question, choice, booleanIO, progress, funcSelect } = consoleUIPrograms

/**
 * # cuiIO
 * もっとも単純かつ安定したCUI操作プログラムです。グラフィック要素のない簡易関数は全てここで動作させることが出来ます。
 * @param shareData 
 */
export async function cuiIO(shareData: vpManageClass.shareData) {
    if (!shareData.cuiIO) shareData.cuiIO = {}
    shareData.cuiIO.funcSelect = new funcSelect({
        "Image Resize": async () => {
            const imageSize = Number(await question("指定の画像サイズを入力してください。"))
            if (Number.isNaN(imageSize)) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            const beforePass = await dataIO.pathChecker(await question("変換元の画像フォルダを指定してください。"))
            if (!beforePass) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            const afterPass = await dataIO.pathChecker(await question("変換先のフォルダを指定してください。(空フォルダ推奨)"))
            if (!afterPass) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            const nameing = await choice(sharpConvert.type, "命名方法", "上記から命名方法を選択してください。")
            if (!nameing) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            const type = await choice(sharpConvert.extType, "拡張子一覧", "利用する拡張子と圧縮技術を選択してください。")
            if (!type) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            if (type !== 1 && type !== 2) {
                console.log("プログラム内で予期せぬエラーを回避するため、中断されました。")
                return
            }
            const folderContain = await booleanIO("フォルダ内にあるフォルダも画像変換に含めますか？yで同意します。")
            const invFileIgnore = await booleanIO("最初に「.」が付くファイルを省略しますか？")
            const listerOptions = {
                macOSFileIgnote: false
            }
            if (!invFileIgnore) {
                listerOptions.macOSFileIgnote = await booleanIO("macOSに使用される「._」から始まるファイルを除外しますか？")
            }
            const fileList = await dataIO.fileLister(beforePass, { contain: folderContain, extensionFilter: ["png", "jpg", "jpeg", "tiff"], invFIleIgnored: invFileIgnore, macosInvIgnored: listerOptions.macOSFileIgnote })
            if (!fileList) {
                console.log("ファイルの取得ができなかったようです。")
                return
            }
            console.log(
                "変換元パス: " + dataIO.slashPathStr(beforePass) + "\n" +
                "変換先パス: " + dataIO.slashPathStr(afterPass) + "\n" +
                "変換先サイズ(縦): " + imageSize + "\n" +
                "変換するファイル数: " + fileList.length + "\n" +
                "命名方法: " + sharpConvert.type[nameing - 1] + "\n" +
                "拡張子タイプ: " + sharpConvert.extType[type - 1] + "\n" +
                "ファイル除外方法: " + (() => {
                    const ignoreStrings: string[] = []
                    if (invFileIgnore) ignoreStrings.push("末端に「.」が付いたファイルを除外")
                    if (listerOptions.macOSFileIgnote) ignoreStrings.push("末端に「._」が付いたファイルを除外")
                    let str = ""
                    for (let i = 0; i !== ignoreStrings.length; i++) {
                        if (i !== 0) str += "、"
                        str += ignoreStrings[i]
                    }
                    if (str === "") return "除外しない"
                    return str
                })()
            )
            const permission = await booleanIO("上記のデータで実行してもよろしいですか？yと入力すると続行します。")
            if (permission) {
                const convert = new sharpConvert()
                convert.afterPass = afterPass
                convert.nameing = nameing - 1
                convert.size = imageSize
                convert.processd = fileList
                convert.type = (type === 1) ? 0 : 1
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
                convert.on("error", e => {
                    console.log("エラーを確認しました。: ", e)
                })
                await convert.convert()
            }
        },
        "QWERTY Kana Convert": async () => {
            console.log(kanaConvert(await question("変換元のテキストを入力してください。"), await booleanIO("QWERTYからかなに変換しますか？yで変換、nで逆変換します。")))
        },
        "Discord Bot": async () => {
            const fc = new funcSelect({
                "botを利用する": async () => {
                    const data = await discordBot.outputJSON()
                    if (!data) {
                        console.log("データの準備ができませんでした。")
                        return
                    }
                    const botNames = Object.keys(data)
                    if (botNames.length === 0) {
                        console.log("botが存在しません。新規作成をしてから実行してください。")
                        return
                    }
                    const botChoice = await choice(botNames, "bot一覧", "利用するbotを選択してください。")
                    if (!botChoice) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    if (!shareData.discordBot) shareData.discordBot = {}
                    if (!shareData.discordBot[botNames[botChoice - 1]]) shareData.discordBot[botNames[botChoice - 1]] = {
                        name: botNames[botChoice - 1]
                    }
                    const bot = await discordBot.initer(shareData.discordBot[botNames[botChoice - 1]])
                    const fc = new funcSelect({
                        "起動/停止": async () => {
                            if (!bot.botStatus) {
                                await bot.login()
                                if (bot.botStatus) console.log("ログインしました。")
                                else console.log("ログインできませんでした。")
                            } else {
                                await bot.logout()
                                if (!bot.botStatus) console.log("ログアウトに成功しました。")
                                else console.log("ログアウトできませんでした。")
                            }
                        },
                        "設定": async () => {
                            const fc = new funcSelect({
                                "Tokenを設定する": async () => {
                                    const token = await question("Tokenを入力してください。")
                                    await bot.token(token)
                                    console.log("設定が完了しました。")
                                },
                                "プログラムの選択": async () => {
                                    console.log(await (async () => {
                                        const list = bot.programsNameList
                                        let str = ""
                                        const data = await discordBot.outputJSON()
                                        if (!data) {
                                            console.log("データの準備ができませんでした。")
                                            return str
                                        }
                                        for (let i = 0; i !== list.length; i++) str += (str ? "、" : "") + list[i]
                                        return str
                                    })() + "が既にBotに関連付けられています。")
                                    const programChoice = await choice(bot.programsNameList, "Bot用プリインストールプログラム一覧", "プログラムを選択してください。")
                                    if (!programChoice) {
                                        console.log("入力が間違っているようです。最初からやり直してください。")
                                        return
                                    }
                                    const programName = bot.programsNameList[programChoice - 1]
                                    const fc = new funcSelect({
                                        "追加": async () => {
                                            console.log(await bot.programSetting.add(programName) ? "追加が完了しました。" : "何かしらの理由により、追加がスキップされました。")
                                        },
                                        "削除": async () => {
                                            console.log(await bot.programSetting.remove(programName) ? "削除が完了しました。" : "何かしらの理由により、削除がスキップされました。")
                                        },
                                        "戻る": async () => { fc.end = true }
                                    })
                                    fc.message.topMsg = "「" + programName + "」が選択されました。Botに加えたい変更を選択してください。"
                                    fc.selectingFuncName = "DiscordBotのプログラム選択画面"
                                    fc.errorView = true
                                    await fc.view()
                                },
                                "戻る": async () => { fc.end = true }
                            })
                            await fc.view()
                        },
                        "戻る": async () => {
                            fc.end = true
                        }
                    })
                    fc.selectingFuncName = "選択されたbotのホームメニュー"
                    fc.loop = true
                    await fc.view()
                },
                "botの新規作成": async () => {
                    const name = await question("botの名前を入力してください。")
                    if (name === "") {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    if (!shareData.discordBot) shareData.discordBot = {}
                    if (!shareData.discordBot[name]) shareData.discordBot[name] = {
                        name: name
                    }
                    await discordBot.initer(shareData.discordBot[name])
                    console.log("botの生成が完了しました。\nbotの細かな設定を「botを利用する」から行い、Token等の設定をしてください。")
                },
                "botの削除": async () => {
                    console.log("現在、botの削除を行うことが出来ません。botの動作中に削除を行った際にエラーが発生する可能性を否めません。")
                },
                "終了": async () => {
                    fc.end = true
                }
            })
            fc.loop = true
            await fc.view()
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
            if (!shareData.ffmpegConverter) shareData.ffmpegConverter = await ffmpegConverter.initer()
            const convert = shareData.ffmpegConverter
            const fc = new funcSelect({
                "変換を開始する": async () => {
                    const fc = new funcSelect({
                        "パスを指定しプリセットで変換": async () => {
                            const beforePass = await dataIO.pathChecker(await question("元のソースパスを入力してください。"))
                            if (!beforePass) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            const afterPass = await dataIO.pathChecker(await question("保存先のフォルダパスを入力してください。"))
                            if (!afterPass) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            const filename = await (async () => {
                                let filename = await question("書き出し先のファイル名を入力してください。")
                                if (filename === "") filename = dataIO.splitExt(beforePass[beforePass.length - 1]).filename
                                return filename
                            })()
                            const presetChoice = await choice((() => {
                                let presetNames: (string)[] = []
                                convert.data.json.preset.forEach(preset => {
                                    presetNames.push(preset.name ? preset.name : "")
                                })
                                return presetNames
                            })(), "プリセット一覧", "使用するプリセットを選択してください。")
                            if (!presetChoice) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            console.log(
                                "変換元: " + dataIO.slashPathStr(beforePass) + "\n" +
                                "変換先: " + dataIO.slashPathStr(afterPass) + "/" + filename + "." + convert.data.json.preset[presetChoice - 1].ext + "\n" +
                                "タグ: " + (() => {
                                    let tags = ""
                                    convert.data.json.preset[presetChoice - 1].tag.forEach(tag => tags += tag + " ")
                                    return tags
                                })()
                            )
                            const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                            if (permission) {
                                if (await sfs.exsits(dataIO.slashPathStr(afterPass) + "/" + filename + "." + convert.data.json.preset[presetChoice - 1].ext))
                                    if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) return
                                await convert.convert([{
                                    oldPass: beforePass,
                                    newPass: [...afterPass, + filename + "." + convert.data.json.preset[presetChoice - 1].ext],
                                    preset: convert.data.json.preset[presetChoice - 1]
                                }])
                                console.log("変換が完了しました！")
                            }
                        },
                        "タグを手入力し、詳細な設定を自分で行う": async () => {
                            const beforePass = await dataIO.pathChecker(await question("元のソースパスを入力してください。"))
                            if (!beforePass) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            const afterPass = await dataIO.pathChecker(await question("保存先のフォルダパスを入力してください。"))
                            if (!afterPass) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            const filename = await question("書き出し先のファイル名を入力してください。")
                            const preset = await getFunction.ffmpegInputPreset({ tagonly: true })
                            console.log(
                                "変換元: " + dataIO.slashPathStr(beforePass) + "\n" +
                                "変換先: " + dataIO.slashPathStr(afterPass) + "/" + filename + "." + preset.ext + "\n" +
                                "タグ: " + (() => {
                                    let tags = ""
                                    preset.tag.forEach(tag => tags += tag + " ")
                                    return tags
                                })()
                            )
                            const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                            if (permission) {
                                if (await sfs.exsits(dataIO.slashPathStr(afterPass)))
                                    if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) return
                                await convert.convert([{
                                    oldPass: beforePass,
                                    newPass: [...afterPass, filename + "." + preset.ext],
                                    preset: preset
                                }])
                                console.log("変換が完了しました！")
                            }
                        },
                        "複数ファイルを一括変換": async () => {
                            const beforePass = await dataIO.pathChecker(await question("元のフォルダパスを入力してください。"))
                            if (!beforePass) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            const afterPass = await dataIO.pathChecker(await question("保存先のフォルダパスを入力してください。"))
                            if (!afterPass) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            const folderContain = await booleanIO("フォルダ内にあるフォルダも変換に含めますか？yで同意します。")
                            const invFileIgnore = await booleanIO("最初に「.」が付くファイルを省略しますか？")
                            const listerOptions = { macOSFileIgnote: false }
                            if (!invFileIgnore) listerOptions.macOSFileIgnote = await booleanIO("macOSに使用される「._」から始まるファイルを除外しますか？")
                            const fileList = await dataIO.fileLister(beforePass, {
                                contain: folderContain,
                                extensionFilter: ["mp4", "mov", "mkv", "avi", "m4v", "mts", "mp3", "m4a", "wav", "opus", "caf", "aif", "aiff", "m4r", "alac", "flac", "3gp", "3g2", "webm", "aac", "hevc"],
                                invFIleIgnored: invFileIgnore,
                                macosInvIgnored: listerOptions.macOSFileIgnote
                            })
                            const presetChoice = await choice((() => {
                                let presetNames: string[] = []
                                convert.data.json.preset.forEach(preset => {
                                    presetNames.push(preset.name ? preset.name : "")
                                })
                                return presetNames
                            })(), "プリセット一覧", "使用するプリセットを選択してください。")
                            if (!presetChoice) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            console.log(
                                "変換元: " + dataIO.slashPathStr(beforePass) + "\n" +
                                "変換先: " + dataIO.slashPathStr(afterPass) + "\n" +
                                "タグ: " + (() => {
                                    let tags = ""
                                    convert.data.json.preset[presetChoice - 1].tag.forEach(tag => tags += tag + " ")
                                    return tags
                                })() + "\n" +
                                "変換するファイル数: " + fileList.length
                            )
                            const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                            if (permission) {
                                for (let i = 0; i != fileList.length; i++) {
                                    const oldPath = await dataIO.pathChecker(fileList[i].pass)
                                    const newPath = await dataIO.pathChecker(afterPass)
                                    if (oldPath && newPath) {
                                        const reNewPath = [...newPath, (await (async () => {
                                            let outfolders = []
                                            const point = fileList[i].point
                                            for (let i = 0; i !== point.length; i++) {
                                                outfolders.push(point[i])
                                                if (!(await sfs.exsits(dataIO.slashPathStr(afterPass) + "/" + outfolders))) await sfs.mkdir(dataIO.slashPathStr(afterPass) + "/" + outfolders)
                                            }
                                            return outfolders
                                        })()) + fileList[i].filename + "." + convert.data.json.preset[presetChoice - 1].ext]
                                        if (await sfs.exsits(dataIO.slashPathStr(reNewPath)))
                                            if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) continue
                                        await convert.convert([{
                                            oldPass: [...oldPath, + fileList[i].filename + "." + fileList[i].extension],
                                            newPass: reNewPath,
                                            preset: convert.data.json.preset[presetChoice - 1]
                                        }])
                                    }

                                }
                            }
                        },
                        "終了": async () => { fc.loop = false }
                    })
                    fc.loop = true
                    fc.selectingFuncName = "FFmpeg Converter-Convert"
                    await fc.view()
                },
                "プリセットの作成・編集": async () => {
                    const fc = new funcSelect({
                        "プリセット作成": async () => {
                            const preset = await getFunction.ffmpegInputPreset()
                            const name = preset.name
                            if (!name) {
                                console.log("名前を読み込めませんでした。")
                                return
                            }
                            convert.data.json.preset.push({
                                name: name,
                                ext: preset.ext,
                                tag: preset.tag
                            })
                        },
                        "プリセット編集": async () => {
                            if (!convert.data.json.preset[0]) {
                                console.log("プリセットがありません。追加してからもう一度やり直してください。")
                                return
                            }
                            const presetChoice = await choice((() => {
                                let presetNames: string[] = []
                                convert.data.json.preset.forEach(preset => {
                                    presetNames.push(preset.name ? preset.name : "")
                                })
                                return presetNames
                            })(), "プリセット一覧", "編集するプリセットを選択してください。")
                            if (!presetChoice) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            const fc = new funcSelect({
                                "タグを修正": async () => {
                                    const tagChoice = await choice((() => {
                                        let tags: string[] = []
                                        convert.data.json.preset[presetChoice - 1].tag.forEach(tag => tags.push(tag))
                                        return tags
                                    })(), "タグ一覧", "編集するタグを選択してください。", true)
                                    if (!tagChoice) {
                                        console.log("入力が間違ってるようです。もう一度やり直してください。")
                                        return
                                    }
                                    const tagName = await question("新しいタグ名を入力してください。エラー検知はしません。")
                                    if (tagChoice > (convert.data.json.preset[presetChoice - 1].tag.length - 1)) {
                                        convert.data.json.preset[presetChoice - 1].tag.push(tagName)
                                    } else {
                                        if (tagName === "") {
                                            delete convert.data.json.preset[presetChoice - 1].tag[tagChoice - 1]
                                        } else convert.data.json.preset[presetChoice - 1].tag[tagChoice - 1] = tagName
                                    }
                                },
                                "タグを削除": async () => {
                                    const tagChoice = await choice((() => {
                                        let tags: string[] = []
                                        convert.data.json.preset[presetChoice - 1].tag.forEach(tag => tags.push(tag))
                                        return tags
                                    })(), "タグ一覧", "削除するタグを選択してください。")
                                    if (!tagChoice) {
                                        console.log("入力が間違ってるようです。もう一度やり直してください。")
                                        return
                                    }
                                    convert.data.json.preset[presetChoice - 1].tag.splice(tagChoice - 1)
                                },
                                "プリセット名を変更": async () => {
                                    convert.data.json.preset[presetChoice - 1].name = await question("新しい名前を入力してください。")
                                },
                                "拡張子を変更": async () => {
                                    convert.data.json.preset[presetChoice - 1].ext = await question("拡張子を入力してください。")
                                },
                                "プリセットを削除": async () => {
                                    const permission = await booleanIO("プリセットを削除してもよろしいですか？元に戻すことは出来ません。")
                                    if (permission) convert.data.json.preset.splice(presetChoice - 1)
                                },
                                "戻る": async () => { }
                            })
                            fc.selectingFuncName = "FFmpeg Converter-TagEdit"
                            await fc.view()
                        },
                        "プリセット一覧を表示": async () => {
                            convert.data.json.preset.forEach(preset => {
                                console.log(
                                    "プリセット名: " + preset.name +
                                    "\nタグ: " + (() => {
                                        let tags = ""
                                        preset.tag.forEach(string => tags += string + " ")
                                        return tags
                                    })()
                                )
                            })
                        },
                        "終了": async () => { fc.loop = false }
                    })
                    fc.loop = true
                    fc.selectingFuncName = "FFmpeg Converter-Tag"
                    await fc.view()
                },
                "終了": async () => { }
            })
            fc.errorView = true
            fc.selectingFuncName = "FFmpeg Converter"
            await fc.view()
        },
        "棒読みちゃん読み上げ": async () => {
            const data = await dataIO.dataIO.initer("bouyomi")
            if (!data) return
            if (!data.json.temp) data.json.temp = undefined
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
            const client = new bouyomi.bouyomi(data.json.temp)
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
        "Folder Copy": async () => {
            console.log("このプログラムは想定外の入力に弱い傾向にあります。ご了承ください。")
            const beforePass = await dataIO.pathChecker(await question("移動元のフォルダを指定してください。"))
            if (!beforePass) {
                console.log("入力が間違ってるようです。もう一度やり直してください。")
                return
            }
            const afterPass = await dataIO.pathChecker(await question("移動先のフォルダを指定してください。"))
            if (!afterPass) {
                console.log("入力が間違ってるようです。もう一度やり直してください。")
                return
            }
            const list = await dataIO.fileLister(beforePass, { contain: true })
            console.log("移動元のフォルダには" + list.length + "個のファイルたちがあります。")
            if (await booleanIO("移動を開始しますか？")) {
                try {
                    let errorNum = 0
                    let skipNum = 0
                    const prog = new progress()
                    prog.view()
                    prog.total = list.length
                    for (let i = 0; i !== list.length; i++) {
                        const point = list[i].point
                        let outfolders = ""
                        for (let i = 0; i !== point.length; i++) {
                            outfolders += point[i] + "/"
                            if (!(await sfs.exsits(dataIO.slashPathStr(afterPass) + "/" + outfolders))) await sfs.mkdir(dataIO.slashPathStr(afterPass) + "/" + outfolders)
                        }
                        const fileName = list[i].filename + (list[i].extension ? ("." + list[i].extension) : "")
                        const copyDataTo = dataIO.slashPathStr(afterPass) + "/" + outfolders + fileName
                        prog.now = i
                        prog.viewStr = "移動中。スキップ[" + skipNum + "] エラー[" + errorNum + "]"
                        if (await sfs.exsits(list[i].pass + fileName)) {
                            await new Promise<void>(resolve => {
                                const Stream = fs.createReadStream(list[i].pass + fileName)
                                Stream.pipe(fs.createWriteStream(copyDataTo))
                                Stream.on("error", err => {
                                    errorNum++
                                })
                                Stream.on("end", () => { resolve() })
                            })
                        } else {
                            skipNum++
                        }
                    }
                    prog.view()
                    prog.viewed = false
                } catch (e) { }
            }
        },
        "プログラムテスト": async () => {
            console.log("これを使用してしまうと、強制終了する以外にプログラムを抜ける方法が無くなります。")
            const programs: {
                name: string,
                function: () => Promise<void>
            }[] = [{
                name: "passCheck",
                function: async () => {
                    const pass = await question("パスを入力")
                    const checked = await dataIO.pathChecker(pass)
                    console.log(checked ? dataIO.slashPathStr(checked) : undefined)
                }
            }]
            const programsName = (() => {
                const programsName = []
                for (let i = 0; i !== programs.length; i++) programsName.push(programs[i].name)
                return programsName
            })()
            const programChoice = await choice(programsName, "利用可能なプログラム", "実行したいプログラムを選択してください。")
            if (!programChoice) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            while (true) {
                await programs[programChoice - 1].function()
            }
        },
        "Cryptoによる暗号化": async () => {
            console.log("現在のところ未完成です。")
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
            if (!programChoice) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            const choiceProgramName = Object.keys(programs)[programChoice - 1]
            await programs[choiceProgramName]()
        },
        "Discord BotToken情報収集": async () => {
            const token = await question("Botのトークンを入力してください。")
            const {
                Client,
                Partials,
                GatewayIntentBits
            } = Discord
            const client = new Client({
                intents: [
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.Guilds
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
            client.on(Discord.Events.Error, err => {
                throw err
            })
            await client.login(token)
            await new Promise<void>(resolve => {
                client.on(Discord.Events.ClientReady, client => {
                    resolve()
                })
            })
            const guilds: {
                guildName: string
                guildId: string
                channels: {
                    channelName: string
                }[]
                users: {
                    displayName: string
                    nickName: string | null
                }[]
            }[] = []
            const data = (await client.guilds.fetch())
            data.map(data => {
                data
            })
            client.guilds.cache.map(guild => guilds.push({
                guildName: guild.name,
                guildId: guild.id,
                channels: (() => {
                    const channels: {
                        channelName: string
                    }[] = []
                    guild.channels.cache.map(channel => {
                        channels.push({
                            channelName: channel.name
                        })
                    })
                    return channels
                })(),
                users: (() => {
                    const users: {
                        displayName: string
                        nickName: string | null
                    }[] = []
                    guild.members.cache.map(member => {
                        users.push({
                            displayName: member.displayName,
                            nickName: member.nickname
                        })
                    })
                    return users
                })()
            }))
            client.destroy()
            console.log("情報が取得されました。")
            while (true) {
            }
        },
        "ファイル名リストtxt作成": async () => {
        },
        "Various Programsの状態・設定": async () => {
            const programs: { [programName: string]: () => Promise<void> } = {
                "プロセスのメモリ使用率": async () => {
                    console.log("メモリ使用率(bytes): " + process.memoryUsage.rss())
                },
                "キャッシュデータ等のパス設定": async () => {
                    const data = await sfs.exsits("passCache.json") ? JSON.parse(String(await sfs.readFile("passCache.json"))) : undefined
                    console.log("現在のキャッシュパス場所は" + (data ? data + "です。" : "設定されていません。"))
                    const pass = await dataIO.pathChecker(await question("キャッシュデータを保存するパスを入力してください。"))
                    if (!pass) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    await sfs.writeFile("passCache.json", JSON.stringify(dataIO.slashPathStr(pass)))
                    console.log(JSON.parse(String(await sfs.readFile("passCache.json"))) + "に変更されました。")
                }
            }
            const programChoice = await choice(Object.keys(programs), "設定・情報一覧", "実行したい操作を選択してください。")
            if (!programChoice) {
                console.log("入力が間違っているようです。最初からやり直してください。")
                return
            }
            const choiceProgramName = Object.keys(programs)[programChoice - 1]
            await programs[choiceProgramName]()
        },
        "Various Programsのシャットダウン": async () => {
            if (!await booleanIO("Various Programsをシャットダウンしてもよろしいでしょうか？")) return
            console.log("shareData内の常時実行プログラムを終了します。")
            vpManageClass.shutdown(shareData, {
                message: message => {
                    switch (message.type) {
                        case "discordBotExit": {
                            switch (message.status) {
                                case "start": console.log("Discord Botプログラムを終了しています。"); break
                                case "working": if (message.string) console.log("終了中のBot: " + message.string); break
                                case "end": console.log("Discord Botプログラムを全て終了しました。"); break
                            }
                            break
                        }
                        case "expressdExit": {
                            switch (message.status) {
                                case "start": console.log("expressdを終了しています。"); break
                                case "end": console.log("expressdが正常に終了しました。"); break
                            }
                            break
                        }
                        case "wait": {
                            switch (message.status) {
                                case "start": console.log("待機しています。"); break
                                case "end": console.log("待機時間が経過しました。"); break
                            }
                            break
                        }
                        case "exited": {
                            switch (message.status) {
                                case "start": console.log("終了処理の最終段階を行なっています。"); break
                                case "end": console.log("終了処理が完了しました。"); break
                            }
                            break
                        }
                    }
                }
            })
        }
    }, {
        errorView: true,
        message: {
            topMsg: "利用可能なプログラム",
            userToMsg: "実行したいプログラムを選択してください。"
        },
        selectingFuncName: "cuiIO",
        loop: true
    })
    await shareData.cuiIO.funcSelect.view()
}
/**
 * 関数実行に必要なデータの要求を自動で行う為の関数を集めました。
 * 操作の共通化を図っています。
 */
namespace getFunction {
    /**
     * 
     * @returns 
     */
    async function fileNameTextList() {
        const folderPath = await dataIO.pathChecker(await question("フォルダを入力してください。"))
        if (!folderPath) return console.log("フォルダが見つかりませんでした。")
        const dotignore = await booleanIO("「.」から始まるファイルを省略しますか？")
        const list = await dataIO.fileLister(folderPath, { invFIleIgnored: dotignore })
        let text = ""
        for (let i = 0; i !== list.length; i++) text += list[i].filename + "\n"
        const savePath = await dataIO.pathChecker(await question("テキストの保存先フォルダを入力してください。"))
        if (savePath) sfs.writeFile(dataIO.slashPathStr(savePath) + "/ファイル名リスト.txt", text)
        const folderContain = await booleanIO("フォルダ内にあるフォルダも含めますか？")
        const invFileIgnore = await booleanIO("最初に「.」が付くファイルを省略しますか？")
        const listerOptions = {
            macOSFileIgnote: false
        }
        if (!invFileIgnore) {
            listerOptions.macOSFileIgnote = await booleanIO("macOSに使用される「._」から始まるファイルを除外しますか？")
        }
        handyTool.fileNameTextList(folderPath, {
            contain: folderContain,
            extensionFilter: []
        })
    }
    export async function ffmpegInputPreset(option?: { tagonly?: boolean }): Promise<{ name?: string, ext: string, tag: string[] }> {
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
        const name = (option ? option.tagonly : false) ? undefined : await question("プリセット名を入力してください。名前は自由です。")
        return {
            name: name,
            ext: extension,
            tag: presets
        }
    }
}

export default cuiIO
