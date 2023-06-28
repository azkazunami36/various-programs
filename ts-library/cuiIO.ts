import fs from "fs"
import Discord from "discord.js"
import crypto from "crypto"

import sfs from "ts-library/fsSumwave"
import time from "ts-library/time"
import pathChecker from "ts-library/pathChecker"
import slashPathStr from "ts-library/slashPathStr"
import consoleUIPrograms from "ts-library/consoleUIPrograms"
import fileLister from "ts-library/fileLister"
import dataIO from "ts-library/dataIO"
import { discordRealTimeData } from "ts-library/discord-bot"
import sharpConvert from "ts-library/sharpConvert"
import kanaConvert from "ts-library/kanaConvert"
import discordBot from "ts-library/discord-bot"
import ffmpegConverter from "ts-library/ffmpegConverter"
import Bouyomi from "ts-library/bouyomi"
import splitExt from "./splitExt"

const { question, choice, booleanIO, progress } = consoleUIPrograms

export async function cuiIO(shareData: {
    discordBot?: {
        [botName: string]: discordRealTimeData
    }
}) {
    const programs: {
        name: string,
        function: () => Promise<void>
    }[] = [
            {
                name: "Image Resize",
                function: async () => {
                    const imageSize = Number(await question("指定の画像サイズを入力してください。"))
                    if (Number.isNaN(imageSize)) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    const beforePass = await pathChecker(await question("変換元の画像フォルダを指定してください。"))
                    if (beforePass === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    const afterPass = await pathChecker(await question("変換先のフォルダを指定してください。(空フォルダ推奨)"))
                    if (afterPass === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    const nameing = await choice(sharpConvert.type, "命名方法", "上記から命名方法を選択してください。")
                    if (nameing === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    const type = await choice(sharpConvert.extType, "拡張子一覧", "利用する拡張子と圧縮技術を選択してください。")
                    if (type === null) {
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
                    const fileList = await fileLister(beforePass, { contain: folderContain, extensionFilter: ["png", "jpg", "jpeg", "tiff"], invFIleIgnored: invFileIgnore, macosInvIgnored: listerOptions.macOSFileIgnote })
                    if (!fileList) {
                        console.log("ファイルの取得ができなかったようです。")
                        return
                    }
                    console.log(
                        "変換元パス: " + slashPathStr(beforePass) + "\n" +
                        "変換先パス: " + slashPathStr(afterPass) + "\n" +
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
                        convert.afterPass = afterPass[0]
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
                }
            },
            {
                name: "QWERTY Kana Convert",
                function: async () => console.log(kanaConvert(await question("変換元のテキストを入力してください。"), await booleanIO("QWERTYからかなに変換しますか？yで変換、nで逆変換します。")))
            },
            {
                name: "Discord Bot",
                function: async () => {
                    const data = await discordBot.data()
                    if (!data) {
                        console.log("データの準備ができませんでした。")
                        return
                    }
                    const botNames = Object.keys(data)
                    for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
                        const programs: { [programName: string]: () => Promise<void> } = {
                            "botを利用する": async () => {
                                if (botNames.length === 0) {
                                    console.log("botが存在しません。新規作成をしてから実行してください。")
                                    return
                                }
                                const botChoice = await choice(botNames, "bot一覧", "利用するbotを選択してください。")
                                if (botChoice === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    return
                                }
                                if (!shareData.discordBot) shareData.discordBot = {}
                                if (!shareData.discordBot[botNames[botChoice - 1]]) shareData.discordBot[botNames[botChoice - 1]] = {
                                    name: botNames[botChoice - 1]
                                }
                                const bot = await discordBot.initer(shareData.discordBot[botNames[botChoice - 1]])
                                for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
                                    const programs: { [programName: string]: () => Promise<void> } = {
                                        "起動/停止": async () => {
                                            await bot.login()
                                            console.log("ログインしました。停止機能はまだ未検証のため、2度目の起動は行わないでください。")
                                        },
                                        "設定": async () => {
                                            const programs: { [programName: string]: () => Promise<void> } = {
                                                "Tokenを設定する": async () => {
                                                    const token = await question("Tokenを入力してください。")
                                                    await bot.token(token)
                                                    console.log("設定が完了しました。")
                                                },
                                                "プログラムの選択": async () => {
                                                },
                                                "戻る": async () => { }
                                            }
                                            const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
                                            if (programChoice === null) {
                                                console.log("入力が間違っているようです。最初からやり直してください。")
                                                return
                                            }
                                            const choiceProgramName = Object.keys(programs)[programChoice - 1]
                                            await programs[choiceProgramName]()
                                        },
                                        "戻る": async () => {
                                            i++
                                        }
                                    }
                                    const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
                                    if (programChoice === null) {
                                        console.log("入力が間違っているようです。最初からやり直してください。")
                                        return
                                    }
                                    const choiceProgramName = Object.keys(programs)[programChoice - 1]
                                    await programs[choiceProgramName]()
                                }
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
                                i++
                            }
                        }
                        const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
                        if (programChoice === null) {
                            console.log("入力が間違っているようです。最初からやり直してください。")
                            return
                        }
                        const choiceProgramName = Object.keys(programs)[programChoice - 1]
                        await programs[choiceProgramName]()
                    }
                }
            },
            {
                name: "Time Class",
                function: async () => {
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
                }
            },
            {
                name: "FFmpeg Converter",
                function: async () => {
                    const data = await dataIO.initer("ffmpeg-converter")
                    if (data === null) return
                    if (!data.json.presets) {
                        data.json.presets = [
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
                        await data.save()
                    }
                    const presets: {
                        name: string,
                        ext: string,
                        tag: string[]
                    }[] = data.json.presets
                    const programs: { [programName: string]: () => Promise<void> } = {
                        "変換を開始する": async () => {
                            for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
                                const programs: { [programName: string]: () => Promise<void> } = {
                                    "パスを指定しプリセットで変換": async () => {
                                        const beforePass = await pathChecker(await question("元のソースパスを入力してください。"))
                                        if (beforePass === null) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        const afterPass = await pathChecker(await question("保存先のフォルダパスを入力してください。"))
                                        if (afterPass === null) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        const filename = await (async () => {
                                            let filename = await question("書き出し先のファイル名を入力してください。")
                                            if (filename === "") filename = splitExt(beforePass[beforePass.length - 1]).filename
                                            return filename
                                        })()
                                        const presetChoice = await choice((() => {
                                            let presetNames: string[] = []
                                            presets.forEach(preset => {
                                                presetNames.push(preset.name)
                                            })
                                            return presetNames
                                        })(), "プリセット一覧", "使用するプリセットを選択してください。")
                                        if (!presetChoice) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        console.log(
                                            "変換元: " + slashPathStr(beforePass) + "\n" +
                                            "変換先: " + slashPathStr(afterPass) + "/" + filename + "." + presets[presetChoice - 1].ext + "\n" +
                                            "タグ: " + (() => {
                                                let tags = ""
                                                presets[presetChoice - 1].tag.forEach(tag => tags += tag + " ")
                                                return tags
                                            })()
                                        )
                                        const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                                        if (permission) {
                                            const convert = new ffmpegConverter(slashPathStr(beforePass))
                                            convert.preset = presets[presetChoice - 1].tag
                                            console.log(convert.preset)
                                            if (await sfs.exsits(slashPathStr(afterPass))) {
                                                if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) return
                                            }
                                            await convert.convert(slashPathStr(afterPass) + "/" + filename + "." + presets[presetChoice - 1].ext)
                                            console.log("変換が完了しました！")
                                        }
                                    },
                                    "タグを手入力し、詳細な設定を自分で行う": async () => {
                                        const beforePass = await pathChecker(await question("元のソースパスを入力してください。"))
                                        if (beforePass === null) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        const afterPass = await pathChecker(await question("保存先のフォルダパスを入力してください。"))
                                        if (afterPass === null) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        const filename = await question("書き出し先のファイル名を入力してください。")
                                        const preset = await ffmpegConverter.inputPreset({ tagonly: true })
                                        console.log(
                                            "変換元: " + slashPathStr(beforePass) + "\n" +
                                            "変換先: " + slashPathStr(afterPass) + "/" + filename + "." + preset.ext + "\n" +
                                            "タグ: " + (() => {
                                                let tags = ""
                                                preset.tag.forEach(tag => tags += tag + " ")
                                                return tags
                                            })()
                                        )
                                        const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
                                        if (permission) {
                                            const convert = new ffmpegConverter(slashPathStr(beforePass))
                                            convert.preset = preset.tag
                                            console.log(convert.preset)

                                            if (await sfs.exsits(slashPathStr(afterPass))) {
                                                if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) return
                                            }
                                            await convert.convert(slashPathStr(afterPass) + "/" + filename + "." + preset.ext)
                                            console.log("変換が完了しました！")
                                        }
                                    },
                                    "複数ファイルを一括変換": async () => {
                                        const beforePass = await pathChecker(await question("元のフォルダパスを入力してください。"))
                                        if (beforePass === null) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        const afterPass = await pathChecker(await question("保存先のフォルダパスを入力してください。"))
                                        if (afterPass === null) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        const folderContain = await booleanIO("フォルダ内にあるフォルダも変換に含めますか？yで同意します。")
                                        const invFileIgnore = await booleanIO("最初に「.」が付くファイルを省略しますか？")
                                        const listerOptions = {
                                            macOSFileIgnote: false
                                        }
                                        if (!invFileIgnore) {
                                            listerOptions.macOSFileIgnote = await booleanIO("macOSに使用される「._」から始まるファイルを除外しますか？")
                                        }
                                        const fileList = await fileLister(beforePass, {
                                            contain: folderContain,
                                            extensionFilter: ["mp4", "mov", "mkv", "avi", "m4v", "mts", "mp3", "m4a", "wav", "opus", "caf", "aif", "aiff", "m4r", "alac", "flac", "3gp", "3g2", "webm", "aac", "hevc"],
                                            invFIleIgnored: invFileIgnore,
                                            macosInvIgnored: listerOptions.macOSFileIgnote
                                        })
                                        const presetChoice = await choice((() => {
                                            let presetNames: string[] = []
                                            presets.forEach(preset => {
                                                presetNames.push(preset.name)
                                            })
                                            return presetNames
                                        })(), "プリセット一覧", "使用するプリセットを選択してください。")
                                        if (!presetChoice) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        console.log(
                                            "変換元: " + slashPathStr(beforePass) + "\n" +
                                            "変換先: " + slashPathStr(afterPass) + "\n" +
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
                                                const convert = new ffmpegConverter(fileList[i].pass + "/" + fileList[i].filename + "." + fileList[i].extension)
                                                convert.preset = presets[presetChoice - 1].tag

                                                const convertedPass = slashPathStr(afterPass) + "/" + (await (async () => {
                                                    let outfolders = ""
                                                    const point = fileList[i].point
                                                    for (let i = 0; i !== point.length; i++) {
                                                        outfolders += point[i] + "/"
                                                        if (!(await sfs.exsits(slashPathStr(afterPass) + "/" + outfolders))) await sfs.mkdir(slashPathStr(afterPass) + "/" + outfolders)
                                                    }
                                                    return outfolders
                                                })()) + fileList[i].filename + "." + presets[presetChoice - 1].ext

                                                if (await sfs.exsits(convertedPass)) {
                                                    progressd.viewed = false
                                                    if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) continue
                                                    progressd.view()
                                                }

                                                await convert.convert(convertedPass)
                                            }
                                            progressd.now = fileList.length
                                            progressd.view()
                                            progressd.viewed = false
                                        }
                                    },
                                    "終了": async () => {
                                        i++
                                    }
                                }
                                const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
                                if (programChoice === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    return
                                }
                                const choiceProgramName = Object.keys(programs)[programChoice - 1]
                                await programs[choiceProgramName]()
                            }
                        },
                        "プリセットの作成・編集": async () => {
                            for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
                                const programs: { [programName: string]: () => Promise<void> } = {
                                    "プリセット作成": async () => {
                                        const preset = await ffmpegConverter.inputPreset()
                                        const name = preset.name
                                        if (name === null) {
                                            console.log("名前を読み込めませんでした。")
                                            return
                                        }
                                        presets.push({
                                            name: name,
                                            ext: preset.ext,
                                            tag: preset.tag
                                        })
                                        await data.save()
                                    },
                                    "プリセット編集": async () => {
                                        if (!presets[0]) {
                                            console.log("プリセットがありません。追加してからもう一度やり直してください。")
                                            return
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
                                            return
                                        }
                                        const programs: { [programName: string]: () => Promise<void> } = {
                                            "タグを修正": async () => {
                                                const tagChoice = await choice((() => {
                                                    let tags: string[] = []
                                                    presets[presetChoice - 1].tag.forEach(tag => tags.push(tag))
                                                    return tags
                                                })(), "タグ一覧", "編集するタグを選択してください。", true)
                                                if (!tagChoice) {
                                                    console.log("入力が間違ってるようです。もう一度やり直してください。")
                                                    return
                                                }
                                                const tagName = await question("新しいタグ名を入力してください。エラー検知はしません。")
                                                if (tagChoice > (presets[presetChoice - 1].tag.length - 1)) {
                                                    presets[presetChoice - 1].tag.push(tagName)
                                                } else {
                                                    if (tagName === "") {
                                                        delete presets[presetChoice - 1].tag[tagChoice - 1]
                                                    } else presets[presetChoice - 1].tag[tagChoice - 1] = tagName
                                                }
                                            },
                                            "タグを削除": async () => {
                                                const tagChoice = await choice((() => {
                                                    let tags: string[] = []
                                                    presets[presetChoice - 1].tag.forEach(tag => tags.push(tag))
                                                    return tags
                                                })(), "タグ一覧", "削除するタグを選択してください。")
                                                if (!tagChoice) {
                                                    console.log("入力が間違ってるようです。もう一度やり直してください。")
                                                    return
                                                }
                                                presets[presetChoice - 1].tag.splice(tagChoice - 1)
                                            },
                                            "プリセット名を変更": async () => {
                                                presets[presetChoice - 1].name = await question("新しい名前を入力してください。")
                                            },
                                            "拡張子を変更": async () => {
                                                presets[presetChoice - 1].ext = await question("拡張子を入力してください。")
                                            },
                                            "プリセットを削除": async () => {
                                                const permission = await booleanIO("プリセットを削除してもよろしいですか？元に戻すことは出来ません。")
                                                if (permission) presets.splice(presetChoice - 1)
                                            },
                                            "戻る": async () => { return }
                                        }
                                        const programChoice = await choice(Object.keys(programs), "機能一覧", "利用する機能を選択してください。")
                                        if (programChoice === null) {
                                            console.log("入力が間違っているようです。最初からやり直してください。")
                                            return
                                        }
                                        const choiceProgramName = Object.keys(programs)[programChoice - 1]
                                        await programs[choiceProgramName]()
                                        await data.save()
                                    },
                                    "プリセット一覧を表示": async () => {
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
                                    },
                                    "終了": async () => {
                                        i++
                                    },
                                }
                                const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
                                if (programChoice === null) {
                                    console.log("入力が間違っているようです。最初からやり直してください。")
                                    return
                                }
                                const choiceProgramName = Object.keys(programs)[programChoice - 1]
                                await programs[choiceProgramName]()
                            }
                        },
                        "終了": async () => {
                            return
                        }
                    }
                    const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
                    if (programChoice === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    const choiceProgramName = Object.keys(programs)[programChoice - 1]
                    await programs[choiceProgramName]()
                }
            },
            {
                name: "棒読みちゃん読み上げ",
                function: async () => {
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
                }
            },
            {
                name: "Folder Copy",
                function: async () => {
                    console.log("このプログラムは想定外の入力に弱い傾向にあります。ご了承ください。")
                    const beforePass = await pathChecker(await question("移動元のフォルダを指定してください。"))
                    if (!beforePass) {
                        console.log("入力が間違ってるようです。もう一度やり直してください。")
                        return
                    }
                    const afterPass = await pathChecker(await question("移動先のフォルダを指定してください。"))
                    if (!afterPass) {
                        console.log("入力が間違ってるようです。もう一度やり直してください。")
                        return
                    }
                    const list = await fileLister(beforePass, { contain: true })
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
                                    if (!(await sfs.exsits(slashPathStr(afterPass) + "/" + outfolders))) await sfs.mkdir(slashPathStr(afterPass) + "/" + outfolders)
                                }
                                const fileName = list[i].filename + (list[i].extension ? ("." + list[i].extension) : "")
                                const copyDataTo = slashPathStr(afterPass) + "/" + outfolders + fileName
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
                }
            },
            {
                name: "プログラムテスト",
                function: async () => {
                    console.log("これを使用してしまうと、強制終了する以外にプログラムを抜ける方法が無くなります。")
                    const programs: {
                        name: string,
                        function: () => Promise<void>
                    }[] = [{
                        name: "passCheck",
                        function: async () => {
                            const pass = await question("パスを入力")
                            const checked = await pathChecker(pass)
                            console.log(checked ? slashPathStr(checked) : null)
                        }
                    }]
                    const programsName = (() => {
                        const programsName = []
                        for (let i = 0; i !== programs.length; i++) programsName.push(programs[i].name)
                        return programsName
                    })()
                    const programChoice = await choice(programsName, "利用可能なプログラム", "実行したいプログラムを選択してください。")
                    if (programChoice === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    while (true) {
                        await programs[programChoice - 1].function()
                    }
                }
            },
            {
                name: "Cryptoによる暗号化",
                function: async () => {
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
                    if (programChoice === null) {
                        console.log("入力が間違っているようです。最初からやり直してください。")
                        return
                    }
                    const choiceProgramName = Object.keys(programs)[programChoice - 1]
                    await programs[choiceProgramName]()
                }
            },
            {
                name: "Discord BotToken情報収集",
                function: async () => {
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
                }
            },
            {
                name: "Various Programsの状態・設定",
                function: async () => {
                    const programs: { [programName: string]: () => Promise<void> } = {
                        "プロセスのメモリ使用率": async () => {
                            console.log("メモリ使用率(bytes): " + process.memoryUsage.rss())
                        },
                        "キャッシュデータ等のパス設定": async () => {
                            const data = await sfs.exsits("passCache.json") ? JSON.parse(String(await sfs.readFile("passCache.json"))) : null
                            console.log("現在のキャッシュパス場所は" + (data ? data + "です。" : "設定されていません。"))
                            const pass = await pathChecker(await question("キャッシュデータを保存するパスを入力してください。"))
                            if (pass === null) {
                                console.log("入力が間違っているようです。最初からやり直してください。")
                                return
                            }
                            await sfs.writeFile("passCache.json", JSON.stringify(slashPathStr(pass)))
                            console.log(JSON.parse(String(await sfs.readFile("passCache.json"))) + "に変更されました。")
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
        ]
    console.log(process.env.npm_package_name + " v" + process.env.npm_package_version)
    while (true) {
        const programsName = (() => {
            const programsName = []
            for (let i = 0; i !== programs.length; i++) programsName.push(programs[i].name)
            return programsName
        })()
        const programChoice = await choice(programsName, "利用可能なプログラム", "実行したいプログラムを選択してください。")
        if (programChoice === null) {
            console.log("入力が間違っているようです。最初からやり直してください。")
            continue
        }
        const choiceProgramName = programsName[programChoice - 1]
        console.log(choiceProgramName + "を起動します。")
        try {
            await programs[programChoice - 1].function()
        } catch (e) {
            console.log("プログラム「" + choiceProgramName + "が以下の理由で異常終了したようです。\n", e)
        }
        console.log(choiceProgramName + "が終了しました。")
    }
}
export default cuiIO
