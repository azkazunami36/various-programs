import EventEmitter from "events"
import ffmpeg from "fluent-ffmpeg"

import consoleUIPrograms from "./consoleUIPrograms"

const { question, booleanIO } = consoleUIPrograms
export interface ffmpegConverterEvents {
    end: [void]
    progress: [any]
    error: [Error]
}
export declare interface ffmpegConverter {
    on<K extends keyof ffmpegConverterEvents>(s: K, listener: (...args: ffmpegConverterEvents[K]) => any): this
    emit<K extends keyof ffmpegConverterEvents>(eventName: K, ...args: ffmpegConverterEvents[K]): boolean
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
            this.#ffmpeg.on("end", () => {
                resolve()
                this.emit("end", undefined)
            })
            this.#ffmpeg.on("progress", progress => {
                console.log(progress)
                this.emit("progress", progress)
            })
            this.#ffmpeg.on("error", err => {
                console.log(err)
            })
        })
    }
    addInput(pass: string) {
        this.#ffmpeg.addInput(pass)
    }
    static async inputPreset(option?: { tagonly?: boolean }): Promise<{ name: string | null, ext: string, tag: string[] }> {
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
export default ffmpegConverter