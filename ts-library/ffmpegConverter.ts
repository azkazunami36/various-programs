import EventEmitter from "events"
import ffmpeg from "fluent-ffmpeg"

import dataIO from "./dataIO"

export interface ffmpegConverterEvents {
    ready: [void]
    end: [void]
    progress: [any]
    error: [Error]
}
export declare interface ffmpegConverter {
    on<K extends keyof ffmpegConverterEvents>(s: K, listener: (...args: ffmpegConverterEvents[K]) => any): this
    emit<K extends keyof ffmpegConverterEvents>(eventName: K, ...args: ffmpegConverterEvents[K]): boolean
}
interface workingQueueList {
    /** 変換元 */
    oldPass: string[]
    /** 変換先 */
    newPass: string[]
    /** この動画に利用されるプリセット */
    preset: preset
}
interface preset {
    /** プリセット名です。 */
    name: string | null
    /** このプリセットで使われる拡張子です。 */
    ext: string
    /** タグ一覧です。 */
    tag: string[]
}
interface ffmpegdataIOextJSON extends dataIO.dataIO {
    json: {
        /** ユーザーが保存しているプリセットです。 */
        preset: preset[]
    }
}
/**
 * # FFmpeg Converter
 * FFmpegを更に利用しやすくしたクラスです。
 */
export class ffmpegConverter extends EventEmitter {
    #ffmpeg: ffmpeg.FfmpegCommand
    data: ffmpegdataIOextJSON
    constructor() {
        (async () => { this.emit("ready", undefined) })()
        super()
    }
    static async initer() {
        const convert = new ffmpegConverter()
        await new Promise<void>(resolve => convert.on("ready", () => resolve()))
        return convert
    }
    /** 主にFFmpeg Converterの初期化時に最初に置かれるプリセット一覧です。 */
    static presetSample = [
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
    /** 変換中かどうか確認できます。 */
    #converting = false
    /** 変換する動画のリストです。 */
    #workList: workingQueueList[]
    /** 変換するために必要なデータを入力すると、自動で変換を開始します。 */
    async convert(list: workingQueueList[]) {
        this.#workList.push(...list)
        if (!this.#converting) this.#convert()
    }
    async #convert() {
        if (this.#workList[0]) {
            await new Promise<void>(resolve => {
                this.#converting = true
                this.#ffmpeg = ffmpeg(dataIO.slashPathStr(this.#workList[0].oldPass))
                this.#ffmpeg.addOptions(this.#workList[0].preset.tag)
                this.#ffmpeg.save(dataIO.slashPathStr(this.#workList[0].newPass))
                this.#ffmpeg.on("end", () => { this.emit("end", undefined); resolve() })
                this.#ffmpeg.on("progress", progress => { this.emit("progress", progress) })
                this.#ffmpeg.on("error", err => { this.emit("error", err) })
            })
        } else this.#converting = false
    }
    /** あまり使わないように。意味がありません。 */
    addInput(pass: string) {
        this.#ffmpeg.addInput(pass)
    }
}
export default ffmpegConverter
